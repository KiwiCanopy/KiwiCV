import { GITHUB_API_VERSION } from '@/constants/cloud';
import { fromBase64, toBase64 } from '@/utils/base64';
import { Octokit } from '@octokit/rest';

export class GitHubService {
  private octokit: Octokit | null = null;

  private get headers() {
    return {
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
    };
  }

  constructor(token?: string) {
    if (token) {
      this.initialize(token);
    }
  }

  initialize(token: string) {
    this.octokit = new Octokit({
      auth: token,
      headers: this.headers,
    });
  }

  isAuthenticated(): boolean {
    return !!this.octokit;
  }

  async getUser() {
    if (!this.octokit) throw new Error('Not authenticated');
    const { data } = await this.octokit.users.getAuthenticated();
    return data;
  }

  async getRepo(owner: string, repo: string) {
    if (!this.octokit) throw new Error('Not authenticated');
    try {
      const { data } = await this.octokit.repos.get({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      // @ts-expect-error - Octokit errors are not typed by default
      if (error.status === 404) return null;
      throw error;
    }
  }

  async createRepo(name: string, description?: string) {
    // NOTE: This scope might need 'public_repo' or 'repo' depending on visibility
    if (!this.octokit) throw new Error('Not authenticated');
    const { data } = await this.octokit.repos.createForAuthenticatedUser({
      name,
      description,
      private: true, // Default to private for safety
      auto_init: true, // Create README to allow immediate pushes
    });
    return data;
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    if (!this.octokit) throw new Error('Not authenticated');
    try {
      // Use octokit.rest.repos.getContent for standard path handling and cache-busting
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        headers: this.headers,
        t: Date.now(), // Cache-buster (passed as query param)
      });

      const data = response.data;

      if (Array.isArray(data) || !('content' in data)) {
        throw new Error('Path is a directory, not a file');
      }

      // Content is base64 encoded. Use robust fromBase64 for UTF-8 support.
      return fromBase64(data.content);
    } catch (error) {
      // @ts-expect-error - Octokit errors
      if (error.status === 404) return null;
      throw error;
    }
  }

  async getSha(owner: string, repo: string, path: string): Promise<string | undefined> {
    if (!this.octokit) throw new Error('Not authenticated');
    try {
      // Use octokit.rest.repos.getContent for standard path handling and cache-busting
      // Note: 404 responses here are expected and handled (indicating a new file)
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        headers: this.headers,
        t: Date.now(), // Cache-buster (passed as query param)
      });

      const data = response.data;
      if (data && typeof data === 'object' && 'sha' in data && !Array.isArray(data)) {
        return (data as { sha: string }).sha;
      }
      return undefined;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404)
        return undefined;
      throw error;
    }
  }

  async listContents(owner: string, repo: string, path: string) {
    if (!this.octokit) throw new Error('Not authenticated');
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        headers: this.headers,
        t: Date.now(),
      });

      const data = response.data;
      if (Array.isArray(data)) {
        return data; // Array of file/directory objects
      }
      return [];
    } catch (error) {
      // @ts-expect-error - Octokit errors
      if (error.status === 404) return [];
      throw error;
    }
  }

  async getLastCommit(owner: string, repo: string, path: string) {
    if (!this.octokit) throw new Error('Not authenticated');
    try {
      const { data } = await this.octokit.repos.listCommits({
        owner,
        repo,
        path,
        headers: this.headers,
        per_page: 1,
      });
      return data[0] || null;
    } catch (_error) {
      return null;
    }
  }

  async pushFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    isBase64 = false,
  ) {
    if (!this.octokit) throw new Error('Not authenticated');

    // Check if file exists to get SHA for update
    const sha = await this.getSha(owner, repo, path);

    // Encode content to Base64 if not already encoded
    const contentBase64 = isBase64 ? content : toBase64(content);

    const { data } = await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: contentBase64,
      sha, // Provide SHA if updating
      headers: this.headers,
    });

    return data;
  }

  async deleteFile(owner: string, repo: string, path: string, message: string) {
    if (!this.octokit) throw new Error('Not authenticated');

    const sha = await this.getSha(owner, repo, path);
    if (!sha) throw new Error('File not found');

    const { data } = await this.octokit.repos.deleteFile({
      owner,
      repo,
      path,
      message,
      sha,
      headers: this.headers,
    });

    return data;
  }

  // Sync logic for Exports (with collision detection)
  async pushExport(
    owner: string,
    repo: string,
    folderName: string,
    files: { path: string; content: string }[],
    message: string,
  ) {
    if (!this.octokit) throw new Error('Not authenticated');

    // 1. Target folder is stable (no collision detection to allow consistent hosting)
    const targetFolder = folderName;

    // 2. Push files to targetFolder
    const results = [];
    for (const file of files) {
      // Simple detection: if path ends in .pdf, treat as base64
      const isBinary = file.path.endsWith('.pdf');

      const result = await this.pushFile(
        owner,
        repo,
        `exports/${targetFolder}/${file.path}`,
        file.content,
        `${message} - ${file.path}`,
        isBinary,
      );
      results.push(result);
    }

    return { folder: targetFolder, results };
  }

  /**
   * Generates a pre-filled GitHub URL for creating a fine-grained Personal Access Token.
   * Pre-fills: Token Name (KiwiCV), Repository Selection (Selected), and Contents (Write).
   */
  static getPatCreationUrl(): string {
    const baseUrl = 'https://github.com/settings/personal-access-tokens/new';
    const params = new URLSearchParams({
      name: 'KiwiCV',
      contents: 'write',
    });

    return `${baseUrl}?${params.toString()}`;
  }
}
