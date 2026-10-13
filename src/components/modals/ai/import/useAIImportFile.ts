import { useCallback, useState } from 'react';

import { AI_MAX_UPLOAD_BYTES, AI_MAX_UPLOAD_MB } from '@/constants/ai';
import { useTranslation } from '@/hooks/useTranslation';
import { useFlowStore } from '@/store/ui/useFlowStore';
import { useToastStore } from '@/store/ui/useToastStore';
import mammoth from 'mammoth';

export function useAIImportFile() {
  const { t } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);
  const setImportFile = useFlowStore((state) => state.setImportFile);
  const setStep = useFlowStore((state) => state.setImportStep);
  const [extractedDocxImage, setExtractedDocxImage] = useState<string | null>(null);

  const handleFileChange = async (selectedFile: File) => {
    if (selectedFile.size > AI_MAX_UPLOAD_BYTES) {
      addToast(t('ai.import_error_file_too_large', { size: AI_MAX_UPLOAD_MB }), 'error');
      return;
    }

    try {
      if (selectedFile.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setImportFile({ base64: result.split(',')[1] }, selectedFile.name, selectedFile.type);
          setStep('style');
        };
        reader.readAsDataURL(selectedFile);
      } else if (
        selectedFile.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });

        try {
          const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
          const imgMatch = htmlResult.value.match(/<img[^>]+src="(data:image\/[^"]+)"/i);
          if (imgMatch) setExtractedDocxImage(imgMatch[1]);
        } catch (error) {
          console.warn('Image extraction from docx failed', error);
        }

        setImportFile({ text: result.value }, selectedFile.name, selectedFile.type);
        setStep('style');
      } else {
        const text = await selectedFile.text();
        setImportFile({ text }, selectedFile.name, selectedFile.type);
        setStep('style');
      }
    } catch (error) {
      console.error('File reading failed', error);
      addToast(t('ai.import_error_read_failed'), 'error');
    }
  };

  const resetFileState = useCallback(() => setExtractedDocxImage(null), []);

  return { extractedDocxImage, handleFileChange, resetFileState };
}
