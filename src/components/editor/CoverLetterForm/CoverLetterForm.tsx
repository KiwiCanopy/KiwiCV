import type { ReactNode } from 'react';

import { CoverLetterParagraphs } from '@/components/editor/CoverLetterForm/CoverLetterParagraphs';
import { startCoverLetterDraft } from '@/components/editor/CoverLetterForm/coverLetterDraft';
import { hasLetterProse } from '@/components/editor/CoverLetterForm/letterProse';
import { useCoverLetterForm } from '@/components/editor/CoverLetterForm/useCoverLetterForm';
import { EmptySectionState } from '@/components/ui/EmptySectionState';
import { Input } from '@/components/ui/Input';
import { Section } from '@/components/ui/Section';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { EntryDiffPanel } from '@/features/dashboard/editor/proposals/EntryDiffPanel';
import { useLockedFields } from '@/features/dashboard/editor/proposals/useLockedFields';
import { useAIEntryGuard } from '@/hooks/useAIEntryGuard';
import { useTranslation } from '@/hooks/useTranslation';
import { useUIStore } from '@/store/ui/useUIStore';
import type { ResumeCoverLetter } from '@/types/resume';
import { itemTarget } from '@/utils/aiTarget';
import { isItemEmpty } from '@/utils/items';
import { AlignJustify, AlignLeft, Contact, LayoutTemplate, PenLine, Sparkles } from 'lucide-react';

/** A labelled row pairing a caption with a segmented control. */
function ToggleRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <span className="text-foreground text-sm font-medium">{label}</span>
        {hint && <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function CoverLetterForm() {
  const { t } = useTranslation();
  const {
    coverLetter,
    setEnabled,
    setSubject,
    setDate,
    setRecipientField,
    setLayoutField,
    setParagraphs,
  } = useCoverLetterForm();
  const { recipient, layout } = coverLetter;
  const recipientChoice = useUIStore((state) => state.coverLetterRecipientCollapsed);
  const setRecipientCollapsed = useUIStore((state) => state.setCoverLetterRecipientCollapsed);
  // Content decides only until the user acts: an edit latches it open, so
  // clearing the last field never collapses the section under their cursor.
  const recipientCollapsed = recipientChoice ?? isItemEmpty(recipient);
  const editRecipient = (field: keyof typeof recipient, value: string) => {
    if (recipientChoice === null) setRecipientCollapsed(false);
    setRecipientField(field, value);
  };
  const { allowRun, modals, hasPass } = useAIEntryGuard();
  const lockFor = useLockedFields<ResumeCoverLetter>(itemTarget('coverLetter'));

  /**
   * ⚠️ Straight to the write path, not into the chooser: with no letter the
   * chooser has one live row repeating this panel's own title, which moves the
   * decision instead of removing it. Through the SAME guard as the header
   * control — a second entry point with its own copy of the checks is how one
   * of them ends up unguarded.
   */
  const startDraft = () => {
    if (!allowRun()) return;
    startCoverLetterDraft();
  };

  return (
    <div className="space-y-2">
      {modals}
      {/* ⚠️ Form level, above `Recipient` — deliberately NOT inside `Content`
          with the body it describes. Both sub-sections are collapsible, and a
          panel inside a collapsed one is invisible: exactly the defect
          `EntryDiffPanel`'s own docstring says it was built to end ("a collapsed
          entry with four rewritten fields looked exactly like an untouched
          one"), in the section where the change is largest.

          `paragraphs` is prose: compared by toggling between the two versions,
          never by pairing them up. See `ProseDiffRow`. */}
      <EntryDiffPanel<ResumeCoverLetter>
        target={itemTarget('coverLetter')}
        fieldLabels={{
          subject: t('editor.coverLetter.subject'),
          paragraphs: t('editor.coverLetter.body_label'),
        }}
        proseFields={['paragraphs']}
        // ⚠️ `mx-0` only. `BasicsForm` also passes `mb-0` because its panel sits
        // inside a card that supplies the spacing; this one is a direct child of
        // the form and needs its own, or it butts straight against the enable
        // switch at 0px.
        className="mx-0"
      />

      {/* Master switch: the letter is only exported/rendered when enabled. */}
      <div className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-[var(--elevation-1)]">
        <div className="min-w-0">
          <span className="text-foreground text-sm font-semibold">
            {t('editor.coverLetter.enable_title')}
          </span>
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
            {t('editor.coverLetter.enable_desc')}
          </p>
        </div>
        <SegmentedToggle
          value={coverLetter.enabled}
          onChange={setEnabled}
          options={[
            { value: true, label: t('editor.coverLetter.on') },
            { value: false, label: t('editor.coverLetter.off') },
          ]}
        />
      </div>

      {/* ⚠️ Above `Recipient`, and unconditionally — one order for everyone. */}
      <Section
        title={t('editor.coverLetter.content')}
        icon={<PenLine className="h-5 w-5" />}
        variant="nested"
        collapsible
      >
        {/* ⚠️ ABOVE the editor, never replacing it — the zero-AI path stays the
            approachable default and this is the powerful-on-demand half.
            Keyed on COMMITTED paragraphs here rather than inside
            `CoverLetterParagraphs`, whose textarea buffers until blur: keyed on
            the buffer's owner, the panel would sit over text already typed.
            Reads nothing from `coverLetter.enabled` — that switch means
            "include this in my PDF", not "I am allowed to write one". */}
        {!hasLetterProse(coverLetter.paragraphs) && (
          <EmptySectionState
            icon={Sparkles}
            actionLabel={t('editor.coverLetter.empty_title')}
            message={
              hasPass
                ? t('editor.coverLetter.empty_desc')
                : t('editor.coverLetter.empty_desc_premium')
            }
            onAction={startDraft}
            className="mb-3"
          />
        )}
        {/* Subject and date print on every letter, unlike the addressee below,
            so they live with the body they title rather than behind `Recipient`. */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t('editor.coverLetter.subject')}
            name="subject"
            value={coverLetter.subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t('editor.coverLetter.subject_placeholder')}
            lock={lockFor('subject')}
          />
          <Input
            label={t('editor.coverLetter.date')}
            name="date"
            value={coverLetter.date}
            onChange={(e) => setDate(e.target.value)}
            placeholder={t('editor.coverLetter.date_placeholder')}
          />
        </div>
        <CoverLetterParagraphs
          paragraphs={coverLetter.paragraphs}
          onCommit={setParagraphs}
          lock={lockFor('paragraphs')}
        />
      </Section>

      {/* Recipient */}
      <Section
        title={t('editor.coverLetter.recipient')}
        icon={<Contact className="h-5 w-5" />}
        variant="nested"
        collapsible
        /* Collapsed while empty and open when filled, until the user toggles or
           edits it (owner, 2026-10-12). Controlled from the UI store rather than
           `defaultCollapsed`, which `Section` re-reads on every mount: an AI run
           remounts the form, and must not undo what the user opened or closed. */
        collapsed={recipientCollapsed}
        onToggle={setRecipientCollapsed}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t('editor.coverLetter.recipient_name')}
              name="name"
              value={recipient.name}
              onChange={(e) => editRecipient('name', e.target.value)}
              placeholder={t('editor.coverLetter.recipient_name_placeholder')}
            />
            <Input
              label={t('editor.coverLetter.recipient_company')}
              name="company"
              value={recipient.company}
              onChange={(e) => editRecipient('company', e.target.value)}
              placeholder={t('editor.coverLetter.recipient_company_placeholder')}
            />
          </div>
          <Input
            label={t('editor.coverLetter.recipient_address')}
            name="address"
            value={recipient.address}
            onChange={(e) => editRecipient('address', e.target.value)}
            placeholder={t('editor.coverLetter.recipient_address_placeholder')}
          />
        </div>
      </Section>

      {/* Layout */}
      <Section
        title={t('editor.coverLetter.layout')}
        icon={<LayoutTemplate className="h-5 w-5" />}
        variant="nested"
        collapsible
        defaultCollapsed
      >
        <div className="space-y-5">
          <ToggleRow
            label={t('editor.coverLetter.body_align')}
            hint={t('editor.coverLetter.body_align_hint')}
          >
            <SegmentedToggle
              value={layout.textAlign}
              onChange={(value) => setLayoutField('textAlign', value)}
              options={[
                {
                  value: 'left',
                  label: t('editor.coverLetter.left'),
                  icon: <AlignLeft className="h-4 w-4" />,
                },
                {
                  value: 'justify',
                  label: t('editor.coverLetter.justify'),
                  icon: <AlignJustify className="h-4 w-4" />,
                },
              ]}
            />
          </ToggleRow>
          <ToggleRow
            label={t('editor.coverLetter.sender_block')}
            hint={t('editor.coverLetter.sender_block_hint')}
          >
            <SegmentedToggle
              value={layout.showSender}
              onChange={(value) => setLayoutField('showSender', value)}
              options={[
                { value: true, label: t('editor.coverLetter.show') },
                { value: false, label: t('editor.coverLetter.hide') },
              ]}
            />
          </ToggleRow>
          <ToggleRow
            label={t('editor.coverLetter.recipient_block')}
            hint={t('editor.coverLetter.recipient_block_hint')}
          >
            <SegmentedToggle
              value={layout.showRecipient}
              onChange={(value) => setLayoutField('showRecipient', value)}
              options={[
                { value: true, label: t('editor.coverLetter.show') },
                { value: false, label: t('editor.coverLetter.hide') },
              ]}
            />
          </ToggleRow>
          <ToggleRow
            label={t('editor.coverLetter.signature_footer')}
            hint={t('editor.coverLetter.signature_footer_hint')}
          >
            <SegmentedToggle
              value={layout.showFooter}
              onChange={(value) => setLayoutField('showFooter', value)}
              options={[
                { value: true, label: t('editor.coverLetter.show') },
                { value: false, label: t('editor.coverLetter.hide') },
              ]}
            />
          </ToggleRow>
          <ToggleRow
            label={t('editor.coverLetter.layout_style')}
            hint={t('editor.coverLetter.layout_style_hint')}
          >
            <SegmentedToggle
              value={layout.classicLayout}
              onChange={(value) => setLayoutField('classicLayout', value)}
              options={[
                { value: false, label: t('editor.coverLetter.theme') },
                { value: true, label: t('editor.coverLetter.classic') },
              ]}
            />
          </ToggleRow>
        </div>
      </Section>
    </div>
  );
}
