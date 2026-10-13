import { useBasicsForm } from '@/components/editor/BasicsForm/useBasicsForm';
import { ProfileList } from '@/components/editor/ProfileList';
import { type SectionVariant } from '@/components/ui/section/types';

interface BasicsProfilesFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

/**
 * `basics.profiles` as a rail row of its own. It used to hang off `BasicsForm`
 * as a sibling section, which is why the two shared one collapse state; the rail
 * mounts exactly one at a time, so the state is local again.
 */
export function BasicsProfilesForm({
  variant = 'nested',
  defaultCollapsed = true,
}: BasicsProfilesFormProps) {
  const { basics, profilesCollapsed, setProfilesCollapsed, updateProfiles } = useBasicsForm({
    defaultCollapsed,
  });

  return (
    <ProfileList
      profiles={basics.profiles}
      onChange={updateProfiles}
      collapsed={profilesCollapsed}
      onToggle={setProfilesCollapsed}
      variant={variant}
    />
  );
}
