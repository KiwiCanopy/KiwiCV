export interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onConnected?: () => void;
}

export type GitHubConnectStatus = 'idle' | 'success' | 'error';
