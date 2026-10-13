import React from 'react';

import { Button } from '@/components/ui/Button';
import { AI_MAX_UPLOAD_MB } from '@/constants/ai';
import { useTranslation } from '@/hooks/useTranslation';
import { Upload } from 'lucide-react';

interface AIImportUploadStepProps {
  onFileDrop: (file: File) => void;
  onBack: () => void;
}

export const AIImportUploadStep: React.FC<AIImportUploadStepProps> = ({ onFileDrop, onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile) onFileDrop(droppedFile);
        }}
        className="group relative"
      >
        <input
          id="ai-file-upload"
          type="file"
          accept=".pdf,.docx,.txt"
          className="peer sr-only"
          onChange={(e) => e.target.files?.[0] && onFileDrop(e.target.files[0])}
        />
        <label
          htmlFor="ai-file-upload"
          className="border-border bg-muted/30 hover:bg-muted/50 peer-focus-visible:outline-ring flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 sm:p-10"
        >
          <Upload className="text-primary-strong mb-4 h-10 w-10" aria-hidden="true" />
          <span className="font-semibold">{t('ai.import_drop_zone')}</span>
          <span className="text-muted-foreground mt-1 text-xs">
            {t('ai.import_max_size', { size: AI_MAX_UPLOAD_MB })}
          </span>
        </label>
      </div>
      <Button onClick={onBack} variant="quiet" className="mt-4 w-full">
        {t('common.back')}
      </Button>
    </div>
  );
};
