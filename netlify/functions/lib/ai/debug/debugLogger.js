import fs from 'node:fs';
import path from 'node:path';

/**
 * Local Usage Debug Logger
 * Appends to a single usage_debug.log file in the project root.
 * Strictly environment-gated to only run during local Netlify development.
 */
export function logUsageDebug(message, data = null) {
  // CRITICAL: Only log in local development
  if (process.env.NETLIFY_DEV !== 'true') {
    return;
  }

  try {
    const logFile = path.resolve(process.cwd(), 'usage_debug.log');
    const timestamp = new Date().toISOString();

    let logMessage = `[${timestamp}] ${message}`;
    if (data) {
      logMessage += ` | DATA: ${JSON.stringify(data)}`;
    }
    logMessage += '\n';

    fs.appendFileSync(logFile, logMessage, 'utf8');
    console.log(`[DEBUG-USAGE] ${message}`);
  } catch (error) {
    console.error('[DEBUG-USAGE] Failed to write to usage_debug.log:', error.message);
  }
}
