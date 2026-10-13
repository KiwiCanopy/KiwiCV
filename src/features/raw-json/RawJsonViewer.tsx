import { useState } from 'react';

import type { RawJsonTab } from '@/features/raw-json/types';
import { useTranslation } from '@/hooks/useTranslation';
import { Check, Copy, Download } from 'lucide-react';

interface RawJsonViewerProps {
  tab: RawJsonTab;
}

const displayJson = (data: RawJsonTab['data']) =>
  JSON.stringify(
    data,
    (_, value) => {
      if (typeof value === 'string' && value.startsWith('data:') && value.length > 80) {
        return value.slice(0, 40) + '…[base64 image]';
      }
      return value;
    },
    2,
  );

const CopyButton = ({ data }: { data: RawJsonTab['data'] }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground p-2 transition-colors"
      title={t('raw_json.copy_clipboard')}
    >
      {copied ? <Check className="text-success h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
};

const DownloadButton = ({ data, filename }: { data: RawJsonTab['data']; filename: string }) => {
  const { t } = useTranslation();

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'resume.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="text-muted-foreground hover:text-foreground p-2 transition-colors"
      title={t('raw_json.download')}
    >
      <Download className="h-4 w-4" />
    </button>
  );
};

export const RawJsonViewer = ({ tab }: RawJsonViewerProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <h2 className="text-foreground text-lg font-extrabold">{tab.title}</h2>
          <p className={`text-xs font-medium ${tab.descColor}`}>{tab.desc}</p>
        </div>
      </div>
      <div className="border-border bg-card group relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border shadow-inner">
        <div className="border-border bg-muted flex shrink-0 items-center justify-between border-b px-3 py-1.5 select-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-kiwi h-2 w-2 rounded-full" />
              <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                {t('raw_json.data_label')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="border-border bg-background flex items-baseline gap-1.5 rounded border px-2 py-0.5">
                <span className="text-muted-foreground font-mono text-[9px] tracking-tight uppercase">
                  lines:
                </span>
                <span className="text-foreground font-mono text-[10px] font-bold">
                  {JSON.stringify(tab.data, null, 2).split('\n').length}
                </span>
              </div>
              <div className="border-border bg-background flex items-baseline gap-1.5 rounded border px-2 py-0.5">
                <span className="text-muted-foreground font-mono text-[9px] tracking-tight uppercase">
                  size:
                </span>
                <span className="text-foreground font-mono text-[10px] font-bold">
                  {(new Blob([JSON.stringify(tab.data)]).size / 1024).toFixed(1)}KB
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <DownloadButton data={tab.data} filename={tab.filename} />
            <CopyButton data={tab.data} />
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
          {/* ⚠️ `text-foreground`, and the per-tab `color` field is gone with it.
              The three tabs used to be tinted green / grey / mist, which read
              only because the panel was a fixed `bg-gray-900`. On a surface that
              follows the theme, two of those three are a light colour on a light
              card. The tab strip above already names which view this is, so the
              tint was decoration carrying no information the labels did not. */}
          <pre className="text-foreground font-mono text-sm break-all whitespace-pre-wrap md:break-normal md:whitespace-pre">
            {displayJson(tab.data)}
          </pre>
        </div>
      </div>
    </div>
  );
};
