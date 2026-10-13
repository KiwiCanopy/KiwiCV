import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  getActivePalette,
  getThemeList,
  getThemeMeta,
  paletteNameKey,
} from '@/components/preview/ThemeRegistry';
import { PageContainer } from '@/components/ui/PageContainer';
import { DesignDisclosure } from '@/features/dashboard/design/DesignDisclosure';
import { AddressSchemaEditor } from '@/features/dashboard/design/helpers/AddressSchemaEditor';
import { BoldHeaderOptions } from '@/features/dashboard/design/helpers/BoldHeaderOptions';
import { ColorPicker } from '@/features/dashboard/design/helpers/ColorPicker';
import { FontSizeScale } from '@/features/dashboard/design/helpers/FontSizeScale';
import { PdfFooterSection } from '@/features/dashboard/design/helpers/PdfFooterSection';
import { SectionOrderSection } from '@/features/dashboard/design/helpers/SectionOrderSection';
// Modular Helpers
import { ThemeSelector } from '@/features/dashboard/design/helpers/ThemeSelector';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { DESIGN_FOCUS_PARAM, DESIGN_SECTION_PARAM, type DesignGroupId } from '@/utils/designJump';
import { LayoutTemplate, ListTree, Settings2, Type } from 'lucide-react';

type DesignGroup = DesignGroupId;

export function DesignTab() {
  const { t, cvLanguage } = useTranslation();
  const resume = useResumeStore((state) => state.resume);
  const updateMeta = useResumeStore((state) => state.updateMeta);

  const currentTheme = resume.meta.theme.name || 'lunar';
  const themeMeta = useMemo(() => getThemeMeta(currentTheme), [currentTheme]);
  const [layoutFilter, setLayoutFilter] = useState<'one-column' | 'two-column'>(
    themeMeta.layout || 'two-column',
  );

  const currentPalette = resume.meta.theme.params?.palette;
  const currentFontSizeScale = resume.meta.theme.params?.fontSizeScale || 1;

  const [localThemeId, setLocalThemeId] = useState(currentTheme);
  const [localFontSize, setLocalFontSize] = useState(currentFontSizeScale);
  const [localPaletteId, setLocalPaletteId] = useState(currentPalette);
  // Groups open independently (matching the editor's SectionGroup accordions)
  // instead of the old mutually-exclusive single-open model.
  const [openGroups, setOpenGroups] = useState<Set<DesignGroup>>(() => new Set(['template']));

  const [searchParams, setSearchParams] = useSearchParams();

  // A "jump into Design" badge points the URL at a group + focus element. Open
  // the group first (a collapsed disclosure is `hidden`, so scrolling into it is
  // a no-op), then scroll + briefly highlight the target and clear the one-shot
  // params so a refresh or back-nav doesn't re-fire it.
  const jumpGroup = searchParams.get(DESIGN_SECTION_PARAM);
  const jumpFocus = searchParams.get(DESIGN_FOCUS_PARAM);

  // Open the requested group during render (the codebase's URL-sync idiom) so
  // the panel is committed before the effect below scrolls into it. Reset when
  // the params clear so re-jumping to the same group fires again.
  const [prevJumpGroup, setPrevJumpGroup] = useState<string | null>(null);
  if (jumpGroup !== prevJumpGroup) {
    setPrevJumpGroup(jumpGroup);
    if (jumpGroup) {
      setOpenGroups((prev) => new Set(prev).add(jumpGroup as DesignGroup));
    }
  }

  useEffect(() => {
    if (!jumpGroup) return;

    const timeoutId = window.setTimeout(() => {
      if (jumpFocus) {
        const el = document.getElementById(jumpFocus);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const channels = getComputedStyle(el).getPropertyValue('--primary').trim();
          const ring = channels ? `hsl(${channels})` : '#84cc16';
          el.animate([{ boxShadow: `0 0 0 3px ${ring}` }, { boxShadow: '0 0 0 3px transparent' }], {
            duration: 1400,
            easing: 'ease-out',
          });
        }
      }
      const next = new URLSearchParams(searchParams);
      next.delete(DESIGN_SECTION_PARAM);
      next.delete(DESIGN_FOCUS_PARAM);
      setSearchParams(next, { replace: true });
    }, 150);

    return () => window.clearTimeout(timeoutId);
    // searchParams/setSearchParams are stable enough here; re-run only on a new jump.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpGroup, jumpFocus]);

  const [prevTheme, setPrevTheme] = useState(currentTheme);
  const [prevPalette, setPrevPalette] = useState(currentPalette);
  const [prevFontSize, setPrevFontSize] = useState(currentFontSizeScale);
  const [prevThemeLayout, setPrevThemeLayout] = useState(themeMeta.layout);

  // Synchronize local state with store changes during render
  if (currentTheme !== prevTheme) {
    setPrevTheme(currentTheme);
    setLocalThemeId(currentTheme);
  }

  if (currentPalette !== prevPalette) {
    setPrevPalette(currentPalette);
    setLocalPaletteId(currentPalette);
  }

  if (currentFontSizeScale !== prevFontSize) {
    setPrevFontSize(currentFontSizeScale);
    setLocalFontSize(currentFontSizeScale);
  }

  if (themeMeta.layout !== prevThemeLayout) {
    setPrevThemeLayout(themeMeta.layout);
    if (themeMeta.layout) {
      setLayoutFilter(themeMeta.layout);
    }
  }

  const themeList = useMemo(() => {
    return getThemeList().sort((a, b) => {
      const nameA = t(a.nameKey).toLowerCase();
      const nameB = t(b.nameKey).toLowerCase();
      return nameA.localeCompare(nameB, cvLanguage);
    });
  }, [t, cvLanguage]);

  const handleThemeChange = useCallback(
    (themeId: string) => {
      if (themeId === resume.meta.theme.name) return;

      const defaultPalette = getThemeMeta(themeId).palettes[0].id;

      setLocalThemeId(themeId);
      setLocalPaletteId(defaultPalette);
      analytics.track(ANALYTICS_EVENTS.THEME_CHANGED, { themeId, defaultPalette });

      setTimeout(() => {
        updateMeta({
          theme: {
            ...resume.meta.theme,
            name: themeId,
            params: {
              ...resume.meta.theme.params,
              palette: defaultPalette,
            },
          },
        });
      }, 0);
    },
    [resume, updateMeta],
  );

  // Get current theme palettes for the color picker
  const activeSelectedTheme = themeList.find((t) => t.id === localThemeId) || themeMeta;
  const currentPalettes = activeSelectedTheme.palettes;
  const paletteSummary = getActivePalette(activeSelectedTheme.id, localPaletteId);
  const addressMode =
    resume.meta.theme.params?.addressSchema?.mode === 'custom' ? 'custom' : 'default';
  const selectedThemeSummary = t(activeSelectedTheme.nameKey);
  const selectedPaletteSummary = t(paletteNameKey(activeSelectedTheme.id, paletteSummary.id));
  const layoutSummary =
    themeMeta.layout === 'one-column'
      ? t('design.design_filter.one_column')
      : t('design.design_filter.two_column');
  const detailsSummary =
    addressMode === 'custom'
      ? t('design.address_schema_mode_custom')
      : t('design.address_schema_mode_default');
  const isGroupOpen = (group: DesignGroup) => openGroups.has(group);
  const setGroupOpen = (group: DesignGroup) => (open: boolean) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (open) next.add(group);
      else next.delete(group);
      return next;
    });
  };

  return (
    <PageContainer maxWidth="full" className="space-y-6 pb-12">
      <div className="space-y-3 pt-2">
        <DesignDisclosure
          id="design-template"
          title={t('design.template')}
          summary={
            selectedPaletteSummary
              ? `${selectedThemeSummary} · ${selectedPaletteSummary}`
              : selectedThemeSummary
          }
          icon={<LayoutTemplate className="h-5 w-5" />}
          open={isGroupOpen('template')}
          onOpenChange={setGroupOpen('template')}
        >
          <div className="space-y-6">
            <ThemeSelector
              themeList={themeList}
              localThemeId={localThemeId}
              layoutFilter={layoutFilter}
              setLayoutFilter={setLayoutFilter}
              handleThemeChange={handleThemeChange}
              t={t}
            />
            <ColorPicker
              themeId={activeSelectedTheme.id}
              currentPalettes={currentPalettes}
              localPaletteId={localPaletteId}
              setLocalPaletteId={setLocalPaletteId}
              t={t}
            />
          </div>
        </DesignDisclosure>

        <DesignDisclosure
          id="design-layout"
          title={t('design.groups.layout')}
          summary={layoutSummary}
          icon={<ListTree className="h-5 w-5" />}
          open={isGroupOpen('layout')}
          onOpenChange={setGroupOpen('layout')}
        >
          <SectionOrderSection t={t} />
        </DesignDisclosure>

        <DesignDisclosure
          id="design-typography"
          title={t('design.groups.typography')}
          summary={`${Math.round(localFontSize * 100)}%`}
          icon={<Type className="h-5 w-5" />}
          open={isGroupOpen('typography')}
          onOpenChange={setGroupOpen('typography')}
        >
          <div className="space-y-6">
            <FontSizeScale
              localFontSize={localFontSize}
              setLocalFontSize={setLocalFontSize}
              t={t}
            />
            <div className="border-border/70 border-t pt-6">
              <BoldHeaderOptions />
            </div>
          </div>
        </DesignDisclosure>

        <DesignDisclosure
          id="design-details"
          title={t('design.groups.details')}
          summary={detailsSummary}
          icon={<Settings2 className="h-5 w-5" />}
          open={isGroupOpen('details')}
          onOpenChange={setGroupOpen('details')}
        >
          <div className="space-y-6">
            <AddressSchemaEditor />
            <div className="border-border/70 border-t pt-6">
              <PdfFooterSection />
            </div>
          </div>
        </DesignDisclosure>
      </div>
    </PageContainer>
  );
}
