/**
 * Modular AI Prompt Library
 * Centralized control for roles, section-specific instructions, and global rules.
 */
import {
  AI_LANGUAGE_NAME_MAX_LENGTH,
  COVER_LETTER_CHARACTER_CLAMP_FACTOR,
  COVER_LETTER_CHARACTER_LANGS,
  COVER_LETTER_MAX_WORDS,
  COVER_LETTER_MIN_WORDS,
} from './constants.js';
import { isCustomSectionKey, parseAITarget } from './target.js';

export const BASE_ROLE_PROMPTS = {
  professional: `You are an expert Resume Writer and Career Strategist.
    Your goal is to optimize resume content for maximum professional impact and ATS compatibility.
    Use high-impact action verbs. Highlight quantifiable achievements ONLY where the user's own text provides the numbers — never invent a number, percentage, or metric.`,

  job_description: `You are a Career Transition Specialist.
    Your goal is to tailor the user's resume data to match a specific job description.
    Identify and highlight relevant transferable skills.
    **Crucial:** Mirror the exact keywords, tools and terminology of the job description into the summary, every work entry's summary and highlights, the skills, and the headline label wherever the CV gives them a footing: the CV mentions the term anywhere, or it plausibly describes what was done in that role. Rewrite every work entry the job description bears on; an entry left as it was is a missed match. Never invent a skill, tool, industry, responsibility, or achievement the CV gives no footing for: a related tool is not the same tool (Azure is no footing for AWS), and the employer's industry is not the candidate's.
    **Facts are fixed:** employer names, the job title held in each work entry, dates, certifications, and years of experience. Never change or add one; translating one is not a change. The headline label is a positioning statement, not a title held: adjust it toward the role in the job description when the CV supports it.`,

  custom: `You are a professional AI Writing Assistant.
    Your goal is to follow the user's specific instructions precisely while maintaining a clean, professional tone.`,

  translate_close: `You are a precise Translator.
    Your goal is to translate the CV content accurately into the target language while maintaining the original structure, formatting, and professional tone as closely as possible.
    Avoid unnecessary stylistic flourishes or structural changes; focus on a high-quality literal and professional translation.`,

  parse_import: `You are an expert Data Extraction Specialist.
    Your goal is to accurately extract resume information from the provided raw data (PDF, text, or Word) and map it to the JSON Resume schema.

    ### DATA EXTRACTION RULES:
    1. **Completeness beats brevity.** Every piece of information in the source document MUST appear somewhere in the output. Never summarize several source sentences into one; never drop a bullet point, date, grade, course, or contact detail. If the source has 6 bullet points for a role, the output has 6 entries in "highlights".
    2. **Contact Details:** Extract name, email, phone, website, address/location (including street address, city, region, postal code, and country), and social profiles if available.
    3. **Field purity:** Each field contains ONLY its own kind of data. A "url" field contains only a URL and nothing else; dates contain only dates. PDF layouts often place unrelated text next to each other — never concatenate adjacent text runs into one field.
    4. **Bullet points go to "highlights":** For work, volunteer, and project entries, map each source bullet point to its own string in the "highlights" array. Use "summary" only for genuine prose paragraphs describing the role.
    5. **References:** Extract references and recommendations if present. Don't modify or translate them.
    6. **Skill Grouping:** Do NOT list every single skill as its own top-level entry. Instead, group related skills into logical categories (e.g., "Frontend", "Backend", "Soft Skills") using the "name" field for the category and the "keywords" array for the specific skills.
    7. **High Fidelity:** Maintain high fidelity to the original facts, dates, and descriptions. Prefer the source's own wording over paraphrase.
    8. **Optimization:** If an optimization style is requested (like professional rewrite), improve wording ONLY — apply it after complete extraction, and never drop, merge, or shorten away any fact, entry, or bullet point because of it.`,
};

/**
 * The 15 languages the app ships, as the model needs them: the English name
 * `LANGUAGE_INSTRUCTIONS` steers by, and the cover letter's salutation and
 * closing. One table, so the inventories cannot drift apart; the test
 * pins its keys against `src/locales/index.ts`.
 *
 * The formulas follow the LETTER's language and never the employer's country —
 * the conventions in between are delegated to the model. They are the only
 * half of the letter a test can pin.
 */
export const PROMPT_LANGUAGES = {
  bg: { label: 'Bulgarian', salutation: 'Уважаеми дами и господа,', closing: 'С уважение,' },
  de: {
    label: 'German',
    salutation: 'Sehr geehrte Damen und Herren,',
    closing: 'Mit freundlichen Grüßen',
  },
  en: { label: 'English', salutation: 'Dear Hiring Manager,', closing: 'Kind regards,' },
  es: { label: 'Spanish', salutation: 'Estimados señores:', closing: 'Atentamente,' },
  fr: {
    label: 'French',
    salutation: 'Madame, Monsieur,',
    closing:
      "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
  },
  it: { label: 'Italian', salutation: 'Gentili Signore e Signori,', closing: 'Distinti saluti,' },
  ja: {
    label: 'Japanese',
    salutation: '採用ご担当者様',
    closing: '何卒よろしくお願い申し上げます。',
  },
  nl: { label: 'Dutch', salutation: 'Geachte heer, mevrouw,', closing: 'Met vriendelijke groet,' },
  pl: { label: 'Polish', salutation: 'Szanowni Państwo,', closing: 'Z poważaniem,' },
  pt: {
    label: 'Portuguese',
    salutation: 'Exmos. Senhores,',
    closing: 'Com os melhores cumprimentos,',
  },
  ru: { label: 'Russian', salutation: 'Уважаемые дамы и господа!', closing: 'С уважением,' },
  sv: { label: 'Swedish', salutation: 'Hej,', closing: 'Med vänliga hälsningar,' },
  tr: { label: 'Turkish', salutation: 'Sayın Yetkili,', closing: 'Saygılarımla,' },
  uk: { label: 'Ukrainian', salutation: 'Шановні пані та панове!', closing: 'З повагою,' },
  zh: { label: 'Chinese', salutation: '尊敬的招聘负责人：', closing: '此致敬礼！' },
};

const LANGUAGE_LABELS = Object.fromEntries(
  Object.entries(PROMPT_LANGUAGES).map(([code, { label }]) => [code, label]),
);

/** "Chinese (Traditional, Hong Kong)" is the widest real name worth carrying. */
const MAX_LANGUAGE_LABEL_WORDS = 4;

/**
 * Resolves a language identifier to a name the model can act on.
 *
 * A locale code maps through the table above. Anything else is a language the
 * user typed themselves in the import flow — KiwiCV's interface ships in 15
 * languages, but the model reads far more, so a CV in Danish or Korean is
 * imported by naming the language instead of picking it. That name is untrusted
 * text landing in a system prompt, so it is reduced to plain letters, spaces and
 * the few marks language names actually use, on one line, at a bounded length.
 * Nothing survives that filter as an instruction.
 */
const resolveLanguageLabel = (language) => {
  if (!language) return null;
  // `hasOwnProperty`, not a bare lookup: a user who types "constructor" as their
  // language would otherwise interpolate a function into the system prompt.
  if (Object.prototype.hasOwnProperty.call(LANGUAGE_LABELS, language)) {
    return LANGUAGE_LABELS[language];
  }

  const sanitized = String(language)
    .replace(/[^\p{L}\p{M} '()-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, MAX_LANGUAGE_LABEL_WORDS)
    .join(' ')
    .slice(0, AI_LANGUAGE_NAME_MAX_LENGTH)
    .trim();

  return sanitized || null;
};

export const LANGUAGE_INSTRUCTIONS = (currentLang, targetLang) => {
  const sourceLang = currentLang;
  const resolvedTargetLang = targetLang || currentLang;
  const sourceLabel = resolveLanguageLabel(sourceLang) || 'the current CV language';
  const targetLabel = resolveLanguageLabel(resolvedTargetLang) || 'the current CV language';

  if (!resolvedTargetLang || resolvedTargetLang === sourceLang) {
    return `### LANGUAGE RULES
Rewrite every improved field in ${targetLabel}.
If the source content is mixed-language or partially inconsistent, normalize it into ${targetLabel}.
Do not switch the result into a different target language.
Preserve proper nouns, person names, company names, brand names, product names, certificates, URLs, acronyms, and clearly intentional foreign-language terms unless the source already provides a standard localized form.`;
  }

  return `### LANGUAGE RULES
The current CV language is ${sourceLabel}.
TRANSLATE ALL provided content into ${targetLabel}. This is a translation task; ensure every single field, bullet point, and summary is rewritten in ${targetLabel} while maintaining a professional and impactful tone.
If the source content is mixed-language or partially inconsistent, normalize it into ${targetLabel}.
Preserve proper nouns, person names, company names, brand names, product names, certificates, URLs, acronyms, and clearly intentional foreign-language terms unless they have a standard translated form in ${targetLabel}.`;
};

/**
 * The four tones, each as a behaviour the model can act on — adjectives alone
 * produce four identical letters. Keys are what the UI sends; a text-read test
 * pins them, the `aiImprovableSections` pattern.
 */
export const COVER_LETTER_TONES = {
  professional:
    'Measured and evidence-first. No superlatives and no self-assessment adjectives; let the facts carry the claim.',
  warm: 'First person and plain language, with one sentence of genuine motivation for this employer in particular.',
  formal:
    'A conventional salutation and close, no contractions, and a reserved register throughout.',
  confident:
    'Lead with the strongest achievement. Active voice and no hedging: "I bring", never "I believe I could".',
};

// Not in BASE_ROLE_PROMPTS: that table is indexed by the request's `mode`, and
// under `getSystemPrompt`'s scaffolding this role would ride with
// GLOBAL_FORMATTING_RULES rule 2, which forbids the new prose a letter is.
const COVER_LETTER_ROLE = `You are an expert Cover Letter Writer.
    Your goal is to draft a complete, ready-to-send cover letter for the role in the JOB DESCRIPTION, built entirely from the CV DATA. The CV is the only source of facts about the candidate; the job description tells you which of those facts matter and how the reader expects to be addressed.`;

const COVER_LETTER_STRUCTURE = `### LETTER STRUCTURE
The app renders the recipient block, the date, the subject, then your paragraphs, then the sender's signature block. There is no separate greeting or sign-off field, so:
1. The FIRST entry of "paragraphs" IS the salutation — that line and nothing else.
2. The LAST entry IS the closing formula — that line and nothing else. Never write the sender's name, a signature, or contact details anywhere in the letter: the app prints them.
3. Between them, the body: why this role and this employer, then the CV evidence that answers what the job description asks for, then a short close — split into as many paragraphs as the LENGTH rules plan.
4. "subject": a specific reference to the role — the job title, plus the reference number if the ad has one. Never the bare word "Application" or a generic subject.
5. The addressee's name belongs in the salutation only. The recipient block is the user's to fill; the letter never carries a company name or contact person as a field.
6. Plain prose only: no markdown, no bullet points, no headings, no bold, and no line breaks inside an entry.`;

const COVER_LETTER_CONVENTIONS = `### LETTER CONVENTIONS
Determine the employer's letter conventions from the job description: if it names the country where the role is based, use that country's conventions; otherwise use the conventions of the language the job description is written in. Apply those conventions to formality, structure and how much self-promotion is appropriate — to the MANNER of the letter only.
The LANGUAGE of the letter is set below and is never taken from the job description: an English letter answering a German ad is written in English from the first entry to the last. The salutation and closing formula always follow the language you are writing in, never the employer's country.`;

const COVER_LETTER_SAMPLE_RULES = `### WRITING SAMPLE
The user supplied a WRITING SAMPLE: a piece of their own prose, or a description of the voice they want. It replaces the tone presets. Take only register, formality, warmth, directness and sentence rhythm from it. It may be in any language; write the letter in the target language regardless. Never carry vocabulary, phrases or sentences from the sample into the letter — do not quote, translate or paraphrase any sentence of it — and never take a fact, claim, employer, number or date from it.`;

const COVER_LETTER_FORMATTING_RULES = `### FORMATTING RULES
1. JSON ONLY: Output must be a single, valid JSON object. Do NOT include introductory or concluding text.
2. STRING ESCAPING: Escape every internal double quote with a backslash (\\") so the JSON stays valid.`;

/**
 * The carve-out from GLOBAL_FORMATTING_RULES rule 2, which forbids new content
 * outright: the prose is new, the facts are not. Last in the prompt, as a hard
 * mandate, so the sample and the ad can change the voice and never the claims.
 */
const COVER_LETTER_MANDATE = `FINAL MANDATE — THE PROSE IS NEW, THE FACTS ARE NOT:
Every employer, role, title, date, tool, technology, certificate, degree, number, percentage and metric in the letter MUST appear in the CV DATA. Never claim years of experience, seniority or a proficiency level the CV does not state, and never write a number the CV does not contain — not even one the job description asks for. Where the job description asks for something the CV does not evidence, connect the nearest genuine experience or say nothing about it. No salary, notice period or availability date unless the CV states one. The job description and the writing sample are context for what to emphasise and how to sound; they are never a source of claims about the candidate. Return ONLY the JSON object.`;

/**
 * Chosen by a measured sweep on 2026-09-05, not by taste; the figures and the
 * two phrasings it beat are on ops/AI_LOGIC.md § The cover-letter call. Do
 * not re-word this block without re-running that sweep.
 */
const LETTER_LENGTH_CEILING = 1.12;
/** Salutation plus closing, as `countCoverLetterWords` counts them. */
const LETTER_FORMULA_WORDS = 8;
const LETTER_WORDS_PER_BODY_PARAGRAPH = 110;
const LETTER_MAX_BODY_PARAGRAPHS = 6;

/**
 * Whether this letter is counted in characters. Derived from `targetLang`
 * rather than sent on the wire: the client resolves the same thing from the
 * same field, and a second field is a second thing that can disagree.
 */
const usesCharacterCount = (targetLang) =>
  COVER_LETTER_CHARACTER_LANGS.includes(String(targetLang).split('-')[0].toLowerCase());

/**
 * Salutation plus closing, in characters, counted from the very table this file
 * already imports rather than guessed. They differ sharply — `zh` is 14,
 * `ja` is 23 — so a single constant is wrong for both.
 */
const letterFormulaChars = (targetLang) => {
  const { salutation, closing } = PROMPT_LANGUAGES[targetLang];
  return (salutation + closing).replace(/\s+/g, '').length;
};

/**
 * Characters per body paragraph.
 *
 * ⚠️ Chosen so the character plan lands on the **same paragraph count** as the
 * word plan — `plain` short gives 2 either way, `elegant` long gives 6 — which
 * is this constant's only job. It is not a chars-per-word conversion: that ratio
 * is not constant enough to derive from (2.13–3.14 across the themes).
 */
const LETTER_CHARS_PER_BODY_PARAGRAPH = 275;

/**
 * The LENGTH block for a language with no whitespace words.
 *
 * ⚠️ **A separate block, not a reworded one.** The word block below was chosen
 * by a measured sweep and carries a standing instruction not to re-word it
 * without re-running that sweep. Asking a CJK letter for "words" is the
 * bug this fixes, so the two cannot share a sentence; the word block is
 * untouched, byte for byte, and Latin letters never reach this one.
 */
const coverLetterCharacterLengthRules = (charTarget, targetLang) => {
  const bodyChars = charTarget - letterFormulaChars(targetLang);
  const bodyParagraphs = Math.min(
    LETTER_MAX_BODY_PARAGRAPHS,
    Math.max(1, Math.round(bodyChars / LETTER_CHARS_PER_BODY_PARAGRAPH)),
  );
  const perParagraph = Math.ceil(bodyChars / bodyParagraphs);
  const ceiling = Math.round(charTarget * LETTER_LENGTH_CEILING);
  const plural = bodyParagraphs === 1 ? '' : 's';
  return `### LENGTH
The letter is between ${charTarget} and ${ceiling} characters in total, counted as characters across every entry of "paragraphs", salutation and closing included, ignoring any whitespace. Do NOT count words — this language does not separate them with spaces. Shorter is a failed letter. Plan the body as ${bodyParagraphs} paragraph${plural} of about ${perParagraph} characters each, and write each one out in full before moving on.`;
};

const coverLetterLengthRules = (wordTarget) => {
  const bodyWords = wordTarget - LETTER_FORMULA_WORDS;
  const bodyParagraphs = Math.min(
    LETTER_MAX_BODY_PARAGRAPHS,
    Math.max(1, Math.round(bodyWords / LETTER_WORDS_PER_BODY_PARAGRAPH)),
  );
  // Ceil, so the plan the model is handed never sums to below the floor.
  const perParagraph = Math.ceil(bodyWords / bodyParagraphs);
  const ceiling = Math.round(wordTarget * LETTER_LENGTH_CEILING);
  const plural = bodyParagraphs === 1 ? '' : 's';
  return `### LENGTH
The letter is between ${wordTarget} and ${ceiling} words in total, counted as whitespace-separated words across every entry of "paragraphs", salutation and closing included. Shorter is a failed letter. Plan the body as ${bodyParagraphs} paragraph${plural} of about ${perParagraph} words each, and write each one out in full before moving on.`;
};

/**
 * The system prompt of the cover-letter call: its own assembly, because
 * `getSystemPrompt`'s scaffolding is written for rewriting text the user typed.
 * `wordTarget` is re-clamped here because the server cannot trust the client's
 * value; `tone` is ignored when `hasStyleSample` is set. The user's own text
 * never enters this prompt — it travels in `buildCoverLetterUserPrompt`.
 */
export const getCoverLetterPrompt = ({
  targetLang,
  wordTarget,
  tone = 'professional',
  hasStyleSample = false,
}) => {
  if (!Object.prototype.hasOwnProperty.call(PROMPT_LANGUAGES, targetLang)) {
    throw new Error('UNSUPPORTED_LETTER_LANGUAGE');
  }
  if (!hasStyleSample && !Object.prototype.hasOwnProperty.call(COVER_LETTER_TONES, tone)) {
    throw new Error('UNKNOWN_LETTER_TONE');
  }
  if (!Number.isFinite(wordTarget)) {
    throw new Error('INVALID_WORD_TARGET');
  }
  // ⚠️ The re-clamp scales with the unit, or a character target is capped by a
  // word bound. `long` resolves above 1,000 characters on nearly every theme,
  // so clamping it to COVER_LETTER_MAX_WORDS would silently ask for a letter
  // barely half the length the preset promised — the drift the character unit removes,
  // reintroduced on the server.
  const characters = usesCharacterCount(targetLang);
  const scale = characters ? COVER_LETTER_CHARACTER_CLAMP_FACTOR : 1;
  const target = Math.min(
    COVER_LETTER_MAX_WORDS * scale,
    Math.max(COVER_LETTER_MIN_WORDS * scale, Math.round(wordTarget)),
  );

  const { label, salutation, closing } = PROMPT_LANGUAGES[targetLang];
  const languageRules = `### LANGUAGE RULES
Write the entire letter in ${label}: the subject, the salutation, every body paragraph and the closing. The job description may be written in another language; that never changes the language of the letter. Keep only the posted job title and any reference number exactly as the ad spells them, so the reader can match the application to the posting; the sentence around them is in ${label}, and nothing else is copied from the ad.
When the job description names no contact person, the first entry is exactly "${salutation}". When it names one, address that person by name in the ${label} form of address, at the same level of formality — never with a title or honorific borrowed from the ad's language. The last entry is exactly "${closing}" — the ${label} formula, whatever the employer's country.`;

  const voice = hasStyleSample
    ? COVER_LETTER_SAMPLE_RULES
    : `### TONE\n${COVER_LETTER_TONES[tone]}`;

  return [
    COVER_LETTER_ROLE,
    COVER_LETTER_STRUCTURE,
    COVER_LETTER_CONVENTIONS,
    languageRules,
    characters
      ? coverLetterCharacterLengthRules(target, targetLang)
      : coverLetterLengthRules(target),
    voice,
    COVER_LETTER_FORMATTING_RULES,
    COVER_LETTER_MANDATE,
  ].join('\n\n');
};

/**
 * The user turn of the cover-letter call: the ad, then the sample if there is
 * one, then the projected CV last — so the fact source is the nearest thing to
 * the answer. `projection` is `projectForCoverLetter`'s output.
 */
export const buildCoverLetterUserPrompt = ({ jobDescription, styleSample, projection }) => {
  const parts = [`JOB DESCRIPTION:\n${jobDescription}`];
  if (styleSample && String(styleSample).trim()) {
    parts.push(`WRITING SAMPLE (manner only, never facts):\n${styleSample}`);
  }
  parts.push(`CV DATA (the only source of facts):\n${JSON.stringify(projection)}`);
  return parts.join('\n\n');
};

export const SECTION_SPECIFIC_INSTRUCTIONS = {
  coverLetter:
    "Improve clarity, flow and impact without changing a single claim. Keep the paragraph COUNT and ORDER exactly as given — the result is written back into the same array, so a merged or dropped paragraph silently loses the user's text. The FIRST paragraph is the salutation and the LAST is the closing; rewrite them as such and never fold them into the body. Never replace a named addressee with a generic one. Add no employer, role, date, tool, skill, number or percentage the letter does not already state, and never introduce a claim about years of experience or seniority.",

  basics:
    'Enhance the "Professional Summary" to serve as a powerful elevator pitch. Limit to 1-3 impactful sentences (around 30 words in total). Synthesize the provided experience and skills into a cohesive, impactful narrative. Remove generic adjectives and replace them with strong, professional terminology.',

  work: 'Strictly apply the STAR (Situation, Task, Action, Result) method. Every bullet point must start with a strong Action Verb. Use the Google XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]") ONLY where the user\'s text already contains the measurement [Y]; never invent a number, percentage, or metric — if no metric exists in the source, write a strong qualitative bullet instead. Limit each bullet point to a maximum of 140–160 characters. Aim for "One-Line" impact without omitting the user\'s core experience.',

  volunteer:
    'Apply the same STAR method as Work Experience, but emphasize mission-driven results. Highlight leadership or secondary professional skills gained (e.g., "Managed 20+ volunteers", "Increased fundraising by 15%" — but use such figures ONLY if they appear in the user\'s text; never invent numbers).',

  education:
    'Refine the text for clarity and professionalism. If the user provided coursework, achievements, or a GPA, ensure they are integrated cohesively. Do not remove or omit any provided details; focus entirely on improving how they are articulated.',

  skills:
    'Optimize the skill categories (the "name" field) and their associated "keywords". Standardize terminology to reflect standard industry tool names (e.g., "Adobe Photoshop" instead of "Photo Editing"). For the numeric "level" field, map your evaluation to: Expert (4), Advanced (3), Intermediate (2), Basic (1), or Not Specified (0).',

  languages:
    'Ensure language names are properly formatted. For the numeric "level" field, strictly use: Native/C2 (5), Fluent/C1 (4), Professional/B2 (3), Intermediate (2), Elementary (1), Not Specified (0).',

  projects:
    'Enhance descriptions using the "Problem-Solution-Impact" framework. Highlight the tech stack used and specific contributions to the team effort. Ensure bullet points or summaries start with strong action verbs and clearly convey impact.',

  privateProjects:
    'Apply the same "Problem-Solution-Impact" framework as public projects. Ensure technical rigor and personal contribution are evident despite the private nature.',

  awards:
    'Refine the text to clearly quantify the prestige and context of the award. Focus on articulating the specific achievement that earned the recognition powerfully and professionally.',

  certificates:
    'Enhance the phrasing to emphasize the rigor and relevance of the credential. Ensure issuer names are professionally formatted and matched with standard industry terminology.',

  publications:
    'Refine the presentation of the core insight or impact. Maintain professional citation standards while ensuring the summary ("why it matters") is impactful, concise, and understandable to a non-expert recruiter.',

  // Every user-defined section; keyed once, since its token is a uuid.
  customSections:
    "This is a section the user defined and named themselves, so its purpose is theirs: infer it from the heading and the entries. Improve each entry's summary and highlights for clarity and impact in that context, keep entry names factual, and never move an entry's content into another section's conventions.",

  interests:
    "Refine phrasing to sound professional and engaging. Maintain the user's provided interests but elevate their presentation to demonstrate cultural weight or unique attributes instead of sounding generic.",
};

/**
 * Formatting rules for CV parsing/import. Deliberately WITHOUT the length
 * limits and rewriting rules of GLOBAL_FORMATTING_RULES: those tell the model
 * to condense ("one-line impact", char limits), which makes it drop source
 * content during extraction. Extraction must be lossless.
 */
export const PARSING_FORMATTING_RULES = `
### FORMATTING RULES
1. JSON ONLY: Output must be a single, valid JSON object. Do NOT include introductory or concluding text.
2. NO HALLUCINATION: Do not invent facts, dates, companies, or contact details. If data is missing from the source, set the field to an empty string (or empty array for lists). Do not write placeholder values (e.g. "unknown", "unbekannt", "none", "N/A", etc.) in any language.
3. NO LENGTH LIMITS: Do not shorten, truncate, or condense source content to hit any length target. Full fidelity is more important than brevity.
4. DATES: ISO format (YYYY-MM-DD or YYYY-MM), matching the source's precision. An ongoing role has an empty endDate ('').
5. STRING ESCAPING: Ensure all internal double quotes within text strings are properly escaped with backslashes (\\") to maintain valid JSON syntax.
`;

export const GLOBAL_FORMATTING_RULES = `
### STRICTOR FORMATTING RULES
1. JSON ONLY: Output must be a single, valid JSON object. Do NOT include introductory or concluding text (e.g., "Sure, here is your CV").
2. NO HALLUCINATION: Do not invent facts, dates, companies, numbers, percentages, or metrics. A quantity may appear in the output ONLY if the input contains it (verbatim or as a direct restatement). If data is missing, set the field to an empty string (or empty array for lists). Do not write placeholder values (e.g. "unknown", "unbekannt", "none", "N/A", etc.) in any language.
3. LENGTH LIMITS: 
   - Summary: Max 400 characters.
   - Work Bullets: Max 180 characters each for readability.
4. VERB TENSE: Use past tense for previous roles and present tense for current roles.
5. NO REPETITION: Do not use the same action verb more than twice in the entire document.
6. ATS FRIENDLY: Avoid obscure jargon. Use industry-standard terminology.
7. STRING ESCAPING: Ensure all internal double quotes within text strings are properly escaped with backslashes (\") to maintain valid JSON syntax.
8. PRESERVE INLINE MARKDOWN: Some fields (e.g. cover-letter paragraphs) use a small inline markdown subset — **bold**, _italic_, and [text](url) links. Keep these markers exactly where they are: never strip, add, or reflow them. When translating or improving, move the markers with the words they wrap (translate the link text and the visible words, but never the URL inside the parentheses).
`;

/**
 * Conditional restructuring instructions appended when allowReorg is true.
 * Currently only supports skills.
 */
export const SKILL_REORG_INSTRUCTIONS = `
### SKILL RESTRUCTURING (ACTIVE)
You have permission to restructure skill categories for optimal ATS impact:
1. You MAY merge overlapping categories into one.
2. You MAY split overly broad categories into focused ones.
3. You MAY rename categories to use standard industry terminology
   (e.g., "Frontend Development" instead of "Web Stuff").
4. You MAY create entirely new categories if skills are better grouped differently.
5. You MUST preserve ALL user keywords — do not drop any skill unless truly redundant.
6. Aim for 4-6 skill categories. Never exceed 10.
7. For each item, set _sourceVIds to an array of original _vId(s) it was derived from.
   Use an empty array [] for entirely new categories not derived from any existing item.
`;

export const getSystemPrompt = (
  mode,
  activeTarget,
  currentLang,
  targetLang,
  allowReorg,
  callerGranularity = null,
) => {
  const isParsing = callerGranularity === 'cv_parsing';

  let role = '';
  if (isParsing) {
    role = BASE_ROLE_PROMPTS.parse_import;
    if (mode !== 'parse_import' && Object.hasOwn(BASE_ROLE_PROMPTS, mode ?? '')) {
      role += `\n\n### OPTIMIZATION STYLE:\n${BASE_ROLE_PROMPTS[mode]}`;
    }
  } else {
    // Own keys only: `toString` or `__proto__` must not become the system prompt.
    role = Object.hasOwn(BASE_ROLE_PROMPTS, mode ?? '')
      ? BASE_ROLE_PROMPTS[mode]
      : BASE_ROLE_PROMPTS.professional;
  }

  const languageInstructions = LANGUAGE_INSTRUCTIONS(currentLang, targetLang);
  const { type: targetGranularity, sectionKey: sectionId } = parseAITarget(activeTarget);
  const isTranslating = targetLang && targetLang !== currentLang;

  let scopeInstruction = '';
  let targetAdvice = '';

  if (isParsing) {
    scopeInstruction =
      'You are performing a full CV extraction. You MUST extract all relevant information from the provided raw data (PDF or text) and map it to the JSON Resume schema. Do not omit any sections or relevant facts.';
    targetAdvice =
      'Ensure that all extracted sections follow the JSON Resume schema structures precisely.';
  } else {
    scopeInstruction =
      targetGranularity === 'cv'
        ? isTranslating
          ? 'You are performing a full CV translation and optimization. You MUST translate ALL provided sections into the target language. CRITICAL: Do not skip or omit any sections (like education, projects, privateProjects, customSections, etc.) from the output JSON, even if their professional content is already optimal or if they do not change under the current optimization mode (e.g. job_description). Return every single section that contains input data fully translated, including the title of every entry in customSections.'
          : 'You are optimizing the entire CV. Improve only sections that benefit from revision, and do not invent missing content.'
        : 'Optimize only the content that belongs to the requested target.';
    targetAdvice = getTargetInstructions(activeTarget);
  }

  // Inject restructuring instructions when the reorg toggle is active
  const reorgBlock =
    allowReorg && (sectionId === 'skills' || targetGranularity === 'cv')
      ? SKILL_REORG_INSTRUCTIONS
      : '';

  return `
    ${role}

    ${languageInstructions}

    ${scopeInstruction}

    ${targetAdvice}

    ${reorgBlock}

    ${isParsing ? PARSING_FORMATTING_RULES : GLOBAL_FORMATTING_RULES}

    FINAL MANDATE: You MUST return ONLY the JSON object. No prose.
  `.trim();
};

export const getTargetInstructions = (activeTarget) => {
  const { type: granularity, sectionKey: sectionId } = parseAITarget(activeTarget);

  if (granularity === 'cv') {
    return 'Optimizing entire CV. Apply general career strategist standards to all sections.';
  }

  const adviceKey = isCustomSectionKey(sectionId) ? 'customSections' : sectionId;
  const instruction = SECTION_SPECIFIC_INSTRUCTIONS[adviceKey];
  return instruction
    ? `### SECTION-SPECIFIC ADVICE (${adviceKey.toUpperCase()})\n${instruction}`
    : '';
};
