import { getThemeMeta, paletteIconFills } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { serializeIconsMap } from '@/components/preview/themes/shared/iconSerializer';
import { type BuildExportArtifactsParams, type ExportArtifacts } from '@/hooks/export/types';
import { compileTypstPdf } from '@/hooks/useTypst';
import { getCleanProjectName, getProjectFilename } from '@/utils/export';
import { generateThemedHTML } from '@/utils/html-generator';
import { stringifyResume } from '@/utils/passthrough';
import { enrichResumeWithPlaceholders } from '@/utils/placeholder-fallback';
import { shownProfileImage } from '@/utils/visibility';

/**
 * Produces every deliverable of an export exactly once.
 *
 * This is the single acquisition point for the export package. Destinations
 * consume the result; none of them compile, render or serialize on their own.
 * A run that writes to three destinations therefore compiles one PDF.
 *
 * Throws when the active theme has no Typst serializer, which is the one
 * failure a caller must report before touching any destination — the older
 * copies of this code disagreed about it (the download path threw on a missing
 * serializer, the cloud paths threw on empty markup), so both checks are kept.
 */
export async function buildExportArtifacts({
  resume,
  projectName,
  formats,
}: BuildExportArtifactsParams): Promise<ExportArtifacts> {
  const backupFileName = projectName || getProjectFilename(resume);
  const folderName = getCleanProjectName(backupFileName) || 'Resume';

  let pdf: Blob | null = null;
  if (formats?.pdf !== false) {
    const themeMeta = getThemeMeta(resume.meta.theme.name);
    const serializer = SERIALIZERS[themeMeta.id];
    if (!serializer) {
      throw new Error(`Serializer not found for Typst theme: ${themeMeta.id}`);
    }

    // Enrich data with placeholders if empty (the HTML export does the same via ResumeHTML)
    const enrichedResume = enrichResumeWithPlaceholders(resume);
    const markup = serializer(enrichedResume);
    if (!markup) {
      throw new Error(`Serializer not found for Typst theme: ${themeMeta.id}`);
    }

    const assets = serializeIconsMap(
      enrichedResume,
      paletteIconFills(themeMeta.id, resume.meta?.theme?.params?.palette),
    );
    const profileImage = shownProfileImage(enrichedResume);
    const pdfBytes = await compileTypstPdf(markup, assets, profileImage);
    pdf = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  }

  const html = formats?.html === false ? null : await generateThemedHTML(resume, folderName);

  return {
    folderName,
    backupFileName,
    json: stringifyResume(resume),
    html,
    pdf,
  };
}
