import { useState } from 'react';
import { createPortal } from 'react-dom';

import type { TagFieldControlType } from '@/components/ui/tag-field/types';
import { useTranslation } from '@/hooks/useTranslation';
import { isPrimaryActionChord } from '@/utils/primaryActionChord';

interface TagEditorDialogProps {
  id: string;
  text: string;
  type: TagFieldControlType;
  label?: string;
  singularLabel?: string;
  onUpdate?: (id: string, newText: string) => void;
  onClose: () => void;
}

export function TagEditorDialog({
  id,
  text,
  type,
  label,
  singularLabel,
  onUpdate,
  onClose,
}: TagEditorDialogProps) {
  const { t } = useTranslation();
  const [editText, setEditText] = useState(text);

  if (typeof document === 'undefined') {
    return null;
  }

  const cancel = () => {
    setEditText(text);
    onClose();
  };

  const save = () => {
    onUpdate?.(id, editText);
    onClose();
  };

  return createPortal(
    <div
      className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm duration-200"
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="animate-in zoom-in-95 border-border bg-card w-full max-w-lg rounded-[2rem] border p-6 shadow-2xl duration-200">
        <h3 className="text-foreground mb-4 text-base font-extrabold">
          {t('common.edit_field', {
            field: singularLabel || label || (type === 'textarea' ? 'Highlight' : 'Tag'),
          })}
        </h3>

        <div className="mb-6">
          {type === 'textarea' ? (
            <textarea
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              className="focus:ring-primary-strong focus:border-primary-strong border-input bg-background text-foreground min-h-[120px] w-full resize-y rounded-xl border p-3 text-sm focus:ring-2 focus:outline-none"
              autoFocus
              onFocus={(event) => event.target.select()}
              onKeyDown={(event) => {
                if (isPrimaryActionChord(event)) {
                  event.preventDefault();
                  save();
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  cancel();
                }
              }}
            />
          ) : (
            <input
              type="text"
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              className="focus:ring-primary-strong focus:border-primary-strong border-input bg-background text-foreground w-full rounded-xl border p-3 text-sm focus:ring-2 focus:outline-none"
              autoFocus
              onFocus={(event) => event.target.select()}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  save();
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  cancel();
                }
              }}
            />
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={cancel}
            className="border-input bg-card text-foreground hover:bg-muted focus-visible:ring-primary-strong rounded-xl border px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={save}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary-strong rounded-xl px-5 py-2 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
