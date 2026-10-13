import { AI_PRO_DAILY_LIMIT } from '@/constants/ai';
import {
  LEGAL_EMAIL,
  RESPONSIBLE_ADDRESS,
  RESPONSIBLE_NAME,
  RESPONSIBLE_TITLE,
} from '@/constants/contact';

/**
 * Interpolates legal notice and privacy templates with project constants.
 * Replaces placeholders like {{limit}}, {{email}}, {{name}}, {{title}}, {{address}}.
 */
export function interpolateLegalTemplate(content: string, emailOverride?: string): string {
  if (!content) return '';

  const email = emailOverride || LEGAL_EMAIL;

  return content
    .replace(/{{limit}}/g, String(AI_PRO_DAILY_LIMIT))
    .replace(/{{email}}/g, `[${email}](mailto:${email})`)
    .replace(/{{name}}/g, RESPONSIBLE_NAME)
    .replace(/{{title}}/g, RESPONSIBLE_TITLE)
    .replace(/{{address}}/g, RESPONSIBLE_ADDRESS);
}
