import { type FC } from 'react';

import { ResumeHTML } from '@/components/preview/ResumeHTML';
import { BRAND_CONFIG } from '@/config/brand';
import { useTranslation } from '@/hooks/useTranslation';
import { type HeroThemeName } from '@/pages/LandingPage/sections/components/heroThemes';
import { initialResumeState } from '@/types/resume';
import {
  Briefcase,
  CloudUpload,
  FileText,
  Folder,
  FolderOpen,
  GraduationCap,
  Heart,
  IdCard,
  Languages,
  Lightbulb,
  Palette,
  ScrollText,
  Share,
  Sparkles,
  SquarePen,
} from 'lucide-react';

interface HeroGraphicProps {
  /** Driven by the pill strip below the mock, which lives outside this
   *  `aria-hidden` subtree — a focusable control inside it would be reachable
   *  by keyboard and invisible to assistive tech at the same time. */
  themeName: HeroThemeName;
}

export const HeroGraphic: FC<HeroGraphicProps> = ({ themeName }) => {
  const { t, language } = useTranslation();
  // The section rail, not the old stack of collapsing group cards. Icons come
  // from the same lucide set `SECTION_METADATA` assigns, and the count badge
  // mirrors the real row: dimmed and grey at zero.
  const railRows: {
    key: string;
    label: string;
    Icon: typeof IdCard;
    /**
     * ⚠️ `null` means **no badge at all**, not zero. The real rail's
     * `UNCOUNTED_ROWS` excludes `basics` and `coverLetter` because "0" there
     * would read as *empty* rather than as *not a list* — the cover letter is a
     * document and basics is a single form. A mock that badges them is showing
     * an editor the app does not have.
     */
    count: number | null;
    active: boolean;
  }[] = [
    // ⚠️ The cover letter LEADS, as it does in the real rail — it is a separate
    // document and page one of the export when it is active, so the mock would
    // be showing an editor that no longer exists if it trailed or was absent.
    // `ScrollText` is the same icon the rail uses; it is the one rail row whose
    // glyph does not come from `SECTION_METADATA`.
    {
      key: 'coverLetter',
      label: t('editor.coverLetter.title'),
      Icon: ScrollText,
      count: null,
      active: false,
    },
    { key: 'basics', label: t('editor.basics.title'), Icon: IdCard, count: null, active: false },
    { key: 'work', label: t('editor.sections.work'), Icon: Briefcase, count: 3, active: true },
    {
      key: 'education',
      label: t('editor.sections.education'),
      Icon: GraduationCap,
      count: 2,
      active: false,
    },
    { key: 'skills', label: t('editor.sections.skills'), Icon: Lightbulb, count: 9, active: false },
    {
      key: 'languages',
      label: t('editor.sections.languages'),
      Icon: Languages,
      count: 3,
      active: false,
    },
    // Deliberately empty: the dimmed, greyed badge is how the real rail says a
    // section has nothing in it yet, and the mock should show that state too.
    {
      key: 'projects',
      label: t('editor.sections.projects'),
      Icon: Folder,
      count: 0,
      active: false,
    },
    // ⚠️ These two exist to be CLIPPED. The rail is 207px at 27px a row, so
    // roughly seven and a half fit — and a list of seven that ends with clear
    // space below reads as the whole set. The real editor has fifteen sections,
    // so a mock that looks complete at seven undersells the product. Running
    // past the fold is what a real scrolling rail does.
    //
    // The seven above stay curated rather than being the true first seven in
    // rail order: `profiles`, `publications` and `references` come before
    // `skills` and `languages` in the real list, and the recognisable sections
    // do more work in a hero than a faithful prefix would.
    {
      key: 'volunteer',
      label: t('editor.sections.volunteer'),
      Icon: Heart,
      count: 0,
      active: false,
    },
    {
      key: 'interests',
      label: t('editor.sections.interests'),
      Icon: Sparkles,
      count: 0,
      active: false,
    },
  ];

  return (
    <div
      className="bg-secondary border-border relative mx-auto w-full max-w-[42rem] rounded-[1.5rem] border p-3 sm:p-5"
      aria-hidden="true"
      // `aria-hidden` alone hid the mock from screen readers but left it in the
      // tab order: `ResumeHTML` renders the sample CV's real `<a href>` links,
      // so keyboard users tabbed through 13 links to `google.com/search?q=John+Doe`
      // that no assistive tech could announce. `inert` removes both the
      // semantics and the focusability. The theme pills sit outside this
      // element and stay interactive.
      inert
    >
      <div className="bg-card border-border flex overflow-hidden rounded-2xl border shadow-[var(--elevation-2)]">
        {/* ⚠️ The nav column is the darkest surface on screen, not a white
            strip with a hairline. The palette spends colour on zones: `--nav` is the
            one dark edge that makes the workspace beside it read as bright, so
            a mock that paints it `bg-card` is showing the flat palette the app
            left behind. Roles come from `SidebarContent` — `bg-nav-active` with
            the strong foreground for the current destination, the muted one for
            the rest. */}
        <aside className="border-nav-border bg-nav text-nav-foreground hidden w-12 shrink-0 flex-col items-center border-r py-2 sm:flex">
          <img src={BRAND_CONFIG.assets.symbol} alt="" className="h-7 w-7 object-contain" />
          <div className="mt-5 flex flex-col gap-2">
            <span className="bg-nav-active text-nav-foreground-strong flex h-8 w-8 items-center justify-center rounded-md">
              <FileText className="h-4 w-4" />
            </span>
            <span className="flex h-8 w-8 items-center justify-center">
              <FolderOpen className="h-4 w-4" />
            </span>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="border-border flex min-h-12 items-center gap-2 border-b px-2.5 sm:px-3">
            {/* The real dashboard names the document and reports its save state
                here; the marketing mock drops both — nothing on the page has a
                name to show, and the claim belongs to the Privacy section. */}
            <div className="bg-secondary mr-auto flex rounded-md p-0.5">
              <span className="bg-card flex items-center gap-1 rounded-sm px-2 py-1.5 text-[0.6rem] font-semibold shadow-[var(--elevation-1)] sm:text-[0.68rem]">
                <SquarePen className="h-3 w-3" />
                {t('dashboard.edit')}
              </span>
              <span className="text-muted-foreground flex items-center gap-1 px-2 py-1.5 text-[0.6rem] sm:text-[0.68rem]">
                <Palette className="h-3 w-3" />
                {t('dashboard.design')}
              </span>
            </div>

            {/* The resume language moved out of the editor body and up here,
                beside the tabs, when the section rail replaced the page header
                that used to hold it. */}
            <span className="border-border text-foreground hidden h-8 items-center rounded-md border px-2 text-[0.6rem] font-semibold lg:flex">
              {language.toUpperCase()}
            </span>
            <span className="bg-secondary text-foreground flex h-8 items-center gap-1 rounded-md px-2 text-[0.6rem] font-medium">
              <CloudUpload className="h-3 w-3" />
              <span className="hidden sm:inline">{t('dashboard.backup')}</span>
            </span>
            <span className="bg-primary text-primary-foreground flex h-8 items-center gap-1 rounded-md px-2 text-[0.6rem] font-semibold">
              <Share className="h-3 w-3" />
              <span className="hidden sm:inline">{t('dashboard.export')}</span>
            </span>
          </div>

          {/* The AI composer spans the workspace above the split, because it
              acts on the whole CV rather than the section you happen to be in.
              Reduced to its shape here: what it does, and the one control that
              runs it. */}
          <div className="border-border flex items-center gap-2 border-b px-2.5 py-2 sm:px-3">
            {/* ⚠️ `bg-secondary` with a `--primary-strong` glyph, matching the
                real composer's tile. It used to be a filled `bg-primary` block,
                and the real one stopped being that when the band learned to
                collapse: filled, this decorative square was the highest-salience
                object on the row, and it is `aria-hidden`. The salience belongs
                to the run button. A mock that still fills it is advertising a
                dashboard that no longer exists. */}
            <span className="bg-secondary text-primary-strong flex h-6 w-6 shrink-0 items-center justify-center rounded-sm">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="min-w-0 flex-1 truncate text-[0.6rem] font-semibold sm:text-[0.68rem]">
              {t('ai.composer_title')}
            </p>
            <span className="bg-secondary text-muted-foreground hidden items-center rounded-sm px-2 py-1.5 text-[0.58rem] font-medium sm:flex">
              {t('ai.composer_mode_job')}
            </span>
            <span className="bg-primary text-primary-foreground flex shrink-0 items-center rounded-sm px-2 py-1.5 text-[0.58rem] font-semibold">
              {t('ai.composer_run')}
            </span>
          </div>

          <div className="grid min-h-[19rem] grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] sm:min-h-[25rem]">
            {/* The rail sits one step below the workspace, and the desk one
                step above it — `bg-background` and `bg-secondary` were the
                earlier stand-ins for both. */}
            <div className="border-border bg-rail border-r p-2 sm:p-3">
              <p className="text-muted-foreground px-1.5 pt-1 pb-2 text-[0.5rem] font-bold tracking-[0.14em] uppercase">
                {t('editor.rail.title')}
              </p>

              <div className="space-y-0.5">
                {railRows.map(({ key, label, Icon, count, active }) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2 rounded-md px-1.5 py-1.5 ${
                      active
                        ? 'bg-rail-active text-foreground font-semibold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-primary-strong' : ''}`}
                    />
                    <span className="min-w-0 flex-1 truncate text-[0.58rem] font-medium sm:text-[0.64rem]">
                      {label}
                    </span>
                    {/* Same badge rule as the real row: dimmed and grey at zero,
                        and absent entirely for the rows the rail does not count. */}
                    {count !== null && (
                      <span
                        className={`bg-muted text-muted-foreground inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded px-1 text-[0.5rem] font-medium ${
                          count === 0 ? 'opacity-40 grayscale' : ''
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-desk flex min-w-0 flex-col">
              <div className="border-border bg-card flex h-9 shrink-0 items-center justify-center gap-1 border-b">
                <span className="bg-secondary rounded-md px-2 py-1 text-[0.55rem] font-semibold">
                  {t('preview.view_html')}
                </span>
                <span className="text-muted-foreground px-2 py-1 text-[0.55rem]">
                  {t('preview.view_pdf')}
                </span>
              </div>
              <div className="flex flex-1 items-center justify-center p-3 sm:p-5">
                <div className="border-border relative aspect-[210/297] h-[14.5rem] max-h-full overflow-hidden rounded-md border bg-white shadow-[var(--elevation-2)] sm:h-[20rem]">
                  <div
                    className="pointer-events-none absolute top-0 left-0 origin-top-left scale-[0.207] text-left select-none sm:scale-[0.285]"
                    style={{
                      width: '793.7px',
                      height: '1122.5px',
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      colorScheme: 'light',
                    }}
                  >
                    <ResumeHTML
                      key={`hero-${themeName}-cv`}
                      headingTag="div"
                      data={{
                        ...initialResumeState,
                        meta: {
                          ...initialResumeState.meta,
                          theme: {
                            ...initialResumeState.meta.theme,
                            name: themeName,
                            locale: language,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-pale-kiwi absolute -right-2 -bottom-2 h-14 w-14 rounded-tl-[2.5rem] rounded-br-[1.5rem] opacity-70" />
    </div>
  );
};
