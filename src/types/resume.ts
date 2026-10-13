import type { SectionKey } from '@/utils/layout/constants';
import type { CustomSectionToken } from '@/utils/layout/customSections';

export interface AddressSchemaConfig {
  mode: 'default' | 'preset' | 'custom';
  presetCountry?: string;
  customFields?: Array<{
    field: 'address' | 'postalCode' | 'city' | 'region' | 'countryCode';
    separator: ',' | ' ' | '-' | '';
  }>;
}

export type AddressField = NonNullable<AddressSchemaConfig['customFields']>[number];
export type AddressFieldKey = AddressField['field'];
export type AddressSeparator = AddressField['separator'];

/**
 * The runtime inventories for the two `AddressField` unions.
 *
 * ⚠️ They live **beside the declaration** rather than in the design editor that
 * used to own `ALL_ADDRESS_FIELD_KEYS`, because `utils/validation.ts` now needs
 * them too and the alternative was a second copy of the list — this
 * repository's single most productive bug shape.
 *
 * ⚠️ `as const satisfies`, not `: AddressFieldKey[]`. An annotated array literal
 * constrains the element type and nothing else, so a sixth member of the union
 * produced **no** error here — the key would simply be missing from the picker and
 * silently stripped by the sanitizer. The `satisfies` pins the element type; the
 * `_…AreExhaustive` aliases below make the *missing* direction a build error too.
 * Both halves, per the both-halves rule (`.claude/rules/testing.md`).
 */
export const ALL_ADDRESS_FIELD_KEYS = [
  'address',
  'postalCode',
  'city',
  'region',
  'countryCode',
] as const satisfies readonly AddressFieldKey[];

export const ALL_ADDRESS_SEPARATORS = [
  ',',
  ' ',
  '-',
  '',
] as const satisfies readonly AddressSeparator[];

/**
 * The other half: a union member that is **absent** from the arrays above.
 * `satisfies` cannot express this — it proves the array's members are valid, not
 * that every valid value is a member.
 *
 * ⚠️ The obvious spelling does not work. `type _C = A extends B ? true : never`
 * produces **no error at all** — it just resolves to `never` — and a module-scope
 * `const _check` is dead code under `noUnusedLocals`. Both are recorded traps in
 * this repo. A parameter *constrained* to `never` does error: if `Exclude` is
 * non-empty the default type argument violates the constraint, which is a real
 * `TS2344`. Mutation-verified by removing an entry from each array.
 */
export type _AddressFieldKeysAreExhaustive<
  Missing extends never = Exclude<AddressFieldKey, (typeof ALL_ADDRESS_FIELD_KEYS)[number]>,
> = Missing;

export type _AddressSeparatorsAreExhaustive<
  Missing extends never = Exclude<AddressSeparator, (typeof ALL_ADDRESS_SEPARATORS)[number]>,
> = Missing;

export type ThemeParams = ResumeMeta['theme']['params'];

/**
 * The single default set for `meta.theme.params` — the whitelist that
 * `sanitizeResumeData` filters by, the value it falls back to for an absent key,
 * **and** the block `initialResumeState` ships (see `INITIAL_THEME_PARAMS`).
 *
 * ⚠️ It lives here, beside the declaration, because those used to be **two**
 * lists. `utils/validation.ts` held the whitelist and this file held the store's
 * starting values; they agreed on all seven shared keys by luck, and a change to
 * either alone would have produced the same bug again — a value that is correct
 * for a new user and silently flips to the other copy's on the first list edit.
 *
 * ⚠️ `satisfies Required<ThemeParams>` is the drift guard and the whole point of
 * the constant. `s()` whitelists by `Object.keys(defaults)`, so a param missing
 * here is not merely stripped on import: it once was **replaced by its
 * default on every array-section edit**, silently and with no undo, because five
 * of ten keys were listed. `Required<>` makes an eleventh param a build error
 * rather than the same bug a year later — mutation-verified by adding a key to
 * the interface below. ⚠️ The error is **`TS1360`** (`satisfies` unsatisfied), not
 * the `TS2741` an annotation would give; the point of naming it is to tell the
 * next reader what to expect, so the wrong code defeats the comment. The test
 * file's `Record<keyof Required<ThemeParams>, unknown>` gives `TS2741` for the
 * same mutation, so an eleventh param errors in two independent places.
 *
 * ⚠️ Two of the ten cannot be expressed by `s()` at all and are refined afterwards
 * by `sanitizeThemeParams`; for `sectionLabels` and `addressSchema` the values
 * here are what `s()` needs to let the key through, not meaningful defaults.
 */
export const THEME_PARAM_DEFAULTS = {
  palette: 'default',
  sectionLabels: {},
  showFooter: true,
  footerLocation: '',
  // ⚠️ **Not a date — a three-state label**: `'auto'`, `'none'`, or free text the
  // user types at `PdfFooterSection.tsx:121`, which `typstFooter.ts` prints
  // verbatim. This used to say the opposite, because `s()` matched any key whose
  // name contained "date" and ran `normalizeDate`/`isValidDate` over it: `'none'`
  // and every free-text value were blanked on import, and `''` reads as `'auto'`,
  // so switching the footer date off did not survive an export/import round trip
  // `s()`'s date inventory is derived from the item schemas now, and this
  // param is narrowed like the other nine in `sanitizeThemeParams`.
  footerDate: 'auto',
  fontSizeScale: 1,
  imageShape: 'square',
  boldHeaderWork: 'position',
  boldHeaderEducation: 'position',
  addressSchema: { mode: 'default' },
} satisfies Required<ThemeParams>;

/**
 * What a brand-new resume ships with: the defaults above minus `sectionLabels`,
 * whose placeholder `{}` would otherwise appear in every new resume and every
 * exported JSON while meaning "no overrides".
 *
 * ⚠️ Derived by destructuring rather than restated, so the omission is the *only*
 * difference that can exist. A second literal here would bring back the two-copy drift.
 */
const { sectionLabels: _sectionLabelsIsNotAStartingValue, ...INITIAL_THEME_PARAMS } =
  THEME_PARAM_DEFAULTS;

/**
 * The runtime inventories for the remaining `ThemeParams` unions, used by
 * `sanitizeThemeParams` to narrow a stored value.
 *
 * ⚠️ **Each needs its `_…AreExhaustive` alias, and that is not decoration.**
 * `as const satisfies readonly T[]` catches a *bogus* member and says nothing
 * about a *missing* one — and a missing one is the original bug: `asOneOf` would
 * silently reset a legitimately-stored value to the fallback on every
 * array-section edit. Verified by mutation: before these aliases, adding a fourth
 * `AddressSchemaConfig['mode']` compiled clean with no diagnostic anywhere.
 *
 * ⚠️ `IMAGE_SHAPES` and `BOLD_HEADERS` *appeared* covered without them, because a
 * third union member happens to error at `BasicsForm.tsx`, `BoldHeaderOptions.tsx`
 * and `themes/shared/translations.ts`. That is a structural argument nothing here
 * asserts — loosening any of those incidental sites reopens the hole silently.
 */
export const ALL_ADDRESS_MODES = [
  'default',
  'preset',
  'custom',
] as const satisfies readonly AddressSchemaConfig['mode'][];
export const ALL_IMAGE_SHAPES = ['circle', 'square'] as const satisfies readonly NonNullable<
  ThemeParams['imageShape']
>[];
export const ALL_BOLD_HEADERS = ['company', 'position'] as const satisfies readonly NonNullable<
  ThemeParams['boldHeaderWork']
>[];

export type _AddressModesAreExhaustive<
  Missing extends never = Exclude<AddressSchemaConfig['mode'], (typeof ALL_ADDRESS_MODES)[number]>,
> = Missing;

export type _ImageShapesAreExhaustive<
  Missing extends never = Exclude<
    NonNullable<ThemeParams['imageShape']>,
    (typeof ALL_IMAGE_SHAPES)[number]
  >,
> = Missing;

export type _BoldHeadersAreExhaustive<
  Missing extends never = Exclude<
    NonNullable<ThemeParams['boldHeaderWork']> | NonNullable<ThemeParams['boldHeaderEducation']>,
    (typeof ALL_BOLD_HEADERS)[number]
  >,
> = Missing;

export interface ResumeMeta {
  version: string;
  theme: {
    name: string;
    locale: string;
    params: {
      palette?: string;
      sectionLabels?: Record<string, string>;
      showFooter?: boolean;
      footerLocation?: string;
      footerDate?: string;
      fontSizeScale?: number;
      imageShape?: 'circle' | 'square';
      boldHeaderWork?: 'company' | 'position';
      boldHeaderEducation?: 'company' | 'position';
      addressSchema?: AddressSchemaConfig;
    };
  };
  export: {
    filenamePattern: string;
    hostingPath?: string;
  };
  content: {
    hiddenIds: string[];
    hiddenSections: string[];
    order: {
      oneColumn: string[];
      twoColumn: {
        main: string[];
        sidebar: string[];
        sidebarPosition?: 'left' | 'right';
      };
    };
    pageBreaks?: {
      oneColumn?: string[];
      twoColumn?: {
        main?: string[];
        sidebar?: string[];
      };
    };
  };
}

export interface SyncConfig {
  github: {
    enabled: boolean;
    repo?: string;
    branch?: string;
  };
  googleDrive: {
    enabled: boolean;
    lastSync?: string;
  };
}

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

/** Skill proficiency from 1 to 4 (0 or undefined = Not Specified)
 * 1 = Basic (Grundkenntnisse), 2 = Intermediate (Gute Kenntnisse), 3 = Advanced (Sehr gute Kenntnisse), 4 = Expert (Expertenkenntnisse)
 */
export type SkillLevel = 0 | 1 | 2 | 3 | 4;

/** Fluency level: 0 (Not Specified), 1 (Elementary), 2 (Intermediate), 3 (Professional), 4 (Fluent), 5 (Native) */
export type FluencyLevel = Enumerate<6>;

/**
 * Cover letter block. Paragraphs and the subject are stored as markdown-subset
 * strings supporting `**bold**`, `_italic_` (underscore, not `*`, to avoid
 * `***text***` ambiguity with `**bold**`) and `[text](url)`. Structure is only
 * ever produced by the converter, never by user text, so the tokenizer can route
 * every run through the Typst escaper.
 */
export interface ResumeCoverLetter {
  enabled: boolean;
  paragraphs: string[];
  layout: {
    /** "Box style" (justify) vs left-aligned body text. */
    textAlign: 'left' | 'justify';
    showSender: boolean;
    showRecipient: boolean;
    /** Reuses the resume's themed signature footer. */
    showFooter: boolean;
    /** Traditional DIN 5008 layout vs the theme-matching header. */
    classicLayout: boolean;
  };
  recipient: {
    name: string;
    company: string;
    address: string;
  };
  subject: string;
  date: string;
}

/** Fresh default cover letter. Factory (not a shared const) so no two resumes
 * alias the same nested objects under immer. */
export const createDefaultCoverLetter = (): ResumeCoverLetter => ({
  enabled: false,
  paragraphs: [],
  layout: {
    textAlign: 'left',
    showSender: false,
    showRecipient: false,
    showFooter: true,
    classicLayout: false,
  },
  recipient: {
    name: '',
    company: '',
    address: '',
  },
  subject: '',
  date: '',
});

/**
 * One entry of a user-defined section. The exported shape is shared with
 * KiwiTalents through the JSON Resume-compatible profile format (2026-10-05).
 * A `type`, not an `interface`: the store's generic item code reads entries as
 * `Record<string, unknown>`, which an interface (no index signature) is not.
 */
export type CustomSectionItem = {
  name: string;
  startDate: string;
  endDate: string;
  url: string;
  summary: string;
  highlights: string[];
  visible?: boolean;
  _vId?: string;
};

/**
 * A user-defined section. `id` is a `crypto.randomUUID()`; the layout refers to
 * it as `custom:<id>` (`customSectionToken`). `visible` is round-tripped, not
 * read: section visibility is `meta.content.hiddenSections`, as for every section.
 */
export type CustomSection = {
  id: string;
  title: string;
  items: CustomSectionItem[];
  visible?: boolean;
};

export interface ResumeData {
  basics: {
    name: string;
    label: string;
    image: string;
    _imageVId?: string;
    email: string;
    phone: string;
    url: string;
    summary: string;
    location: {
      address: string;
      postalCode: string;
      city: string;
      countryCode: string;
      region: string;
    };
    profiles: Array<{
      network: string;
      username: string;
      url: string;
      visible?: boolean;
      _vId?: string;
    }>;
  };
  work: Array<{
    name: string;
    position: string;
    location?: string;
    url: string;
    startDate: string;
    endDate: string;
    summary: string;
    highlights: string[];
    visible?: boolean;
    _vId?: string;
  }>;
  volunteer: Array<{
    organization: string;
    position: string;
    location?: string;
    url: string;
    startDate: string;
    endDate: string;
    summary: string;
    highlights: string[];
    visible?: boolean;
    _vId?: string;
  }>;
  education: Array<{
    institution: string;
    location?: string;
    url: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate: string;
    score: string;
    courses: string[];
    visible?: boolean;
    _vId?: string;
  }>;
  awards: Array<{
    title: string;
    date: string;
    awarder: string;
    location?: string;
    summary: string;
    url: string;
    visible?: boolean;
    _vId?: string;
  }>;
  certificates: Array<{
    name: string;
    date: string;
    issuer: string;
    url: string;
    visible?: boolean;
    _vId?: string;
  }>;
  publications: Array<{
    name: string;
    publisher: string;
    releaseDate: string;
    url: string;
    summary: string;
    visible?: boolean;
    _vId?: string;
  }>;
  skills: Array<{
    name: string;
    /** Skill proficiency from 0 to 100 (100 = perfectly mastered) */
    level?: SkillLevel;
    keywords: string[];
    visible?: boolean;
    _vId?: string;
  }>;
  languages: Array<{
    language: string;
    certificate: string;
    /** Fluency level: 0 (Not Specified), 1 (Elementary), 2 (Intermediate), 3 (Professional), 4 (Fluent), 5 (Native) */
    level?: FluencyLevel;
    visible?: boolean;
    _vId?: string;
  }>;
  interests: Array<{
    name: string;
    keywords: string[];
    visible?: boolean;
    _vId?: string;
  }>;
  references: Array<{
    name: string;
    reference: string;
    visible?: boolean;
    _vId?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    highlights: string[];
    /** JSON Resume v1 fields, kept for round trips; not rendered. */
    roles: string[];
    keywords: string[];
    startDate: string;
    endDate: string;
    url: string;
    entity: string;
    location?: string;
    type: string;
    visible?: boolean;
    _vId?: string;
  }>;
  privateProjects: Array<{
    name: string;
    description: string;
    highlights: string[];
    /** JSON Resume v1 fields, kept for round trips; not rendered. */
    roles: string[];
    keywords: string[];
    startDate: string;
    endDate: string;
    url: string;
    entity: string;
    location?: string;
    type: string;
    visible?: boolean;
    _vId?: string;
  }>;
  /** Always present on stored data: the persist migration seeds it for pre-4.1.0
   * stores and `sanitizeResumeData` defaults it for imports, mirroring how every
   * content section is required yet backfilled. */
  coverLetter: ResumeCoverLetter;
  /** User-defined sections; exported under the same top-level key. */
  customSections: CustomSection[];
  /**
   * Top-level blocks from an imported file that KiwiCV does not model, kept
   * verbatim and re-emitted at the top level on export. Never rendered,
   * never sent to AI. A holding area: once a key is modelled, a migration step
   * and `liftModelledFromPassthrough` move it out — see `ops/DATAMODEL.md`.
   */
  passthrough: Record<string, unknown>;
  meta: ResumeMeta;
}

// `Required<>` so an optional key left out here is TS2741: this object's keys are
// the modelled-key inventory pass-through is defined against.
export const initialResumeState: Required<ResumeData> = {
  basics: {
    name: '',
    label: '',
    image: '',
    _imageVId: 'image',
    email: '',
    phone: '',
    url: '',
    summary: '',
    location: {
      address: '',
      postalCode: '',
      city: '',
      countryCode: '',
      region: '',
    },
    profiles: [],
  },
  work: [],
  volunteer: [],
  education: [],
  awards: [],
  certificates: [],
  publications: [],
  skills: [],
  languages: [],
  interests: [],
  references: [],
  projects: [],
  privateProjects: [],
  coverLetter: createDefaultCoverLetter(),
  customSections: [],
  passthrough: {},
  meta: {
    version: __APP_VERSION__,
    theme: {
      name: 'lunar',
      locale: 'en',
      // ⚠️ Spread, not a literal: a second copy of the defaults here is exactly
      // the two-copy drift. See `THEME_PARAM_DEFAULTS`.
      params: { ...INITIAL_THEME_PARAMS },
    },
    export: {
      filenamePattern: '{name}',
      hostingPath: '/docs',
    },
    content: {
      hiddenIds: [],
      hiddenSections: [],
      order: {
        oneColumn: [],
        twoColumn: {
          main: [],
          sidebar: [],
          sidebarPosition: 'left',
        },
      },
      pageBreaks: {
        oneColumn: [],
        twoColumn: {
          main: [],
          sidebar: [],
        },
      },
    },
  },
};
export type ResumeSectionItem =
  | ResumeData['work'][number]
  | ResumeData['volunteer'][number]
  | ResumeData['education'][number]
  | ResumeData['awards'][number]
  | ResumeData['certificates'][number]
  | ResumeData['publications'][number]
  | ResumeData['skills'][number]
  | ResumeData['languages'][number]
  | ResumeData['interests'][number]
  | ResumeData['references'][number]
  | ResumeData['projects'][number]
  | ResumeData['privateProjects'][number]
  | ResumeData['basics']['profiles'][number];

export type VisibilitySection = SectionKey | 'profiles' | 'basics:image' | CustomSectionToken;
