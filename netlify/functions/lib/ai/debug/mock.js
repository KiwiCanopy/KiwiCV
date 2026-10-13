/**
 * Utility for generating mock AI responses in the backend.
 * This mimics the structure of real Vertex AI responses but adds a [Mock] marker.
 */
import { COVER_LETTER_GRANULARITY } from '../constants.js';
import { WHOLE_CV_SECTIONS } from '../definitions.js';

const MOCK_MARKER = '[Mock AI]';

const withMockSuffix = (value) => {
  if (typeof value === 'string') {
    return `${value.trim() || 'Improved content'} ${MOCK_MARKER}`.trim();
  }

  if (Array.isArray(value) && value.every((entry) => typeof entry === 'string')) {
    if (value.length === 0) return [MOCK_MARKER];
    return value.map((entry, index) =>
      index === 0 ? `${String(entry).trim() || 'Improved content'} ${MOCK_MARKER}`.trim() : entry,
    );
  }

  return null;
};

const getMockImprovedFields = (record) => {
  const preferredKeys = [
    'summary',
    'label',
    'name',
    'position',
    'company',
    'institution',
    'studyType',
    'area',
    'website',
  ];

  for (const key of preferredKeys) {
    if (!(key in record)) continue;
    const nextValue = withMockSuffix(record[key]);
    if (nextValue !== null) return { [key]: nextValue };
  }

  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith('_')) continue;
    const nextValue = withMockSuffix(value);
    if (nextValue !== null) return { [key]: nextValue };
  }

  return { summary: `This is a mock AI improvement for testing purposes. ${MOCK_MARKER}` };
};

export const buildMockResumeResult = () => {
  return {
    basics: {
      name: `John Doe ${MOCK_MARKER}`,
      label: `Software Engineer ${MOCK_MARKER}`,
      email: 'john.doe@example.com',
      phone: '+1 555-0199',
      url: 'https://johndoe.dev',
      summary: `Experienced developer with a focus on AI and cloud architecture. ${MOCK_MARKER}`,
      location: {
        address: '123 Mockingbird Lane',
        postalCode: '12345',
        city: 'Mocktown',
        countryCode: 'US',
        region: 'California',
      },
      profiles: [
        {
          network: 'LinkedIn',
          username: 'johndoe',
          url: 'https://linkedin.com/in/johndoe',
        },
      ],
    },
    work: [
      {
        company: `Mock Corp ${MOCK_MARKER}`,
        position: 'Senior Developer',
        summary: 'Led the development of a high-scale AI platform.',
      },
    ],
    education: [
      {
        institution: `University of Mocks ${MOCK_MARKER}`,
        area: 'Computer Science',
        studyType: 'Bachelor',
      },
    ],
    skills: [
      {
        name: `JavaScript ${MOCK_MARKER}`,
        level: 3,
      },
    ],
    meta: {
      template: 'professional',
    },
  };
};

/**
 * The letter mock, shaped like `getCoverLetterSchema()`: a salutation, a body
 * and a closing formula.
 *
 * ⚠️ It carries no four-digit number on purpose. `validateCoverLetter` fails a
 * letter stating a year the CV and the ad do not, and a mock that trips its own
 * guard would make every mock run report a partial failure.
 */
const buildMockCoverLetter = (projection) => {
  const role = projection?.basics?.label || projection?.work?.[0]?.position || 'the role';
  return {
    subject: `Application for ${role} ${MOCK_MARKER}`,
    paragraphs: [
      'Dear Hiring Manager,',
      `This is a mock cover letter drafted from the projected CV for testing purposes. ${MOCK_MARKER}`,
      'Kind regards,',
    ],
  };
};

export const buildMockAIResult = (granularity, targetData) => {
  if (granularity === COVER_LETTER_GRANULARITY) {
    return buildMockCoverLetter(targetData);
  }

  if (
    granularity === 'item' &&
    targetData &&
    typeof targetData === 'object' &&
    !Array.isArray(targetData)
  ) {
    const improvedFields = getMockImprovedFields(targetData);
    return { improvedFields };
  }

  if (granularity === 'section') {
    // A custom section arrives as `{ id, title, items }` and answers in the list shape.
    const entries = Array.isArray(targetData?.items) ? targetData.items : targetData;
    if (Array.isArray(entries)) {
      const firstItem = entries.find(
        (entry) => Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry),
      );

      if (!firstItem) return { isNoOp: true };

      const improvedFields = getMockImprovedFields(firstItem);
      const vId = firstItem._vId;
      if (!improvedFields || !vId) return { isNoOp: true };

      return {
        items: [{ _vId: vId, improvedFields }],
      };
    }

    if (targetData && typeof targetData === 'object') {
      const improvedFields = getMockImprovedFields(targetData);
      return { improvedFields };
    }
  }

  // Each object-valued member answers in the singleton wire shape, `{ improvedFields }`.
  if (granularity === 'cv' && targetData && typeof targetData === 'object') {
    const result = {};
    for (const section of WHOLE_CV_SECTIONS) {
      const value = targetData[section];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[section] = { improvedFields: getMockImprovedFields(value) };
      }
    }
    if (Object.keys(result).length > 0) return result;
  }

  return { isNoOp: true };
};
