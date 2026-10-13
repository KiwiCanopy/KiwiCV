import { useState } from 'react';
import type React from 'react';

import { useResumeStore } from '@/store/resume/useResumeStore';
import { isImageVisible } from '@/utils/visibility';

export interface useBasicsFormProps {
  defaultCollapsed?: boolean;
}

export function useBasicsForm({ defaultCollapsed = true }: useBasicsFormProps) {
  const basics = useResumeStore((state) => state.resume.basics);
  const meta = useResumeStore((state) => state.resume.meta);
  const updateBasics = useResumeStore((state) => state.updateBasics);
  const updateMeta = useResumeStore((state) => state.updateMeta);
  const toggleItemVisibility = useResumeStore((state) => state.toggleItemVisibility);

  const [profilesCollapsed, setProfilesCollapsed] = useState(true);
  const [prevDefaultCollapsed, setPrevDefaultCollapsed] = useState(defaultCollapsed);
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(defaultCollapsed);

  // Adjust state in render to avoid useEffect cascading renders
  if (defaultCollapsed !== prevDefaultCollapsed) {
    setPrevDefaultCollapsed(defaultCollapsed);
    setIsSectionCollapsed(defaultCollapsed);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      updateBasics({
        location: {
          ...basics.location,
          [locationField]: value,
        },
      });
    } else {
      updateBasics({ [name]: value });
    }
  };

  const imageVisible = isImageVisible(meta.content.hiddenIds);

  const updatePhoto = (data: { image?: string; shape?: 'square' | 'circle' }) => {
    if (data.image !== undefined) updateBasics({ image: data.image });

    if (data.shape !== undefined) {
      updateMeta({
        theme: {
          ...meta.theme,
          params: { ...meta.theme.params, imageShape: data.shape },
        },
      });
    } else if (data.image === '') {
      // Automatically remove imageShape when the photo is deleted
      const { imageShape: _imageShape, ...restParams } = meta.theme.params;
      updateMeta({
        theme: {
          ...meta.theme,
          params: restParams,
        },
      });
    }
  };

  const toggleImageVisibility = () => toggleItemVisibility('basics:image', {});

  const updateProfiles = (newProfiles: typeof basics.profiles) => {
    updateBasics({ profiles: newProfiles });
  };

  return {
    basics,
    meta,
    imageVisible,
    profilesCollapsed,
    isSectionCollapsed,
    setProfilesCollapsed,
    setIsSectionCollapsed,
    handleChange,
    updatePhoto,
    toggleImageVisibility,
    updateProfiles,
  };
}
