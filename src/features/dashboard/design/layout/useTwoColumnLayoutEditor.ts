import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getSectionLabels, getThemeTranslations } from '@/components/preview/themes/shared';
import {
  sectionVisibilityTarget,
  withCustomSectionLabels,
} from '@/features/dashboard/design/layout/layoutSectionHelpers';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import {
  allLayoutSectionIds,
  getDefaultTwoColumnLayout,
  isLayoutSectionId,
  isTwoColumnTheme,
  layoutSectionExists,
} from '@/utils/layoutMetadata';

const FLIP_ANIMATION_MS = 700;

export function useTwoColumnLayoutEditor() {
  const {
    resume,
    setMainSections,
    setSideSections,
    setTwoColumnLayout,
    setSidebarPosition,
    toggleSectionVisibility,
    togglePageBreak,
  } = useResumeStore();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const themeName = resume.meta.theme.name;
  const hiddenSections = useMemo(
    () => new Set(resume.meta.content.hiddenSections || []),
    [resume.meta.content.hiddenSections],
  );
  const { mainSections, sideSections } = useMemo(() => {
    const order = resume.meta.content.order?.twoColumn;
    const currentMain = order?.main || [];
    const currentSide = order?.sidebar || [];
    const defaults = getDefaultTwoColumnLayout(themeName);
    const explicitlyPlaced = new Set([...currentMain, ...currentSide]);
    const seen = new Set<string>();
    // A custom token is a placeable id too; filtering on `isSectionKey`
    // dropped it here, and the next reorder persisted the column without it.
    const isListed = (sectionId: string) =>
      isLayoutSectionId(sectionId, resume) && layoutSectionExists(sectionId, resume);
    const getColumnSections = (primary: string[], fallback: string[]) => {
      const result: string[] = [];
      primary.forEach((sectionId) => {
        if (!isListed(sectionId) || seen.has(sectionId)) return;
        seen.add(sectionId);
        result.push(sectionId);
      });
      fallback.forEach((sectionId) => {
        if (!isListed(sectionId)) return;
        if (seen.has(sectionId) || explicitlyPlaced.has(sectionId)) return;
        seen.add(sectionId);
        result.push(sectionId);
      });
      return result;
    };
    const main = getColumnSections(currentMain, defaults.main);
    const side = getColumnSections(currentSide, defaults.sidebar);
    allLayoutSectionIds(resume).forEach((sectionId) => {
      if (layoutSectionExists(sectionId, resume) && !seen.has(sectionId)) {
        main.push(sectionId);
        seen.add(sectionId);
      }
    });
    return { mainSections: main, sideSections: side };
  }, [resume, themeName]);
  const customSections = resume.customSections;
  const untitled = t('common.untitled');
  const labels = useMemo(() => {
    const translations = getThemeTranslations(resume.meta.theme.locale);
    return withCustomSectionLabels(
      getSectionLabels(translations.sections || {}, resume.meta.theme.params?.sectionLabels),
      { customSections },
      untitled,
    );
  }, [resume.meta.theme.locale, resume.meta.theme.params?.sectionLabels, customSections, untitled]);
  const pageBreaks = resume.meta.content.pageBreaks?.twoColumn || { main: [], sidebar: [] };
  const [, setForceRender] = useState(0);

  const moveToSide = useCallback(
    (sectionId: string) => {
      setTwoColumnLayout(
        mainSections.filter((section) => section !== sectionId),
        [...sideSections, sectionId],
      );
      setForceRender((value) => value + 1);
    },
    [mainSections, sideSections, setTwoColumnLayout],
  );
  const moveToMain = useCallback(
    (sectionId: string) => {
      setTwoColumnLayout(
        [...mainSections, sectionId],
        sideSections.filter((section) => section !== sectionId),
      );
      setForceRender((value) => value + 1);
    },
    [mainSections, sideSections, setTwoColumnLayout],
  );
  const handleToggleVisibility = useCallback(
    (sectionId: string) => {
      const target = sectionVisibilityTarget(sectionId, resume);
      if (target) toggleSectionVisibility(target.section, target.items);
    },
    [resume, toggleSectionVisibility],
  );
  const handleEditSection = useCallback(
    (sectionId: string) => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('tab', 'editor');
      nextParams.set('section', sectionId);
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const storeSidebarPosition = resume.meta.content.order?.twoColumn?.sidebarPosition || 'left';
  const [sidebarPosition, setLocalSidebarPosition] = useState(storeSidebarPosition);
  const pendingFlipTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (pendingFlipTimeoutRef.current === null) {
      setLocalSidebarPosition(storeSidebarPosition);
    }
  }, [storeSidebarPosition]);

  const sideColRef = useRef<HTMLDivElement>(null);
  const mainColRef = useRef<HTMLDivElement>(null);
  const middleRef = useRef<HTMLDivElement>(null);
  const flipRectsRef = useRef<Record<string, DOMRect> | null>(null);
  const handleFlip = () => {
    if (sideColRef.current && mainColRef.current && middleRef.current) {
      flipRectsRef.current = {
        side: sideColRef.current.getBoundingClientRect(),
        main: mainColRef.current.getBoundingClientRect(),
        middle: middleRef.current.getBoundingClientRect(),
      };
    }
    const next = sidebarPosition === 'left' ? 'right' : 'left';
    setLocalSidebarPosition(next);
    if (pendingFlipTimeoutRef.current !== null) clearTimeout(pendingFlipTimeoutRef.current);
    pendingFlipTimeoutRef.current = window.setTimeout(() => {
      pendingFlipTimeoutRef.current = null;
      setSidebarPosition(next);
    }, FLIP_ANIMATION_MS + 50);
  };

  useLayoutEffect(() => {
    const previousRects = flipRectsRef.current;
    flipRectsRef.current = null;
    if (!previousRects || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const slide = (element: HTMLElement | null, previous: DOMRect | undefined) => {
      if (!element || !previous) return;
      const current = element.getBoundingClientRect();
      const x = previous.left - current.left;
      const y = previous.top - current.top;
      if (!x && !y) return;
      element.animate(
        [{ transform: `translate(${x}px, ${y}px)` }, { transform: 'translate(0, 0)' }],
        { duration: FLIP_ANIMATION_MS, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      );
    };
    slide(sideColRef.current, previousRects.side);
    slide(mainColRef.current, previousRects.main);
    slide(middleRef.current, previousRects.middle);
  }, [sidebarPosition]);

  return {
    t,
    isValidLayout: isTwoColumnTheme(themeName),
    isAllEmpty: mainSections.length === 0 && sideSections.length === 0,
    mainSections,
    sideSections,
    hiddenSections,
    labels,
    pageBreaks,
    sidebarPosition,
    sideColRef,
    mainColRef,
    middleRef,
    moveToSide,
    moveToMain,
    handleReorderMain: setMainSections,
    handleReorderSide: setSideSections,
    handleToggleVisibility,
    handleEditSection,
    handleFlip,
    togglePageBreak,
  };
}
