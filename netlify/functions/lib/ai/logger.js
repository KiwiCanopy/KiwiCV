import fs from 'node:fs';
import path from 'node:path';

import { AI_PRICING, VERTEX_CONFIG } from './constants.js';
import { aggregateAITarget } from './request.js';

/**
 * Local AI Workflow Logger
 * Strictly environment-gated to only run during local Netlify development.
 */
export function logAIWorkflow({
  granularity,
  mode,
  activeTarget,
  systemPrompt,
  userPrompt,
  inputData,
  responseSchema,
  improvedContent,
  metadata,
  error,
}) {
  // CRITICAL: Only log in local development
  if (process.env.NETLIFY_DEV !== 'true') {
    return;
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logDir = path.resolve(process.cwd(), 'logs');

    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const isError = !!error;
    const status = isError ? 'ERROR' : 'SUCCESS';

    // Calculate USD Cost if usage data is present
    const enrichedMetadata = { ...metadata };
    if (metadata?.usage) {
      const { tokens_input, tokens_output } = metadata.usage;
      const modelKey = metadata.model || VERTEX_CONFIG.MODEL;
      const rates = AI_PRICING[modelKey] || AI_PRICING[VERTEX_CONFIG.MODEL];

      // A model without a pricing entry (e.g. a VERTEX_MODEL override under
      // test) must not throw here — that would silently drop the whole log
      // entry. Record null instead of a fabricated cost.
      if (rates) {
        const costUsd =
          (tokens_input / 1000000) * rates.input_per_1m +
          (tokens_output / 1000000) * rates.output_per_1m;
        enrichedMetadata.cost_usd = Number(costUsd.toFixed(6));
      } else {
        enrichedMetadata.cost_usd = null;
      }
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      status,
      activeTarget,
      granularity,
      mode,
      prompts: {
        system: systemPrompt,
        user: userPrompt,
      },
      input: inputData || null,
      responseSchema,
      response: improvedContent,
      ...(enrichedMetadata || {}),
      error: isError
        ? {
            message: error.message,
            stack: error.stack,
            details: error.details || null,
          }
        : null,
    };

    // An imported id can be free text; it never names a file.
    const fileName = `${status}_${timestamp}_${aggregateAITarget(activeTarget).replace(/:/g, '_')}.json`;
    const filePath = path.join(logDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(logEntry, null, 2), 'utf8');
    console.log(`[DEV-ONLY] AI Workflow logged to: ${filePath}`);
  } catch (error) {
    console.error('[DEV-ONLY] Failed to log AI workflow:', error.message);
  }
}
