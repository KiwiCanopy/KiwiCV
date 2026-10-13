import React from 'react';

import { mainColumnOnlyHint } from '@/components/editor/mainColumnHints';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TagField } from '@/components/ui/TagField';
import type { FieldLock } from '@/components/ui/fieldLock';
import { useTranslation } from '@/hooks/useTranslation';
import { type ResumeData, type SkillLevel } from '@/types/resume';
import { Sparkles } from 'lucide-react';

import { type LocalSkill, SKILL_LEVELS } from './types';

interface SkillsFormFieldProps {
  item: LocalSkill;
  index: number;
  updateSkill: (index: number, updatedFields: Partial<ResumeData['skills'][0]>) => void;
  /** From `useLockedFields`: the lock on a field, or `undefined`. */
  lockFor: (field: keyof ResumeData['skills'][number] & string) => FieldLock | null | undefined;
}

export const SkillsFormField: React.FC<SkillsFormFieldProps> = ({
  item,
  index,
  updateSkill,
  lockFor,
}) => {
  const { t, tCV } = useTranslation();

  const rawHint = tCV('editor.modules.skills.levels_hint');
  const infoHint = React.useMemo(() => {
    if (!rawHint) return null;
    const lines = rawHint.split('\n');
    return (
      <div className="text-popover-foreground flex flex-col gap-1.5 text-xs leading-relaxed not-italic">
        {lines.map((line, idx) => {
          const cleanLine = line.replace(/^•\s*/, '').trim();
          if (!cleanLine) return null;
          const colonIdx = cleanLine.indexOf(':');
          if (colonIdx !== -1) {
            const title = cleanLine.substring(0, colonIdx);
            const desc = cleanLine.substring(colonIdx + 1);
            return (
              <div key={idx} className="text-left">
                • <strong className="text-foreground font-bold">{title}</strong>: {desc}
              </div>
            );
          }
          return (
            <div key={idx} className="text-left">
              • {cleanLine}
            </div>
          );
        })}
      </div>
    );
  }, [rawHint]);

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label={t('editor.fields.skill_name')}
          value={item.name}
          onChange={(e) => updateSkill(index, { name: e.target.value })}
          placeholder={tCV('placeholders.skills.name')}
          lock={lockFor('name')}
        />
        <Select
          label={t('editor.fields.skill_level')}
          value={item.level !== undefined ? item.level.toString() : '0'}
          onChange={(e) =>
            updateSkill(index, {
              level: (parseInt(e.target.value) || 0) as SkillLevel,
            })
          }
          options={SKILL_LEVELS.map((level) => ({
            value: level.value.toString(),
            label: tCV(level.label),
          }))}
          infoHint={infoHint}
          infoInteractive={true}
          lock={lockFor('level')}
        />
      </div>
      <div className="mb-4">
        <TagField
          label={t('editor.fields.keywords')}
          singularLabel={t('editor.fields.keyword')}
          value={item.keywords || []}
          onChange={(val) => updateSkill(index, { keywords: val })}
          placeholder={tCV('placeholders.skills.keywords')}
          lock={lockFor('keywords')}
          // ⚠️ The one site that calls `mainColumnOnlyHint` directly rather than
          // going through `withMainColumnHints` — this form is hand-written JSX,
          // not an `ArrayForm` field list, so there is no array to map.
          // It is also the reason the badge inventory was miscounted twice: the
          // hint arrives here as a JSX *prop*, and every `grep`-shaped census had
          // been scoped by the `layoutHint:` object-property spelling.
          layoutHint={mainColumnOnlyHint('skills', 'keywords', t)}
          layoutIcon={Sparkles}
        />
      </div>
    </>
  );
};
