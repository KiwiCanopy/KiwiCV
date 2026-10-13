import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { ResumeHTML } from '@/components/preview/ResumeHTML';
import { getThemeMeta, paletteIconFills } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { serializeIconsMap } from '@/components/preview/themes/shared/iconSerializer';
import { PageContainer } from '@/components/ui/PageContainer';
import { PdfErrorFallback } from '@/features/dashboard/preview/PdfErrorFallback';
import { usePdfSync } from '@/hooks/usePdfSync';
import { useTranslation } from '@/hooks/useTranslation';
import { useTypst } from '@/hooks/useTypst';
import { useResumeStore } from '@/store/resume/useResumeStore';
import type { ViewMode } from '@/store/ui/useUIStore';
import { getProjectFilename } from '@/utils/export';
import { readPdfPageCount } from '@/utils/pdf-page-count';
import { enrichResumeWithPlaceholders } from '@/utils/placeholder-fallback';
import { shownProfileImage } from '@/utils/visibility';
import { LoaderCircle } from 'lucide-react';

interface ViewerProps {
  viewMode: ViewMode;
}

export function Viewer({ viewMode }: ViewerProps) {
  const resume = useResumeStore((state) => state.resume);
  const pdfResume = usePdfSync();
  const { t } = useTranslation();
  const { compilePdf } = useTypst();

  const isPdfRenderError = useResumeStore((state) => state.isPdfRenderError);
  const setIsPdfRenderError = useResumeStore((state) => state.setIsPdfRenderError);
  const setPdfPageCount = useResumeStore((state) => state.setPdfPageCount);
  const setIsGeneratingPDF = useResumeStore((state) => state.setIsGeneratingPDF);
  const setIsSyncingData = useResumeStore((state) => state.setIsSyncingData);

  const themeName = resume.meta.theme.name;
  const themeMeta = useMemo(() => getThemeMeta(themeName), [themeName]);

  const [typstPdfUrl, setTypstPdfUrl] = useState<string | null>(null);
  const [typstCompiling, setTypstCompiling] = useState(false);
  const [typstErrorState, setTypstErrorState] = useState<string | null>(null);

  // Enrich data with placeholders if empty (matches the HTML preview in ResumeHTML)
  const enrichedPdfResume = useMemo(() => enrichResumeWithPlaceholders(pdfResume), [pdfResume]);

  const [retryToken, setRetryToken] = useState(0);

  const hasSerializer = !!SERIALIZERS[themeMeta.id];

  const markup = useMemo(() => {
    const serializer = SERIALIZERS[themeMeta.id];
    if (!serializer) {
      return '';
    }
    return serializer(enrichedPdfResume);
  }, [themeMeta.id, enrichedPdfResume]);

  // Retry is only meaningful when a recompile could produce a different
  // outcome. A theme with no serializer fails identically every time.
  const canRetry = hasSerializer && !!markup;

  const handleRetry = () => {
    // Enter the compiling state in the same commit that clears the error, so
    // the lockout on the open-in-tab actions is never lifted onto a state that
    // still reads as idle.
    setTypstErrorState(null);
    setTypstCompiling(true);
    setIsGeneratingPDF(true);
    setIsPdfRenderError(false);
    setPdfPageCount(null);
    setRetryToken((token) => token + 1);
  };

  useEffect(() => {
    // A missing serializer, or one that produces nothing, used to leave the
    // preview on a permanent spinner. Surface it as a render error so the
    // state is at least legible. Deferred for the same reason as the
    // compile-start transition below.
    if (!hasSerializer || !markup) {
      let isCurrent = true;
      void Promise.resolve().then(() => {
        if (!isCurrent) return;
        setTypstCompiling(false);
        setIsGeneratingPDF(false);
        setIsSyncingData(false);
        setTypstErrorState(
          hasSerializer
            ? `Typst theme produced no markup: ${themeMeta.id}`
            : `Serializer not found for Typst theme: ${themeMeta.id}`,
        );
        setIsPdfRenderError(true);
        setPdfPageCount(null);
      });
      return () => {
        isCurrent = false;
      };
    }

    let isCurrent = true;
    Promise.resolve().then(() => {
      if (isCurrent) {
        setTypstCompiling(true);
        setIsGeneratingPDF(true);
        setTypstErrorState(null);
        // Cleared on every compile start, so a stale count from the previous
        // document never sits under a document that is still rendering.
        setPdfPageCount(null);
      }
    });

    const assets = serializeIconsMap(
      enrichedPdfResume,
      paletteIconFills(themeMeta.id, resume.meta?.theme?.params?.palette),
    );
    const profileImage = shownProfileImage(enrichedPdfResume);
    compilePdf(markup, assets, profileImage)
      .then((pdfBytes) => {
        if (isCurrent) {
          const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setTypstPdfUrl((prevUrl) => {
            if (prevUrl) {
              URL.revokeObjectURL(prevUrl);
            }
            return url;
          });
          setTypstCompiling(false);
          setIsGeneratingPDF(false);
          setIsSyncingData(false);
          setIsPdfRenderError(false);
          setPdfPageCount(readPdfPageCount(pdfBytes as unknown as Uint8Array));
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setTypstErrorState(err.message || String(err));
          setTypstCompiling(false);
          setIsGeneratingPDF(false);
          setIsSyncingData(false);
          setIsPdfRenderError(true);
          setPdfPageCount(null);
        }
      });

    return () => {
      isCurrent = false;
      setTypstPdfUrl((prevUrl) => {
        if (prevUrl) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });
    };
  }, [
    markup,
    compilePdf,
    resume,
    setIsPdfRenderError,
    setPdfPageCount,
    setIsGeneratingPDF,
    setIsSyncingData,
    themeMeta.id,
    hasSerializer,
    enrichedPdfResume,
    retryToken,
  ]);

  const containerRef = useRef<HTMLDivElement>(null);

  const documentName = useMemo(() => `${getProjectFilename(resume)}.pdf`, [resume]);

  // The browser tab title is Helmet's alone. This component used to write
  // `document.title` directly and won by writing last, shipping
  // "KiwiCV Resume of Resume" on /dashboard — a sitemapped, indexable route,
  // so the visitor's own name would have become crawled title text.
  // `preview.tab_title` itself stays: it is also the PDF document metadata
  // title (`cvTitle` in themes/shared/translations.ts), which is unrelated.

  return (
    <div
      ref={containerRef}
      className="bg-muted/30 relative flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      {/* PDF Layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          viewMode === 'pdf' ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
        } flex flex-col`}
      >
        <div className="bg-muted/30 relative flex min-h-0 w-full flex-1 items-stretch justify-center p-4 md:p-6 lg:p-8">
          <PageContainer
            maxWidth="full"
            className="border-border/40 relative h-full w-full overflow-hidden rounded-lg border bg-white shadow-[var(--elevation-2)]"
          >
            <div className="relative h-full w-full bg-[#525659]">
              {typstPdfUrl && (
                <iframe
                  src={`${typstPdfUrl}#toolbar=1&navpanes=0&scrollbar=1&filename=${documentName}`}
                  className="h-full w-full border-none bg-[#525659] shadow-inner"
                  title={t('preview.pdf_frame_title')}
                />
              )}
              {typstCompiling && (
                <div className="animate-in fade-in absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm duration-300">
                  <div className="border-border/50 flex flex-col items-center gap-3 rounded-xl border bg-white p-6 shadow-lg">
                    <LoaderCircle className="text-primary-strong h-10 w-10 animate-spin" />
                    <p className="text-muted-foreground text-sm font-medium">
                      {t('preview.generating_pdf')}
                    </p>
                  </div>
                </div>
              )}
              {typstErrorState || isPdfRenderError ? (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white">
                  <PdfErrorFallback
                    t={t}
                    onRetry={canRetry ? handleRetry : undefined}
                    details={typstErrorState}
                  />
                </div>
              ) : null}
              {!typstPdfUrl && !typstCompiling && !typstErrorState && !isPdfRenderError ? (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                  <div className="border-border/50 flex flex-col items-center gap-3 rounded-xl border bg-white p-6 shadow-lg">
                    <LoaderCircle className="text-primary-strong h-10 w-10 animate-spin" />
                    <p className="text-muted-foreground text-sm font-medium">
                      {t('preview.generating_pdf')}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </PageContainer>
        </div>
      </div>

      {/* HTML Layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          viewMode === 'html' ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
        } bg-muted/30 overflow-y-auto p-4 md:p-8`}
      >
        <PageContainer
          id="theme-preview-container"
          maxWidth="full"
          className="border-border/40 mx-auto w-full overflow-hidden rounded-sm border bg-white shadow-[var(--elevation-2)] print:my-0 print:border-none print:shadow-none"
        >
          <ResumeHTML data={resume} />
        </PageContainer>
      </div>
    </div>
  );
}

export const MemoizedViewer = memo(Viewer);
MemoizedViewer.displayName = 'MemoizedViewer';
