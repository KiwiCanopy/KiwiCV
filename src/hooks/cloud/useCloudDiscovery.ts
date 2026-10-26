import React from 'react';

import type { GoogleDriveRoot } from '@/constants/cloud';
import {
  fromDriveAppProperties,
  peelBackup,
  readCachedPostingUrl,
  writeCachedPostingUrl,
} from '@/hooks/cloud/applicationMeta';
import { useTranslation } from '@/hooks/useTranslation';
import { GitHubService } from '@/services/github';
import { type DriveFile, googleDriveService } from '@/services/google-drive';
import { loadGoogleDriveCreds } from '@/services/storage/googleStorage';
import {
  type BackupFile,
  type BackupSource,
  useCvLibraryStore,
} from '@/store/library/useCvLibraryStore';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { parseBackupFilename } from '@/utils/export';

export function useCloudDiscovery() {
  const { t } = useTranslation();
  const pat = localStorage.getItem('github_pat') || sessionStorage.getItem('github_pat');
  const repo = localStorage.getItem('github_repo');
  const refreshToken = loadGoogleDriveCreds();
  // Drive sync on is the consent to send the token. The handshake stays out of
  // the gate: it is still pending on a cold load, and the library caches a pass.
  const driveSyncEnabled = useResumeStore((state) => !!state.sync?.googleDrive?.enabled);

  const githubPaths = React.useRef<Record<string, string>>({});

  const discoverBackups = async (
    targetLocale?: string,
    specificSource?: 'github' | 'google_drive',
    preFetchedBackups?: Record<string, DriveFile[]> | null,
  ) => {
    const foundBackups: Record<
      string,
      Partial<Record<'github' | 'google_drive', BackupFile[]>>
    > = {};

    // Both providers used to swallow their failure into a `console.warn` and
    // report "no backups found", which is a lie when a token has expired. The
    // caller decides what to do with it: one of two providers failing is a
    // warning, every attempted provider failing is an error state.
    const attempted: BackupSource[] = [];
    const failed: BackupSource[] = [];

    const getBackupLabel = (filename: string) => {
      if (filename === 'resume.json') return t('sync.manual_backup');
      return parseBackupFilename(filename).base;
    };

    const enhanceBackupFile = (file: {
      name: string;
      id?: string;
      updatedAt?: string;
      driveRoot?: GoogleDriveRoot;
      postingUrl?: string | null;
      sha?: string;
    }): BackupFile => {
      const meta = parseBackupFilename(file.name);
      return {
        ...(file.postingUrl && { postingUrl: file.postingUrl }),
        ...(file.sha && { sha: file.sha }),
        id: file.id,
        name: file.name,
        label: getBackupLabel(file.name),
        updatedAt: file.updatedAt,
        driveRoot: file.driveRoot,
        company: meta.company,
        position: meta.position,
        theme: meta.theme,
      };
    };

    // --- GitHub ---
    if (specificSource === 'github' || (!specificSource && pat && repo)) {
      attempted.push('github');
      try {
        const gh = new GitHubService(pat!);
        const [owner, repoName] = repo!.split('/');

        const scanConfirmedLocation = async (locale: string, loc: string) => {
          const contents = await gh.listContents(owner, repoName, loc);
          const jsonFiles = contents.filter((f) => f.type === 'file' && f.name.endsWith('.json'));
          if (jsonFiles.length > 0) {
            if (!foundBackups[locale]) foundBackups[locale] = {};

            const filesWithDates = await Promise.all(
              jsonFiles.map(async (f) => {
                const commit = await gh.getLastCommit(owner, repoName, `${loc}/${f.name}`);
                return enhanceBackupFile({
                  name: f.name,
                  updatedAt: commit?.commit?.committer?.date || commit?.commit?.author?.date,
                  sha: f.sha,
                  postingUrl: readCachedPostingUrl(f.sha),
                });
              }),
            );

            foundBackups[locale]!.github = filesWithDates;
            githubPaths.current[locale] = loc;
            return true;
          }
          return false;
        };

        const rootLocations = ['backups', 'backup'];
        const rootContentsMap: Record<
          string,
          Awaited<ReturnType<GitHubService['listContents']>>
        > = {};

        for (const root of rootLocations) {
          rootContentsMap[root] = await gh.listContents(owner, repoName, root);
        }

        if (targetLocale) {
          for (const root of rootLocations) {
            const hasLocale = rootContentsMap[root].some(
              (item) => item.type === 'dir' && item.name === targetLocale,
            );
            if (hasLocale) {
              const success = await scanConfirmedLocation(targetLocale, `${root}/${targetLocale}`);
              if (success) break;
            }
          }
        } else {
          for (const root of rootLocations) {
            for (const item of rootContentsMap[root]) {
              if (item.type === 'dir') {
                const locale = item.name;
                if (!foundBackups[locale]?.github) {
                  await scanConfirmedLocation(locale, `${root}/${locale}`);
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('[Discovery] GitHub check failed:', err);
        failed.push('github');
      }
    }

    // --- Google Drive ---
    if (
      specificSource === 'google_drive' ||
      (!specificSource && driveSyncEnabled && refreshToken)
    ) {
      attempted.push('google_drive');
      try {
        const backupMap =
          preFetchedBackups || (await googleDriveService.discoverBackups(refreshToken!));
        const entries = targetLocale
          ? ([[targetLocale, backupMap[targetLocale] || []]] as const)
          : Object.entries(backupMap);

        for (const [locale, files] of entries) {
          if (files.length === 0) continue;
          if (!foundBackups[locale]) foundBackups[locale] = {};
          foundBackups[locale]!.google_drive = (files as DriveFile[]).map((f) =>
            enhanceBackupFile({
              id: f.id,
              name: f.name,
              updatedAt: f.modifiedTime,
              driveRoot: f.driveRoot,
              postingUrl: fromDriveAppProperties(f.appProperties),
            }),
          );
        }
      } catch (err) {
        console.warn('[Discovery] Google Drive check failed:', err);
        failed.push('google_drive');
      }
    }

    // The path map has to outlive this hook instance: `useCloudOperations`
    // builds every GitHub file path from it, and the library page remounts.
    useCvLibraryStore.setState({ githubPaths: { ...githubPaths.current } });

    return { foundBackups, githubPaths: githubPaths.current, attempted, failed };
  };

  /**
   * Fills the posting links the per-device cache missed, one file read each,
   * after the list has rendered (#54). The master backup never carries one.
   */
  const hydrateGitHubPostingUrls = async (
    foundBackups: Record<string, Partial<Record<BackupSource, BackupFile[]>>>,
    paths: Record<string, string>,
  ) => {
    if (!pat || !repo) return;
    const gh = new GitHubService(pat);
    const [owner, repoName] = repo.split('/');
    const misses = Object.entries(foundBackups).flatMap(([locale, sources]) =>
      (sources.github ?? [])
        .filter(
          (file) =>
            file.name !== 'resume.json' && file.sha && readCachedPostingUrl(file.sha) === undefined,
        )
        .map((file) => ({ locale, file })),
    );

    // A few at a time: a fresh device can have dozens of versions to read.
    const queue = [...misses];
    const worker = async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        const { locale, file } = next;
        try {
          const content = await gh.getFileContent(
            owner,
            repoName,
            `${paths[locale] || `backups/${locale}`}/${file.name}`,
          );
          const { postingUrl } = peelBackup(content ? JSON.parse(content) : null);
          writeCachedPostingUrl(file.sha!, postingUrl);
          if (postingUrl) {
            useCvLibraryStore.getState().setPostingUrl(locale, 'github', file.name, postingUrl);
          }
        } catch (err) {
          // Not cached, so the next visit tries again.
          console.warn('[Discovery] Could not read the posting link:', err);
        }
      }
    };
    await Promise.all(Array.from({ length: 4 }, worker));
  };

  return { discoverBackups, hydrateGitHubPostingUrls, githubPaths };
}
