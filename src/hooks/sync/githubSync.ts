import { buildExportArtifacts } from '@/hooks/export/buildExportArtifacts';
import { type SyncParams, type SyncResult } from '@/hooks/sync/types';
import { GitHubService } from '@/services/github';
import {
  GITHUB_LAST_FULL_PUSH_HASH_KEY,
  GITHUB_LAST_HOSTING_HASH_KEY,
  GITHUB_LAST_SYNC_HASH_KEY,
  githubConnection,
} from '@/services/storage/githubStorage';
import { fullPushStamp } from '@/services/storage/syncHashes';
import { getCleanProjectName, getProjectFilename, normalizeHostingPath } from '@/utils/export';
import { generateThemedHTML } from '@/utils/html-generator';
import { stringifyResume } from '@/utils/passthrough';
import { getPublicBackupData } from '@/utils/resume-export';

export const performGitHubSync = async (
  params: SyncParams,
  githubConfig: { repo: string },
): Promise<SyncResult> => {
  const { resume, variant, lang, t, currentHash, includeBackup } = params;
  const { repo } = githubConfig;

  try {
    const connection = githubConnection();
    if (!connection.pat || !repo) throw new Error(t('sync.error_github_creds'));

    const gh = new GitHubService(connection.pat);
    const [owner, repoName] = repo.split('/');

    // --- Redundant Sync Protection ---
    let alreadySynced = false;

    const langSuffix = lang ? ` (${lang})` : '';
    let commitMsg = `${t('sync.commit_prefix')} ${t('sync.commit_main')}${langSuffix}`;
    const backupFileName =
      variant === 'full' ? params.projectName || getProjectFilename(resume) : undefined;
    const cleanFolderName = backupFileName ? getCleanProjectName(backupFileName) : undefined;

    if (variant === 'full' && backupFileName) {
      const lastFullHash = localStorage.getItem(GITHUB_LAST_FULL_PUSH_HASH_KEY);
      if (lastFullHash === (await fullPushStamp(currentHash, backupFileName))) {
        alreadySynced = true;
      }
    } else if (variant === 'hosting') {
      const lastHostingHash = localStorage.getItem(GITHUB_LAST_HOSTING_HASH_KEY);
      if (lastHostingHash === currentHash) {
        alreadySynced = true;
      }
    } else {
      // standard or config (Backup button)
      const lastSyncHash = localStorage.getItem(GITHUB_LAST_SYNC_HASH_KEY);
      if (lastSyncHash === currentHash) {
        alreadySynced = true;
      }
    }

    if (alreadySynced) {
      return { service: 'github', success: true, alreadySynced: true };
    }

    // The full store goes only to a private repo nobody else can read: not an
    // Enterprise "internal" one, not one Pages publishes, and never one whose
    // visibility is unknown. Any other gets getPublicBackupData.
    const repoInfo = await gh.getRepo(owner, repoName).catch(() => null);
    const isPrivateRepo =
      repoInfo?.private === true &&
      repoInfo.visibility !== 'internal' &&
      repoInfo.has_pages !== true;
    const backupJson = isPrivateRepo
      ? stringifyResume(resume)
      : JSON.stringify(getPublicBackupData(resume), null, 2);

    if (variant === 'full' && backupFileName && cleanFolderName) {
      commitMsg = `${t('sync.commit_prefix')} ${t('sync.commit_config_at_export', {
        name: cleanFolderName,
      })}`;
      const filesToPush: { path: string; content: string }[] = [];

      // The deliverables are built once per run by the caller. Compiling here
      // would drive the single Typst worker a second time for the same export.
      const artifacts =
        params.artifacts ?? (await buildExportArtifacts({ resume, projectName: backupFileName }));
      // ⚠️ The one second compile: a repo anyone can read gets the PDF without the
      // cover letter, whose recipient is a third party (owner 2026-10-05).
      const repoPdf =
        artifacts.pdf && !isPrivateRepo && resume.coverLetter?.enabled
          ? (
              await buildExportArtifacts({
                resume: { ...resume, coverLetter: { ...resume.coverLetter, enabled: false } },
                projectName: backupFileName,
                formats: { html: false },
              })
            ).pdf
          : artifacts.pdf;

      // 1. Include PDF
      if (repoPdf) {
        // Convert PDF Blob to base64 for GitHub push
        const pdfBlob = repoPdf;
        const reader = new FileReader();
        const pdfBase64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(pdfBlob);
        });
        const pdfBase64 = await pdfBase64Promise;
        filesToPush.push({ path: `${cleanFolderName}.pdf`, content: pdfBase64 });
      }

      // 2. Include HTML
      if (artifacts.html) {
        filesToPush.push({ path: 'index.html', content: artifacts.html });
      }

      // PUSH DELIVERABLES (PDF/HTML) to exports/{cleanFolderName}/
      await gh.pushExport(
        owner,
        repoName,
        cleanFolderName,
        filesToPush,
        `${t('sync.commit_prefix')} ${t('sync.commit_export')}${langSuffix} - ${cleanFolderName}`,
      );

      // 3. Include Project Snapshot JSON in backups/{lang}/ using the full backupFileName
      await gh.pushFile(
        owner,
        repoName,
        `backups/${lang}/${backupFileName}.json`,
        backupJson,
        `${t('sync.commit_prefix')} ${t('sync.commit_export')}${langSuffix} - ${cleanFolderName} (Backup)`,
      );

      const stamp = await fullPushStamp(currentHash, backupFileName);
      connection.writeHash(GITHUB_LAST_FULL_PUSH_HASH_KEY, stamp);
    } else if (variant === 'hosting') {
      // Reuse the run's HTML when there is one — publishing alongside the
      // repository destination must not render the document a second time. The
      // standalone Backup-button path still has none and renders its own.
      const html =
        params.artifacts?.html ?? (await generateThemedHTML(resume, getProjectFilename(resume)));
      const hostingPath = normalizeHostingPath(resume.meta.export.hostingPath);
      await gh.pushFile(
        owner,
        repoName,
        hostingPath,
        html,
        `${t('sync.commit_prefix')} ${t('sync.commit_hosting')}${langSuffix}`,
      );
      connection.writeHash(GITHUB_LAST_HOSTING_HASH_KEY, currentHash);
    } else if (variant === 'config') {
      commitMsg = `${t('sync.commit_prefix')} ${t('sync.commit_config')}${langSuffix}`;
    }

    // Sync the main backup JSON for standard or config variants, OR if explicitly requested
    // This keeps backups/{lang}/resume.json as the latest "General Backup"
    // We only update this master backup if the user clicked the Save button (mode === 'sync')
    if (includeBackup && params.mode === 'sync') {
      await gh.pushFile(
        owner,
        repoName,
        `backups/${lang}/resume.json`,
        backupJson,
        variant === 'hosting'
          ? `${t('sync.commit_prefix')} ${t('sync.commit_hosting_backup')}${langSuffix}`
          : commitMsg,
      );
      connection.writeHash(GITHUB_LAST_SYNC_HASH_KEY, currentHash);
    }

    return {
      service: 'github',
      success: true,
      ...(variant === 'full' && { folderName: cleanFolderName }),
    };
  } catch (err: unknown) {
    return { service: 'github', success: false, error: (err as Error).message };
  }
};
