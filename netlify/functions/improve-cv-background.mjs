import { createClient } from '@supabase/supabase-js';

import {
  AI_JOB_STAGE_COVER_LETTER,
  AI_PAYWALL_CODES,
  COVER_LETTER_GRANULARITY,
  VERTEX_CONFIG,
} from './lib/ai/constants.js';
import {
  COVER_LETTER_FAILURES,
  generateCoverLetter,
  isCoverLetterRetryable,
} from './lib/ai/coverLetter.js';
import { logUsageDebug } from './lib/ai/debug/debugLogger.js';
import { getAIResponse } from './lib/ai/debug/engine.js';
import { WHOLE_CV_SECTIONS } from './lib/ai/definitions.js';
import { getVertexResponseSchema, requiredSectionsFor } from './lib/ai/generator.js';
import { logAIWorkflow } from './lib/ai/logger.js';
import {
  REQUEST_REFUSALS,
  aggregateAIMode,
  aggregateAITarget,
  mockAllowed,
  validateImproveRequest,
} from './lib/ai/request.js';
import {
  RESPONSE_FAILURES,
  assertNotTruncated,
  assertTranslationComplete,
  dropTailoringFactChanges,
  restoreDroppedSkillKeywords,
} from './lib/ai/responseChecks.js';
import { createUsageHold } from './lib/ai/usage.js';
import {
  dropUnchangedSkillsReorg,
  hasActualChanges,
  isReorgResult,
  mergeImprovedIntoCv,
  projectForWholeCv,
  sanitizeResumeData,
} from './lib/ai/utils.js';
import { describeDbError, describeError } from './lib/describe-error.js';
import { describeJsonParseError } from './lib/json-parse-error.js';

// Configuration
const { MODEL } = VERTEX_CONFIG;

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const handler = async (event) => {
  let body = {};
  let jobId = null;
  let user = null;
  let profile = null;
  /** The allowance slots this job holds; the `catch` gives back any unsettled. */
  let hold = null;

  // Define logging context early to capture prompts even on failure
  let aiLogContext = null;

  try {
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      console.warn('[Improve CV] Unauthorized: Missing Authorization header.');
      throw new Error('UNAUTHORIZED');
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      console.warn('[Improve CV] Invalid Token:', authError?.message || 'User not found');
      throw new Error('INVALID_TOKEN');
    }
    user = authUser;

    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      console.error(
        'Security: Failed to parse request body',
        describeJsonParseError(e, event.body),
      );
      throw new Error('INVALID_REQUEST_JSON');
    }
    jobId = body.jobId || body.job_id || null;

    const {
      activeTarget,
      mode,
      resumeData,
      instructions,
      currentLang,
      targetLang,
      allowReorg,
      mock: requestedMock,
    } = body;
    const mock = Boolean(requestedMock) && mockAllowed();
    const { target, letterRequest, isLetterOnly, translatesWholeCv } = validateImproveRequest(
      body,
      jobId,
    );
    const wantsCoverLetter = Boolean(letterRequest);
    // ⚠️ A letter-only run has TWO callers handing it different CVs (2026-09-08).
    // The retry's CV is the one call 1 already tailored; the Cover Letter
    // section's "write from the ad" sends the user's own, never tailored. Anything
    // below that leans on "call 1 already ran" is wrong for the second —
    // `ops/AI_LOGIC.md` carries the reasoning.

    // 1. Permission & Limit Check
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profileData) throw new Error('Profile not found');
    profile = profileData;

    const isPro =
      (profile.premium_until && new Date(profile.premium_until) > new Date()) || Boolean(mock);
    const { type: granularity, sectionKey: id } = target;

    let requestType = 'cv_item_optimize';
    if (granularity === 'cv') requestType = 'cv_full_optimize';
    if (granularity === 'section') requestType = 'cv_section_optimize';

    // AI is a Pro-only capability. There is no free-tier allowance and no
    // per-request top-up to fall back on, so a non-Pro caller is rejected
    // outright and the frontend shows the paywall.
    if (!isPro) {
      logUsageDebug(`[BG] User ${user.id} is FREE tier. Rejecting with PREMIUM_REQUIRED.`);
      throw new Error(AI_PAYWALL_CODES.PREMIUM_REQUIRED);
    }

    // One slot per call, reserved before it and settled only after its success,
    // so a job that tailors the CV and fails to draft the letter costs 1, not 2.
    hold = createUsageHold(supabase, user.id);
    // A letter-only run's one call is the letter, so its slot is reserved here too.
    const firstSlot = await hold.reserve(isLetterOnly ? 'cover_letter_gen' : requestType);
    if (!firstSlot) {
      logUsageDebug(`[BG] Failing with LIMIT_REACHED for user ${user.id}`);
      throw new Error(AI_PAYWALL_CODES.LIMIT_REACHED);
    }

    // `'trial'` stays in `package_type` for historical rows; nothing writes it now.
    const packageUsed = 'pro';

    const billCall = async ({
      reservationId,
      usage,
      latency,
      finishReason,
      safetyRatings,
      isNoOp,
      call,
    }) => {
      await hold.settle(reservationId, {
        usage,
        details: {
          is_noop: isNoOp,
          latency_ms: latency,
          is_mock: Boolean(mock),
          finish_reason: finishReason,
          safety_ratings: safetyRatings,
          context: {
            granularity: call,
            mode: aggregateAIMode(mode),
            activeTarget: aggregateAITarget(activeTarget),
          },
        },
      });
    };

    // 2. Vertex AI Request
    // `meta` off a whole CV, then the keys no response can return (lib/ai/utils.js).
    // The request body is the only unsanitized copy: everything below, the mock
    // included, reads this one.
    const isWholeCvObject =
      granularity === 'cv' &&
      resumeData &&
      typeof resumeData === 'object' &&
      !Array.isArray(resumeData);
    const sanitizedResumeData = sanitizeResumeData(
      isWholeCvObject ? (({ meta, ...rest }) => rest)(resumeData) : resumeData,
    );

    aiLogContext = {
      granularity,
      mode,
      activeTarget,
      systemPrompt: '',
      userPrompt: '',
      inputData: sanitizedResumeData,
      responseSchema: null,
    };

    /**
     * Call 1. Skipped by a letter-only run, so `sanitizedResumeData` is what
     * call 2 drafts from.
     *
     * ⚠️ That CV is NOT necessarily tailored. On the retry it is — the job's
     * call 1 already ran and was already billed. On the Cover Letter
     * section's entry point it is the user's own untailored CV (2026-09-08).
     * Both are the CV the letter quotes; neither is rewritten here.
     */
    let parsedContent = null;
    let isCvNoOp = true;
    // One reorg decision, sent to the client and used for the letter's merge.
    let isReorg = false;

    if (!isLetterOnly) {
      const isTranslating = targetLang && targetLang !== currentLang;
      const requiredSections = granularity === 'cv' ? requiredSectionsFor(sanitizedResumeData) : [];

      const targetKey = id;
      const targetKeys = granularity === 'cv' ? WHOLE_CV_SECTIONS : [targetKey];
      const responseSchema = getVertexResponseSchema(
        granularity,
        targetKeys,
        allowReorg,
        requiredSections,
        isTranslating,
      );
      aiLogContext.responseSchema = responseSchema;

      // What call 1 sends, and so what its log records: the letter is not a
      // whole-CV member, and call 2 still reads the full `sanitizedResumeData`.
      const callInput =
        granularity === 'cv' ? projectForWholeCv(sanitizedResumeData) : sanitizedResumeData;
      aiLogContext.inputData = callInput;

      const {
        improvedContent,
        data,
        latency,
        candidate,
        systemPrompt: usedSystemPrompt,
        userPrompt: usedUserPrompt,
      } = await getAIResponse({
        mock,
        mode,
        activeTarget,
        currentLang,
        targetLang,
        allowReorg,
        instructions,
        sanitizedResumeData: callInput,
        responseSchema,
        granularity,
      });

      aiLogContext.systemPrompt = usedSystemPrompt || '';
      aiLogContext.userPrompt = usedUserPrompt || '';

      assertNotTruncated(candidate);

      if (!improvedContent) {
        throw new Error('No improvement suggestions generated');
      }

      try {
        parsedContent = JSON.parse(improvedContent);
      } catch (e) {
        // Never log the raw content or the error itself: both can carry CV text.
        console.error('AI Response Parse Error:', describeJsonParseError(e, improvedContent));
        throw new Error('INVALID_AI_RESPONSE_FORMAT');
      }

      // Before the grade, so it grades — and bills — what the user will get.
      if (translatesWholeCv) {
        assertTranslationComplete({ source: callInput, improved: parsedContent, allowReorg });
      }
      // A translated title or keyword is not a swap or a drop, so neither runs then.
      if (mode === 'job_description' && !isTranslating) {
        const droppedFacts =
          granularity === 'cv'
            ? dropTailoringFactChanges({ source: callInput, improved: parsedContent })
            : 0;
        const restoredKeywords = restoreDroppedSkillKeywords({
          granularity,
          sectionKey: id,
          source: callInput,
          improved: parsedContent,
          allowReorg,
        });
        if (droppedFacts || restoredKeywords) {
          console.warn(
            `[Tailoring] dropped ${droppedFacts} fact changes, restored ${restoredKeywords} skill keywords`,
          );
        }
      }

      isCvNoOp = !hasActualChanges({
        granularity,
        source: sanitizedResumeData,
        improved: parsedContent,
        allowReorg,
        id,
      });
      isReorg = isReorgResult({ granularity, id, improved: parsedContent, allowReorg });
      ({ improved: parsedContent, isReorg } = dropUnchangedSkillsReorg({
        granularity,
        source: sanitizedResumeData,
        improved: parsedContent,
        isReorg,
      }));

      const cvUsage = {
        tokens_input: data.usageMetadata?.promptTokenCount || 0,
        tokens_output: data.usageMetadata?.candidatesTokenCount || 0,
      };

      // 2.5 Log Workflow (Local-only via logger utility) - SUCCESS
      logAIWorkflow({
        ...aiLogContext,
        improvedContent: parsedContent,
        metadata: {
          usage: cvUsage,
          latency_ms: latency,
          model: MODEL,
          finishReason: candidate?.finishReason || 'UNKNOWN',
          isNoOp: isCvNoOp,
          package_used: packageUsed,
        },
      });

      // 3. Post-Success: Log Usage
      await billCall({
        reservationId: firstSlot,
        usage: cvUsage,
        latency,
        finishReason: candidate?.finishReason || 'UNKNOWN',
        safetyRatings: candidate?.safetyRatings || [],
        isNoOp: isCvNoOp,
        call: granularity,
      });
    }

    /**
     * 4. Call 2 — the letter, on the CV call 1 just produced.
     *
     * ⚠️ Everything below is a NOTICE on a successful outcome. A letter that
     * fails must never discard the tailoring the user came for, and must never
     * bill a second slot.
     */
    let letterOutcome = null;
    if (wantsCoverLetter) {
      if (granularity !== 'cv') {
        // Only a whole-CV run has a CV to echo; a letter beside a section run is
        // a notice. A letter-only run here is refused earlier, in request.js.
        letterOutcome = { error: COVER_LETTER_FAILURES.BAD_REQUEST };
      } else {
        // The first slot paid for one call. The letter takes its own, so the
        // pair cannot bill past the daily limit, and a failed reservation is a
        // notice like any letter failure, never the run.
        let letterSlot = isLetterOnly ? firstSlot : null;
        if (!isLetterOnly) {
          try {
            letterSlot = await hold.reserve('cover_letter_gen');
            if (!letterSlot) letterOutcome = { error: COVER_LETTER_FAILURES.ALLOWANCE_SPENT };
          } catch (reserveErr) {
            console.error(
              '[Cover letter] Reservation failed, continuing:',
              describeError(reserveErr),
            );
            letterOutcome = { error: COVER_LETTER_FAILURES.CALL_FAILED };
          }
        }

        if (!letterOutcome) {
          /**
           * The stage marker, written before the call it announces. The
           * poller does `select('*')` every 2 s and reads `result.stage` while
           * `processing`, so the client can head its status view with call 2
           * instead of leaving the user watching one undifferentiated state.
           *
           * ⚠️ Never on a letter-only re-run: that run has no call 1, and the
           * client already knows it asked for a letter alone.
           *
           * ⚠️ A progress write that fails must cost a line of copy, never the
           * run — the same precedent as the letter's usage row. Both arms are
           * needed: PostGREST RESOLVES with `{ error }` on a 4xx/5xx or an RLS
           * refusal and throws only on a transport failure, so a bare try/catch
           * would swallow the likelier half with no log at all.
           */
          if (!isLetterOnly) {
            try {
              const { error: stageError } = await supabase
                .from('ai_jobs')
                .update({ result: { stage: AI_JOB_STAGE_COVER_LETTER } })
                .eq('id', jobId)
                .eq('user_id', user.id);
              if (stageError) {
                console.error(
                  '[Cover letter] Stage marker rejected, continuing:',
                  describeDbError(stageError),
                );
              }
            } catch (stageErr) {
              console.error(
                '[Cover letter] Stage marker failed, continuing:',
                describeError(stageErr),
              );
            }
          }

          letterOutcome = await generateCoverLetter({
            getAIResponse,
            tailoredCv: isLetterOnly
              ? sanitizedResumeData
              : mergeImprovedIntoCv(sanitizedResumeData, parsedContent, { isReorg }),
            request: letterRequest,
            mock,
          });

          logAIWorkflow({
            granularity: COVER_LETTER_GRANULARITY,
            mode,
            activeTarget,
            systemPrompt: letterOutcome.systemPrompt || '',
            userPrompt: letterOutcome.userPrompt || '',
            inputData: letterOutcome.projection,
            responseSchema: null,
            improvedContent: letterOutcome.letter,
            metadata: {
              usage: letterOutcome.usage,
              latency_ms: letterOutcome.latency,
              model: MODEL,
              finishReason: letterOutcome.finishReason,
              package_used: packageUsed,
            },
            ...(letterOutcome.error ? { error: new Error(letterOutcome.error) } : {}),
          });

          if (!letterOutcome.letter) {
            await hold.release(letterSlot);
          } else {
            // ⚠️ The CV outranks the row: a settle error here must not fail the
            // job. The unsettled slot is held until its reservation expires.
            try {
              await billCall({
                reservationId: letterSlot,
                usage: letterOutcome.usage,
                latency: letterOutcome.latency,
                finishReason: letterOutcome.finishReason,
                safetyRatings: letterOutcome.safetyRatings,
                isNoOp: false,
                call: COVER_LETTER_GRANULARITY,
              });
            } catch (billingErr) {
              console.error(
                '[Cover letter] Usage row failed, keeping the result:',
                describeError(billingErr),
              );
            }
          }
        }
      }

      if (letterOutcome.error) {
        console.warn(`[Cover letter] ${letterOutcome.error} for user ${user.id}`);
      }
    }

    const letter = letterOutcome?.letter || null;

    // Update job as completed
    await supabase
      .from('ai_jobs')
      .update({
        status: 'completed',
        result: {
          ...parsedContent,
          // The letter rests in `ai_jobs.result` like every result, in the
          // object-section shape Improve already returns, so the whole-CV apply
          // path writes it back with no branch of its own.
          ...(letter ? { coverLetter: { improvedFields: letter } } : {}),
          ...(letterOutcome?.error
            ? {
                coverLetterError: letterOutcome.error,
                coverLetterRetryable: isCoverLetterRetryable(letterOutcome.error),
              }
            : {}),
          // ⚠️ "Nothing to show you", not "the CV is unchanged". A failed letter
          // has a notice to show, and `no_changes` is the one client branch that
          // renders none — it answers with a green "no changes were needed"
          // panel instead, which on a letter-only retry misreports the whole
          // outcome.
          isNoOp: isCvNoOp && !letter && !letterOutcome?.error,
          // Read off the response's shape, never the request: an item-shaped
          // answer to a reorg request was graded and merged as items.
          isReorg: !isCvNoOp && isReorg,
        },
      })
      .eq('id', jobId)
      .eq('user_id', user.id);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Job completed',
    };
  } catch (err) {
    const isBusinessError = [...Object.values(AI_PAYWALL_CODES), ...REQUEST_REFUSALS].includes(
      err.message,
    );

    if (RESPONSE_FAILURES.includes(err.message)) {
      console.warn(`[AI-RESPONSE] ${err.message} for user ${user?.id || 'unknown'}`);
    } else if (!isBusinessError) {
      console.error('Improve CV Error:', describeError(err));
    } else {
      console.warn(`[AI-REJECTION] ${err.message} for user ${user?.id || 'unknown'}`);
    }

    // Log Workflow (Local-only via logger utility) - FAILURE
    if (aiLogContext) {
      logAIWorkflow({
        ...aiLogContext,
        error: err,
      });
    }

    // A failed job bills no call that did not succeed.
    await hold?.releaseAll();

    // Only the authenticated owner's job is touched; an unauthenticated
    // failure writes nothing.
    if (jobId && user) {
      // Prioritize updating job status so UI stops polling
      try {
        await supabase
          .from('ai_jobs')
          .update({
            status: 'failed',
            error: err.message || 'Unknown error',
          })
          .eq('id', jobId)
          .eq('user_id', user.id);
      } catch (jobUpdateErr) {
        console.error('CRITICAL: Could not update ai_jobs status:', describeError(jobUpdateErr));
      }
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
