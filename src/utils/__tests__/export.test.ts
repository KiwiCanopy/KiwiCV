import { type ResumeData, initialResumeState } from '@/types/resume';
import {
  constructBackupFilename,
  getCleanProjectName,
  getExportFiles,
  getProjectFilename,
  normalizeHostingPath,
  parseBackupFilename,
  sanitizePath,
} from '@/utils/export';
import { describe, expect, it } from 'vitest';

/**
 * `export.ts` names every file KiwiCV writes: the download ZIP, the Google Drive
 * backup, the GitHub repository folder, and the PDF shown in the viewer. It had
 * no direct tests. The backup filename format is a *stored* format — existing
 * cloud backups are parsed with the same regex that wrote them — so the
 * roundtrip below is a compatibility pin, not just a unit test.
 */

function resumeNamed(name: string, pattern = '{name}'): ResumeData {
  return {
    ...initialResumeState,
    basics: { ...initialResumeState.basics, name },
    meta: {
      ...initialResumeState.meta,
      export: { ...initialResumeState.meta.export, filenamePattern: pattern },
    },
  };
}

describe('sanitizePath', () => {
  it('replaces spaces with underscores', () => {
    expect(sanitizePath('Max Mustermann')).toBe('Max_Mustermann');
  });

  it('replaces characters that are illegal in a path, including dots', () => {
    expect(sanitizePath('a<b>c:d"e/f\\g|h?i*j.k')).toBe('a_b_c_d_e_f_g_h_i_j_k');
  });

  it('flattens newlines and tabs instead of leaving control characters', () => {
    expect(sanitizePath('line one\nline\ttwo')).toBe('line_one_line_two');
  });

  it('collapses runs of underscores and trims them from both ends', () => {
    expect(sanitizePath('__a___b__')).toBe('a_b');
  });

  it('truncates to 50 characters', () => {
    expect(sanitizePath('x'.repeat(80))).toBe('x'.repeat(50));
  });

  it('returns Resume for an empty name', () => {
    expect(sanitizePath('')).toBe('Resume');
  });

  /**
   * A name made only of illegal characters sanitizes down to nothing. Callers
   * feed the result straight into a filename (`${getProjectFilename(r)}.pdf`)
   * or a Git path, where an empty segment produces `.pdf` or a broken path, and
   * `filenamePattern` is user-editable in Settings — so this input is reachable.
   */
  it.each(['...', '///', '***', '   ', '___'])(
    'returns Resume rather than an empty segment for %s',
    (input) => {
      expect(sanitizePath(input)).toBe('Resume');
    },
  );

  /**
   * The fallback is right for a whole filename and wrong for an optional
   * segment: substituting `Resume` for an absent company would invent a value
   * the user never typed, and `constructBackupFilename` stores segments as real
   * metadata that `parseBackupFilename` reads back out.
   */
  it.each(['', '...', '///'])('honours an empty fallback for the optional segment %s', (input) => {
    expect(sanitizePath(input, '')).toBe('');
  });

  it('does not apply the fallback when sanitizing leaves something behind', () => {
    expect(sanitizePath('a.b', '')).toBe('a_b');
  });
});

describe('getExportFiles', () => {
  it('returns the JSON backup plus the PDF and HTML placeholders', () => {
    const files = getExportFiles(resumeNamed('Ada'));

    expect(files.map((f) => [f.name, f.type])).toEqual([
      ['resume.json', 'json'],
      ['resume.pdf', 'pdf'],
      ['index.html', 'html'],
    ]);
  });

  /**
   * This is the *local backup*, not the reduced public export — it carries the
   * full store on purpose so a restore is lossless. The filtered surface is
   * `getFilteredResumeData` in `resume-export.ts`, covered separately.
   */
  it('serializes the complete resume, hidden data included', () => {
    const resume = resumeNamed('Ada');
    const json = getExportFiles(resume).find((f) => f.type === 'json');

    const { passthrough: _passthrough, ...modelled } = resume;
    expect(JSON.parse(json?.content ?? '{}')).toEqual(modelled);
  });

  it('writes pass-through blocks back at the top level, never under their container', () => {
    const resume = { ...resumeNamed('Ada'), passthrough: { kiwitalents: { open: true } } };
    const parsed = JSON.parse(
      getExportFiles(resume).find((f) => f.type === 'json')?.content ?? '{}',
    );

    expect(parsed.kiwitalents).toEqual({ open: true });
    expect(parsed).not.toHaveProperty('passthrough');
  });

  it('leaves the PDF and HTML content null for the UI layer to fill in', () => {
    const files = getExportFiles(resumeNamed('Ada'));

    expect(files.map((f) => f.content === null)).toEqual([false, true, true]);
  });
});

describe('getProjectFilename', () => {
  it('expands the stored filename pattern and sanitizes the result', () => {
    expect(getProjectFilename(resumeNamed('Max Mustermann'))).toBe('Max_Mustermann');
  });

  it('honours a custom pattern', () => {
    expect(getProjectFilename(resumeNamed('Ada', 'cv_{name}_{lang}'))).toBe('cv_Ada_en');
  });

  it('never returns an empty filename for a punctuation-only name', () => {
    expect(getProjectFilename(resumeNamed('...'))).toBe('Resume');
  });
});

describe('constructBackupFilename / parseBackupFilename roundtrip', () => {
  it('preserves every component through a roundtrip', () => {
    const filename = constructBackupFilename('My CV', 'Acme Inc', 'Senior Dev', 'lunar');

    expect(filename).toBe('My_CV_position_Senior_Dev_company_Acme_Inc_theme_lunar');
    expect(parseBackupFilename(filename)).toEqual({
      base: 'My CV',
      position: 'Senior Dev',
      company: 'Acme Inc',
      theme: 'lunar',
    });
  });

  /**
   * The stored order is base/position/company/theme even though the UI displays
   * company before position. Existing backups depend on it.
   */
  it('writes position before company regardless of argument order', () => {
    expect(constructBackupFilename('base', 'CO', 'POS', 'theme')).toMatch(
      /_position_POS_company_CO_theme_theme$/,
    );
  });

  it('round-trips missing components through the `undefined` sentinel', () => {
    const filename = constructBackupFilename('My CV');

    expect(filename).toBe('My_CV_position_undefined_company_undefined_theme_undefined');
    expect(parseBackupFilename(filename)).toEqual({
      base: 'My CV',
      position: undefined,
      company: undefined,
      theme: undefined,
    });
  });

  /**
   * A punctuation-only company or position sanitizes to nothing. It must stay
   * nothing: storing the `Resume` fallback here would round-trip out of
   * `parseBackupFilename` as a company literally named "Resume" and surface in
   * the cloud-restore list and the Drive folder name.
   */
  it('does not invent a company or position that sanitizes to nothing', () => {
    const filename = constructBackupFilename('My CV', '...', '???', 'lunar');

    expect(filename).toBe('My_CV_position__company__theme_lunar');
    expect(parseBackupFilename(filename)).toMatchObject({ company: '', position: '' });
    expect(getCleanProjectName(filename)).toBe('My_CV');
  });

  it('strips a .json extension before parsing', () => {
    expect(parseBackupFilename('My_CV_position_Dev_company_Acme_theme_lunar.json').base).toBe(
      'My CV',
    );
  });

  it('treats a filename without the metadata keys as a bare base name', () => {
    expect(parseBackupFilename('Just_A_Name.json')).toEqual({ base: 'Just A Name' });
  });

  it('leaves the theme untouched, since theme ids never contain spaces', () => {
    expect(parseBackupFilename('b_position_p_company_c_theme_swiss_grid').theme).toBe('swiss_grid');
  });
});

describe('getCleanProjectName', () => {
  it('joins base, company and position, and drops the theme', () => {
    const filename = constructBackupFilename('My CV', 'Acme Inc', 'Senior Dev', 'lunar');

    expect(getCleanProjectName(filename)).toBe('My_CV_Acme_Inc_Senior_Dev');
  });

  it('omits components stored as the `undefined` sentinel', () => {
    expect(getCleanProjectName(constructBackupFilename('My CV'))).toBe('My_CV');
  });

  it('returns a sanitized base name for a filename carrying no metadata', () => {
    expect(getCleanProjectName('Just A Name.json')).toBe('Just_A_Name');
    expect(getCleanProjectName('Already_Underscored.json')).toBe('Already_Underscored');
  });
});

/**
 * The stored default is `'/docs'` (`resume.ts`, `validation.ts`), which is
 * truthy — so the `|| 'docs/index.html'` fallback the GitHub Pages push relied
 * on never fired, and the literal `/docs` reached the Contents API as a `path`.
 * These are the shapes a user can actually type into the target-path field.
 */
describe('normalizeHostingPath', () => {
  it('turns the stored default into the file Pages actually serves', () => {
    expect(normalizeHostingPath('/docs')).toBe('docs/index.html');
  });

  it('leaves a path that already names an HTML file alone', () => {
    expect(normalizeHostingPath('docs/cv.html')).toBe('docs/cv.html');
  });

  it('strips the slashes that make a repository path look like a URL', () => {
    expect(normalizeHostingPath('/site/pages/')).toBe('site/pages/index.html');
    expect(normalizeHostingPath('docs//nested')).toBe('docs/nested/index.html');
  });

  it('falls back when nothing usable is left', () => {
    expect(normalizeHostingPath('')).toBe('docs/index.html');
    expect(normalizeHostingPath('/')).toBe('docs/index.html');
    expect(normalizeHostingPath('   ')).toBe('docs/index.html');
    expect(normalizeHostingPath(undefined)).toBe('docs/index.html');
  });

  it('writes to the repository root when the path is just a filename', () => {
    expect(normalizeHostingPath('index.html')).toBe('index.html');
  });
});
