import { type AIEditContext } from '@/components/modals/ai/edit/types';
import { AIActionCards } from '@/components/modals/ai/template/AIActionCards';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { type AIPromptMode } from '@/store/ui/useFlowStore';
import { getAITrackingParams } from '@/utils/ai';

interface AISelectionViewProps {
  context: AIEditContext;
}

export const AISelectionView = ({ context }: AISelectionViewProps) => {
  const { activeTarget, isTranslationMode, setMode } = context;

  return (
    <div className="mx-auto w-full max-w-md space-y-3 pt-4 sm:pt-6">
      <AIActionCards
        onSelect={(id) => {
          const nextMode = id as AIPromptMode;
          // Through `getAITrackingParams`: the raw target carries an entry's
          // `_vId` and a custom section's uuid, stable keys across sessions.
          analytics.track(ANALYTICS_EVENTS.AI_TOOL_SELECTED, {
            mode: nextMode,
            ...getAITrackingParams(activeTarget),
          });
          setMode(nextMode);
        }}
        showTranslate={isTranslationMode}
      />
    </div>
  );
};
