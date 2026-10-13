import { BasicsFormField } from '@/components/editor/BasicsForm/BasicsFormField';
import { BasicsFormTextArea } from '@/components/editor/BasicsForm/BasicsFormTextArea';
import { useBasicsForm } from '@/components/editor/BasicsForm/useBasicsForm';
import { DesignTabBadge } from '@/components/ui/DesignTabBadge';
import { PhotoEditor } from '@/components/ui/PhotoEditor';
import { Section } from '@/components/ui/Section';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { type SectionVariant } from '@/components/ui/section/types';
import { EntryDiffPanel } from '@/features/dashboard/editor/proposals/EntryDiffPanel';
import { useLockedFields } from '@/features/dashboard/editor/proposals/useLockedFields';
import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { useTranslation } from '@/hooks/useTranslation';
import type { ResumeData } from '@/types/resume';
import { itemTarget } from '@/utils/aiTarget';
import { cn } from '@/utils/cn';
import { Eye, EyeOff, Globe, Mail, MapPin, Phone } from 'lucide-react';

interface BasicsFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

/**
 * ⚠️ Social profiles are **not** rendered here. The editor rail gives
 * `basics.profiles` its own row (`BasicsProfilesForm`), so mounting the list
 * under the identity fields would put one rail row inside another.
 */
export function BasicsForm({ variant = 'nested', defaultCollapsed = true }: BasicsFormProps) {
  const { t, tCV } = useTranslation();
  const { isStandard } = useEditorBreakpoints();
  const {
    basics,
    meta,
    imageVisible,
    isSectionCollapsed,
    setProfilesCollapsed,
    setIsSectionCollapsed,
    handleChange,
    updatePhoto,
    toggleImageVisibility,
  } = useBasicsForm({ defaultCollapsed });
  const lockFor = useLockedFields<ResumeData['basics']>(itemTarget('basics'));

  return (
    <Section
      title={t('editor.basics.title')}
      collapsible={true}
      collapsed={isSectionCollapsed}
      variant={variant}
      sectionId="basics"
      onToggle={(collapsed) => {
        setIsSectionCollapsed(collapsed);
        if (collapsed) {
          setProfilesCollapsed(true);
        }
      }}
    >
      {/* Basics renders no `AccordionItem`, so nothing used to supply the
          card that every list section's entries get for free, and the fields
          sat straight on the editor pane at 1.00:1 — the "green on green" the
          owner reported. This is `AccordionItem`'s own box, not a new one, so a
          Basics field and a Work entry field read as the same object. */}
      <div
        className={cn(
          'bg-card border-border rounded-lg border p-4 shadow-[var(--elevation-1)] sm:p-5',
          isStandard ? 'space-y-8' : 'space-y-6',
        )}
      >
        {/* Basics is one entry, not a list, so its diff panel heads the section
            instead of sitting under an accordion header. `SECTION_COMPOSITION`
            only ever proposes `label` and `summary` here. */}
        <EntryDiffPanel<ResumeData['basics']>
          target={itemTarget('basics')}
          fieldLabels={{
            label: t('editor.fields.label'),
            summary: t('editor.fields.summary'),
          }}
          className="mx-0 mb-0"
        />

        {/* Top Section: Photo & Core Identity */}
        <div className={cn('flex items-center gap-4', isStandard ? 'flex-row' : 'flex-col')}>
          {/* Left: Photo */}
          <div
            className={cn('flex shrink-0 flex-col items-center', isStandard ? 'sm:w-32' : 'w-full')}
          >
            <PhotoEditor
              image={basics.image}
              shape={meta.theme.params.imageShape || 'square'}
              visible={imageVisible}
              onUpdate={updatePhoto}
            />

            {/* Visibility Toggle Bar */}
            {basics.image && (
              <div className="mt-2 flex justify-center">
                <SegmentedToggle
                  value={imageVisible}
                  onChange={toggleImageVisibility}
                  variant="pill"
                  options={[
                    {
                      value: true,
                      icon: <Eye className="h-3.5 w-3.5" />,
                      hint: t('editor.photo.show_hint'),
                    },
                    {
                      value: false,
                      icon: <EyeOff className="h-3.5 w-3.5" />,
                      hint: t('editor.photo.hide_hint'),
                    },
                  ]}
                />
              </div>
            )}
          </div>

          {/* Right: Core Identity (Name & Title) */}
          <div className="w-full flex-1 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <BasicsFormField
                label={t('editor.fields.name')}
                name="name"
                value={basics.name}
                onChange={handleChange}
                placeholder={tCV('placeholders.basics.john_doe')}
              />
              <BasicsFormField
                label={t('editor.fields.label')}
                name="label"
                value={basics.label}
                onChange={handleChange}
                placeholder={tCV('placeholders.basics.label')}
                lock={lockFor('label')}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section: Full Width Items */}
        <div className={isStandard ? 'space-y-8' : 'space-y-6'}>
          {/* Summary */}
          <BasicsFormTextArea
            label={t('editor.fields.summary')}
            name="summary"
            value={basics.summary}
            onChange={handleChange}
            rows={isStandard ? 6 : 4}
            placeholder={t('editor.basics.summary_placeholder')}
            lock={lockFor('summary')}
          />

          {/* Location */}
          <fieldset>
            <legend
              className={cn(
                'text-muted-foreground mb-3 flex w-full items-center gap-2 font-semibold tracking-wide uppercase',
                isStandard ? 'text-sm' : 'text-xs',
              )}
            >
              <MapPin className="h-4 w-4" aria-hidden="true" /> {t('editor.basics.location')}
              <DesignTabBadge
                label={t('design.formatting')}
                group="details"
                targetId="address-schema"
                className="ml-1"
              />
            </legend>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <BasicsFormField
                  label={t('editor.fields.address')}
                  name="location.address"
                  value={basics.location.address}
                  onChange={handleChange}
                  placeholder={tCV('placeholders.basics.address')}
                />
              </div>
              <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
                <BasicsFormField
                  label={t('editor.fields.city')}
                  name="location.city"
                  value={basics.location.city}
                  onChange={handleChange}
                  placeholder={tCV('placeholders.basics.city')}
                />
                <BasicsFormField
                  label={t('editor.fields.region')}
                  name="location.region"
                  value={basics.location.region}
                  onChange={handleChange}
                  placeholder={tCV('placeholders.basics.region')}
                />
              </div>
              <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
                <BasicsFormField
                  label={t('editor.fields.postal_code')}
                  name="location.postalCode"
                  value={basics.location.postalCode}
                  onChange={handleChange}
                  placeholder={tCV('placeholders.basics.postal_code')}
                />
                <BasicsFormField
                  label={t('editor.fields.country_code')}
                  name="location.countryCode"
                  value={basics.location.countryCode}
                  onChange={handleChange}
                  placeholder={tCV('placeholders.basics.country_code')}
                />
              </div>
            </div>
          </fieldset>

          {/* Contact Information */}
          <fieldset>
            <legend
              className={cn(
                'text-muted-foreground mb-3 flex w-full items-center gap-2 font-semibold tracking-wide uppercase',
                isStandard ? 'text-sm' : 'text-xs',
              )}
            >
              {t('editor.basics.contact_info')}
            </legend>
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
              <div>
                <BasicsFormField
                  prefix={<Mail className="h-4 w-4" />}
                  label={t('editor.fields.email')}
                  name="email"
                  value={basics.email}
                  onChange={handleChange}
                  placeholder={tCV('placeholders.basics.email')}
                />
              </div>
              <div>
                <BasicsFormField
                  prefix={<Phone className="h-4 w-4" />}
                  label={t('editor.fields.phone')}
                  name="phone"
                  value={basics.phone}
                  onChange={handleChange}
                  placeholder={tCV('placeholders.basics.phone')}
                />
              </div>
              <div className="md:col-span-2">
                <BasicsFormField
                  prefix={<Globe className="h-4 w-4" />}
                  label={t('editor.fields.url')}
                  name="url"
                  value={basics.url}
                  onChange={handleChange}
                  placeholder={tCV('placeholders.common.https')}
                />
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </Section>
  );
}
