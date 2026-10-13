export type TFunction = (path: string, vars?: Record<string, string | number>) => string;

export type AspectMode = 'full' | '1:1' | '4:5' | '16:9' | 'free';

export interface AspectOption {
  label: string;
  mode: AspectMode;
  value?: number;
}

export const getAspectOptions = (t: TFunction): AspectOption[] => [
  { label: t('image_cropper.full'), mode: 'full' },
  { label: '1:1', mode: '1:1', value: 1 },
  { label: '4:5', mode: '4:5', value: 4 / 5 },
  { label: '16:9', mode: '16:9', value: 16 / 9 },
  { label: t('image_cropper.free'), mode: 'free' },
];
