import { getThemeMeta, paletteIconFills } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { serializeIconsMap } from '@/components/preview/themes/shared/iconSerializer';
import { compileTypstPdf } from '@/hooks/useTypst';
import { type ResumeData } from '@/types/resume';
import { sanitizePath } from '@/utils/export';
import { generateThemedHTML } from '@/utils/html-generator';
import { enrichResumeWithPlaceholders } from '@/utils/placeholder-fallback';
import { shownProfileImage } from '@/utils/visibility';

interface PreviewTabOptions {
  loadingLabel?: string;
  tabTitle?: string;
}

export class PreviewPopupBlockedError extends Error {
  constructor() {
    super('Preview popup was blocked');
    this.name = 'PreviewPopupBlockedError';
  }
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ||
      character,
  );

const openLoadingTab = ({ loadingLabel = 'Generating preview…', tabTitle }: PreviewTabOptions) => {
  const previewTab = window.open('', '_blank');
  if (!previewTab) throw new PreviewPopupBlockedError();

  previewTab.opener = null;
  previewTab.document.title = tabTitle || 'KiwiCV';
  previewTab.document.body.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;margin:0;padding:24px;background:#f7f9f5;color:#1c373d;font:500 16px/1.5 Inter,system-ui,sans-serif">
      <p role="status">${escapeHtml(loadingLabel)}</p>
    </main>`;
  return previewTab;
};

export const openHTMLPreview = async (
  resume: ResumeData,
  tabTitle?: string,
  options: PreviewTabOptions = {},
) => {
  const previewTab = openLoadingTab({ ...options, tabTitle: options.tabTitle || tabTitle });

  try {
    // The tab title carries the KiwiCV suffix; the document's own <title> must not.
    const htmlContent = await generateThemedHTML(resume);
    const name = resume.basics.name || 'Resume';
    // Empty fallback: the label is an optional suffix, so a blank one is
    // dropped rather than replaced with the "Resume" stand-in.
    const label = sanitizePath(resume.basics.label, '');
    const filename = `${sanitizePath(name)}${label ? `_${label}` : ''}.html`;
    const url = URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' }));
    previewTab.location.replace(`${url}#filename=${filename}`);
  } catch (error) {
    previewTab.close();
    console.error('HTML preview failed:', error);
    throw error;
  }
};

export const openPDFPreview = async (
  resume: ResumeData,
  tabTitle?: string,
  options: PreviewTabOptions = {},
) => {
  const previewTab = openLoadingTab({ ...options, tabTitle: options.tabTitle || tabTitle });

  try {
    const name = resume.basics.name || 'Resume';
    // Empty fallback: the label is an optional suffix, so a blank one is
    // dropped rather than replaced with the "Resume" stand-in.
    const label = sanitizePath(resume.basics.label, '');
    const filename = `${sanitizePath(name)}${label ? `_${label}` : ''}.pdf`;
    const enrichedResume = enrichResumeWithPlaceholders(resume);
    const themeMeta = getThemeMeta(resume.meta.theme.name);
    const serializer = SERIALIZERS[themeMeta.id];
    if (!serializer) throw new Error(`Serializer not found for Typst theme: ${themeMeta.id}`);

    const markup = serializer(enrichedResume);
    const assets = serializeIconsMap(
      enrichedResume,
      paletteIconFills(themeMeta.id, resume.meta?.theme?.params?.palette),
    );
    const profileImage = shownProfileImage(enrichedResume);
    const pdfBytes = await compileTypstPdf(markup, assets, profileImage);
    const url = URL.createObjectURL(
      new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }),
    );
    previewTab.location.replace(`${url}#filename=${filename}`);
  } catch (error) {
    previewTab.close();
    console.error('PDF preview failed:', error);
    throw error;
  }
};
