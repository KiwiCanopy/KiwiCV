import { describeJsonParseError } from '../json-parse-error.js';
import { VERTEX_CONFIG } from './constants.js';
import { getSystemPrompt } from './prompts.js';

const { REGION, MODEL, PARSING_MODEL, API_HOST } = VERTEX_CONFIG;

/**
 * Signs a JWT for Google Service Account authentication without external libraries.
 */
async function getAccessToken() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    throw new Error('MISSING_GOOGLE_SERVICE_ACCOUNT_KEY: Please check your environment variables.');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(key);
  } catch (e) {
    console.error(
      'Security: Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY environment variable. It is not valid JSON.',
    );
    throw new Error('INTERNAL_CONFIG_ERROR: GOOGLE_SERVICE_ACCOUNT_KEY is malformed.');
  }
  const crypto = await import('node:crypto');

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  };

  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${encode(header)}.${encode(payload)}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key, 'base64url');

  const jwt = `${unsignedToken}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('[VertexLib] Google Auth failed:', data);
    throw new Error('GOOGLE_AUTH_FAILED');
  }

  return {
    accessToken: data.access_token,
    projectId: serviceAccount.project_id,
  };
}

/**
 * Builds the complete Vertex request (URL and JSON body) as a pure function
 * of its inputs — no auth, no network. This is the seam the request-payload
 * tests exercise: everything the AI will actually receive is decided here.
 *
 * `systemPrompt` and `userPrompt` are the caller's turn, used verbatim when
 * both are given (the cover-letter call assembles its own). Without them
 * both are derived from `mode` and the data, as every other call does.
 */
export function buildVertexRequest({
  mode,
  activeTarget,
  currentLang,
  targetLang,
  allowReorg,
  instructions,
  sanitizedResumeData,
  responseSchema,
  granularity,
  fileBase64,
  fileType,
  text,
  projectId,
  maxOutputTokens,
  systemPrompt: callerSystemPrompt,
  userPrompt: callerUserPrompt,
}) {
  const model = granularity === 'cv_parsing' ? PARSING_MODEL : MODEL;
  const url = `https://${API_HOST}/v1/projects/${projectId}/locations/${REGION}/publishers/google/models/${model}:generateContent`;

  // ⚠️ Both or neither. Half a pair is the dangerous case: a caller-supplied
  // system prompt with a derived user turn sends "DATA TO IMPROVE (undefined)"
  // to a role that was never told to expect it, and the request still succeeds.
  const hasCallerSystemPrompt = typeof callerSystemPrompt === 'string';
  const hasCallerUserPrompt = typeof callerUserPrompt === 'string';
  if (hasCallerSystemPrompt !== hasCallerUserPrompt) {
    throw new Error('INCOMPLETE_PROMPT_PAIR');
  }

  if (hasCallerSystemPrompt) {
    return finishRequest({
      url,
      model,
      systemPrompt: callerSystemPrompt,
      parts: [{ text: callerUserPrompt }],
      responseSchema,
      granularity,
      maxOutputTokens,
    });
  }

  const systemPrompt = getSystemPrompt(
    mode,
    activeTarget || 'cv',
    currentLang,
    targetLang,
    allowReorg,
    granularity,
  );

  const parts = [];

  if (granularity === 'cv_parsing') {
    if (fileBase64 && fileType === 'application/pdf') {
      parts.push({
        inline_data: {
          mime_type: 'application/pdf',
          data: fileBase64,
        },
      });
      parts.push({
        text: `INSTRUCTIONS: ${instructions || 'Extract all information from this resume PDF and map it to the provided JSON schema.'}`,
      });
    } else {
      parts.push({
        text: `RAW TEXT DATA:\n${text}\n\nINSTRUCTIONS: ${instructions || 'Extract all information from this resume text and map it to the provided JSON schema.'}`,
      });
    }
  } else {
    const userPrompt = `
      USER INSTRUCTIONS: ${instructions || 'Make it more professional and outcome-oriented.'}

      DATA TO IMPROVE (${granularity}):
      ${JSON.stringify(sanitizedResumeData)}
    `;
    parts.push({ text: userPrompt });
  }

  return finishRequest({
    url,
    model,
    systemPrompt,
    parts,
    responseSchema,
    granularity,
    maxOutputTokens,
  });
}

/** The body every path shares, and the prompt text the job log records. */
function finishRequest({
  url,
  model,
  systemPrompt,
  parts,
  responseSchema,
  granularity,
  maxOutputTokens,
}) {
  const body = {
    contents: [{ role: 'user', parts }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      response_mime_type: 'application/json',
      response_schema: responseSchema,
      // Extraction must be near-deterministic; leave improvement modes on
      // the model default.
      ...(granularity === 'cv_parsing' ? { temperature: 0.1 } : {}),
      // Only a generative call carries a budget (`COVER_LETTER_MAX_OUTPUT_TOKENS`);
      // a rewrite is bounded by its input and stays on the model default.
      ...(maxOutputTokens ? { maxOutputTokens } : {}),
    },
  };

  const userPromptText = parts
    .filter((part) => part.text)
    .map((part) => part.text)
    .join('\n');

  return { url, body, model, systemPrompt, userPrompt: userPromptText };
}

/**
 * Google's structured error fields from a non-OK body, never its text.
 * @param {string} text
 * @returns {{ status: string | null, code: number | null }}
 */
function providerErrorFields(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { status: null, code: null };
  }
  const error = (Array.isArray(parsed) ? parsed[0] : parsed)?.error;
  return {
    status: typeof error?.status === 'string' ? error.status : null,
    code: Number.isInteger(error?.code) ? error.code : null,
  };
}

/**
 * Official Vertex AI request logic.
 */
export async function getVertexResponse(params) {
  const { accessToken, projectId } = await getAccessToken();
  const finalProjectId = process.env.GOOGLE_PROJECT_ID || projectId;

  if (!finalProjectId) {
    throw new Error(
      'MISSING_PROJECT_ID: Could not detect Project ID from environment or Service Account key.',
    );
  }

  const { url, body, model, systemPrompt, userPrompt } = buildVertexRequest({
    ...params,
    projectId: finalProjectId,
  });

  const startTime = Date.now();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // A 4xx body can quote the request, so production logs read Google's structured
    // `error.status`/`error.code` only, and the body stays in the local workflow log.
    const { status: providerStatus, code: providerCode } = providerErrorFields(errorText);
    console.error('[VertexLib] Vertex AI request failed:', {
      httpStatus: response.status,
      providerStatus,
      providerCode,
    });
    const error = new Error(`VERTEX_REQUEST_FAILED: ${response.status}`);
    error.status = response.status;
    if (process.env.NETLIFY_DEV === 'true') error.details = errorText.slice(0, 300);
    throw error;
  }

  // `response.json()` rejects with a message that can quote the model's output.
  const envelope = await response.text();
  let data;
  try {
    data = JSON.parse(envelope);
  } catch (e) {
    console.error(
      '[VertexLib] Vertex AI envelope unparseable:',
      describeJsonParseError(e, envelope),
    );
    throw new Error('INVALID_VERTEX_ENVELOPE');
  }
  const latency = Date.now() - startTime;
  const candidate = data.candidates?.[0];
  const improvedContent = candidate?.content?.parts?.[0]?.text;

  return { improvedContent, data, latency, candidate, systemPrompt, userPrompt, modelUsed: model };
}
