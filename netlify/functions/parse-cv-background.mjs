import { createClient } from '@supabase/supabase-js';

import {
  AI_MAX_PAYLOAD_CHARS,
  AI_MAX_UPLOAD_BYTES,
  AI_PAYWALL_CODES,
  VERTEX_CONFIG,
} from './lib/ai/constants.js';
import { getAIResponse } from './lib/ai/debug/engine.js';
import { PARSING_COMPOSITION } from './lib/ai/definitions.js';
import { getParsingSchema } from './lib/ai/generator.js';
import { logAIWorkflow } from './lib/ai/logger.js';
import { aggregateAIMode, mockAllowed } from './lib/ai/request.js';
import { RESPONSE_FAILURES, assertNotTruncated } from './lib/ai/responseChecks.js';
import { createUsageHold } from './lib/ai/usage.js';
import { maxBase64CharsFor } from './lib/ai/utils.js';
import { describeError } from './lib/describe-error.js';
import { describeJsonParseError } from './lib/json-parse-error.js';

const { MODEL } = VERTEX_CONFIG;
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const handler = async (event) => {
  let body = {};
  let jobId = null;
  let user = null;
  let profile = null;
  /** The allowance slot this job holds; the `catch` gives it back if unsettled. */
  let hold = null;

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    console.warn('[Parse CV] Method Not Allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let aiLogContext = null;

  try {
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      console.warn('[Parse CV] Unauthorized: Missing Authorization header.');
      throw new Error('UNAUTHORIZED');
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !authUser) {
      console.warn('[Parse CV] Invalid Token:', authError?.message || 'User not found');
      throw new Error('INVALID_TOKEN');
    }
    user = authUser;

    const parsedBody = (() => {
      try {
        return JSON.parse(event.body || '{}');
      } catch (e) {
        console.error(
          'Security: Failed to parse request body',
          describeJsonParseError(e, event.body),
        );
        throw new Error('INVALID_REQUEST_JSON');
      }
    })();
    body = parsedBody;
    jobId = body.jobId || body.job_id || null;

    if (!jobId) throw new Error('MISSING_PARAMS');

    // Retrieve payload details from the database job record
    const { data: jobData, error: jobError } = await supabase
      .from('ai_jobs')
      .select('payload')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (jobError || !jobData || !jobData.payload) {
      throw new Error('JOB_PAYLOAD_NOT_FOUND');
    }

    const {
      fileBase64,
      fileType,
      text,
      mode,
      instructions,
      currentLang,
      targetLang,
      allowReorg,
      mock: payloadMock,
    } = jobData.payload;

    const mock = Boolean(payloadMock || body.mock) && mockAllowed();

    // 0. Safety Check: Max upload.
    //
    // ⚠️ `useAIImportFile.ts:16` already refuses files over 5 MB, but that is a
    // file-picker affordance — a direct POST never runs it, and this payload
    // arrives from `ai_jobs.payload`, which the client wrote. This is the copy
    // that binds.
    //
    // Compared against the base64 LENGTH, derived as x4/3, rather than the
    // decoded byte count: decoding it to measure would allocate the very
    // payload the cap exists to refuse. The slack covers padding and any
    // `data:` prefix.
    const maxBase64Chars = maxBase64CharsFor(AI_MAX_UPLOAD_BYTES);
    if (fileBase64 && fileBase64.length > maxBase64Chars) {
      console.error(
        `Abuse attempt: upload ${fileBase64.length} b64 chars exceeds ${maxBase64Chars}`,
      );
      throw new Error('PAYLOAD_TOO_LARGE');
    }
    if (text && text.length > AI_MAX_PAYLOAD_CHARS) {
      console.error(`Abuse attempt: extracted text ${text.length} exceeds ${AI_MAX_PAYLOAD_CHARS}`);
      throw new Error('PAYLOAD_TOO_LARGE');
    }

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
    // AI is a Pro-only capability; see improve-cv-background.mjs for the rule.
    if (!isPro) {
      throw new Error(AI_PAYWALL_CODES.PREMIUM_REQUIRED);
    }

    // Reserved before the call and settled after it; see lib/ai/usage.js.
    hold = createUsageHold(supabase, user.id);
    const slot = await hold.reserve('cv_parsing');
    if (!slot) {
      throw new Error(AI_PAYWALL_CODES.LIMIT_REACHED);
    }

    // 2. Vertex AI Request
    const sections = Object.keys(PARSING_COMPOSITION);
    const responseSchema = getParsingSchema(sections);

    aiLogContext = {
      granularity: 'cv_parsing',
      mode,
      activeTarget: 'cv',
      systemPrompt: '',
      userPrompt: '',
      inputData: text ? { textLength: text.length } : { fileType },
      responseSchema,
    };

    const {
      improvedContent,
      data,
      latency,
      candidate,
      systemPrompt: usedSystemPrompt,
      userPrompt: usedUserPrompt,
      modelUsed,
    } = await getAIResponse({
      mock,
      mode,
      activeTarget: 'cv',
      currentLang,
      targetLang,
      allowReorg,
      instructions,
      responseSchema,
      granularity: 'cv_parsing',
      fileBase64,
      fileType,
      text,
    });

    assertNotTruncated(candidate);
    if (!improvedContent) throw new Error('No content generated');

    let parsedContent;
    try {
      parsedContent = JSON.parse(improvedContent);
    } catch (e) {
      // Never log the raw content or the error itself: both can carry CV text.
      console.error('AI Response Parse Error:', describeJsonParseError(e, improvedContent));
      throw new Error('INVALID_AI_RESPONSE_FORMAT');
    }
    // `'trial'` stays in `package_type` for historical rows; nothing writes it now.
    const packageUsed = 'pro';

    // 3. Post-Success: Log Usage
    await hold.settle(slot, {
      usage: {
        tokens_input: data.usageMetadata?.promptTokenCount || 0,
        tokens_output: data.usageMetadata?.candidatesTokenCount || 0,
      },
      model: modelUsed || MODEL,
      details: {
        latency_ms: latency,
        is_mock: Boolean(mock),
        mode: aggregateAIMode(mode),
      },
    });

    logAIWorkflow({
      ...aiLogContext,
      systemPrompt: usedSystemPrompt || '',
      userPrompt: usedUserPrompt || '',
      improvedContent: parsedContent,
      metadata: {
        usage: {
          tokens_input: data.usageMetadata?.promptTokenCount || 0,
          tokens_output: data.usageMetadata?.candidatesTokenCount || 0,
        },
        latency_ms: latency,
        model: modelUsed || MODEL,
        finishReason: data.candidates?.[0]?.finishReason || 'UNKNOWN',
        package_used: packageUsed,
      },
    });

    // Update job as completed and clear the temporary payload
    await supabase
      .from('ai_jobs')
      .update({
        status: 'completed',
        result: parsedContent,
        payload: null,
      })
      .eq('id', jobId)
      .eq('user_id', user.id);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Job completed',
    };
  } catch (err) {
    const isBusinessError = [...Object.values(AI_PAYWALL_CODES), 'PAYLOAD_TOO_LARGE'].includes(
      err.message,
    );

    if (RESPONSE_FAILURES.includes(err.message)) {
      console.warn(`[AI-RESPONSE] ${err.message} for user ${user?.id || 'unknown'}`);
    } else if (!isBusinessError) {
      console.error('Parse CV Error:', describeError(err));
    } else {
      console.warn(`[AI-REJECTION] ${err.message} for user ${user?.id || 'unknown'}`);
    }
    // A failed import bills nothing.
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
            payload: null,
          })
          .eq('id', jobId)
          .eq('user_id', user.id);
      } catch (jobUpdateErr) {
        console.error('CRITICAL: Could not update ai_jobs status:', describeError(jobUpdateErr));
      }
    }
    return {
      statusCode: 200, // Important: return 200 so Netlify doesn't retry the background function infinitely
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
