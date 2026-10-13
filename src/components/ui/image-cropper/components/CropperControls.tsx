import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { Slider } from '@/components/ui/Slider';
import { SectionLabel } from '@/features/dashboard/design/helpers/SectionLabel';
import { cn } from '@/utils/cn';
import {
  Circle,
  FlipHorizontal,
  FlipVertical,
  Image,
  RotateCcw,
  RotateCw,
  Square,
  Undo2,
} from 'lucide-react';

import { type AspectMode, type AspectOption, type TFunction } from '../constants';

interface CropperControlsProps {
  t: TFunction;
  aspectMode: AspectMode;
  handleAspectChange: (mode: AspectMode) => void;
  aspects: AspectOption[];
  isRound: boolean;
  setIsRound: (round: boolean) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
  flip: { x: boolean; y: boolean };
  setFlip: React.Dispatch<React.SetStateAction<{ x: boolean; y: boolean }>>;
  handleReset: () => void;
  zoom: number;
  setZoom: (zoom: number) => void;
}

export function CropperControls({
  t,
  aspectMode,
  handleAspectChange,
  aspects,
  isRound,
  setIsRound,
  rotation,
  setRotation,
  flip,
  setFlip,
  handleReset,
  zoom,
  setZoom,
}: CropperControlsProps) {
  return (
    <div className="space-y-6 overflow-y-auto p-4">
      {/* Row 1: Aspect Ratio & Shape Toggle */}
      <div className="border-border/30 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div className="w-full space-y-3 sm:w-auto">
          <SectionLabel label={t('image_cropper.format')} variant="minimal" />
          <SegmentedToggle
            value={aspectMode}
            onChange={handleAspectChange}
            options={aspects.map((asp) => ({
              value: asp.mode,
              label: asp.label,
            }))}
            className="w-full sm:w-80"
          />
        </div>

        <div className="w-full space-y-3 sm:w-auto">
          <SectionLabel label={t('image_cropper.shape')} variant="minimal" />
          <SegmentedToggle
            value={isRound}
            onChange={setIsRound}
            options={[
              {
                value: false,
                label: '',
                icon: <Square size={14} />,
                hint: t('image_cropper.rect_tooltip'),
              },
              {
                value: true,
                label: '',
                icon: <Circle size={14} />,
                hint: t('image_cropper.round_tooltip'),
              },
            ]}
            className="w-full sm:w-24"
          />
        </div>
      </div>

      {/* Row 2: Quick Actions */}
      <div className="flex justify-center gap-4 py-2 sm:gap-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = rotation - 90;
              setRotation(next < -180 ? next + 360 : next);
            }}
            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-full p-2.5 transition-colors"
            title={t('image_cropper.rotate_ccw')}
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={() => {
              const next = rotation + 90;
              setRotation(next > 180 ? next - 360 : next);
            }}
            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-full p-2.5 transition-colors"
            title={t('image_cropper.rotate_cw')}
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-border hidden h-10 w-px sm:block" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFlip((f) => ({ ...f, x: !f.x }))}
            className={cn(
              'hover:bg-muted rounded-full p-2.5 transition-colors',
              flip.x
                ? 'text-primary-strong bg-primary/5'
                : 'text-muted-foreground hover:text-foreground',
            )}
            title={t('image_cropper.flip_h')}
          >
            <FlipHorizontal className="h-5 w-5" />
          </button>
          <button
            onClick={() => setFlip((f) => ({ ...f, y: !f.y }))}
            className={cn(
              'hover:bg-muted rounded-full p-2.5 transition-colors',
              flip.y
                ? 'text-primary-strong bg-primary/5'
                : 'text-muted-foreground hover:text-foreground',
            )}
            title={t('image_cropper.flip_v')}
          >
            <FlipVertical className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-border hidden h-10 w-px sm:block" />

        <button
          onClick={handleReset}
          className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-full p-2.5 transition-colors"
          title={t('common.reset')}
        >
          <Undo2 className="h-5 w-5" />
        </button>
      </div>

      {/* Row 3: Zoom & Rotation Sliders */}
      <div className="flex flex-col gap-8 py-2">
        <div className="space-y-2 px-1">
          <div className="flex items-center justify-between">
            <SectionLabel label={t('image_cropper.zoom')} variant="minimal" />
            <button
              onClick={() => setZoom(1)}
              disabled={zoom === 1}
              className={cn(
                'flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase transition-all',
                zoom === 1
                  ? 'text-muted-foreground/10 cursor-default'
                  : 'text-primary-strong hover:text-foreground cursor-pointer',
              )}
            >
              <RotateCcw
                size={11}
                className={cn('transition-transform', zoom !== 1 && 'hover:-rotate-45')}
              />
              {t('common.reset')}
            </button>
          </div>
          <div className="group/zoom flex w-full items-center gap-4">
            <div className="text-muted-foreground/20 group-hover/zoom:text-muted-foreground/40 flex min-w-[28px] items-center justify-end transition-colors">
              <Image size={16} strokeWidth={2.5} />
            </div>
            <div className="relative flex-1">
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.01}
                onValueChange={(vals) => setZoom(vals[0])}
                showTooltip={true}
                formatTooltip={(v) => `${(v * 100).toFixed(0)}%`}
              />
            </div>
            <div className="text-muted-foreground/20 group-hover/zoom:text-muted-foreground/40 flex min-w-[28px] items-center justify-start transition-colors">
              <Image size={24} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="space-y-2 px-1">
          <div className="flex items-center justify-between">
            <SectionLabel label={t('image_cropper.rotation')} variant="minimal" />
            <button
              onClick={() => setRotation(0)}
              disabled={rotation === 0}
              className={cn(
                'flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase transition-all',
                rotation === 0
                  ? 'text-muted-foreground/10 cursor-default'
                  : 'text-primary-strong hover:text-foreground cursor-pointer',
              )}
            >
              <RotateCcw
                size={11}
                className={cn('transition-transform', rotation !== 0 && 'hover:-rotate-45')}
              />
              {t('common.reset')}
            </button>
          </div>
          <div className="group/rotation flex w-full items-center gap-4">
            <div className="text-muted-foreground/20 group-hover/rotation:text-muted-foreground/40 flex min-w-[28px] items-center justify-end transition-colors">
              <RotateCcw size={16} strokeWidth={2.5} />
            </div>
            <div className="relative flex-1">
              <Slider
                value={[rotation]}
                min={-180}
                max={180}
                step={1}
                onValueChange={(vals) => setRotation(vals[0])}
                showTooltip={true}
                formatTooltip={(v) => `${v}°`}
              />
            </div>
            <div className="text-muted-foreground/20 group-hover/rotation:text-muted-foreground/40 flex min-w-[28px] items-center justify-start transition-colors">
              <RotateCw size={16} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
