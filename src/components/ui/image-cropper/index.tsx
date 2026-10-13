import { Button } from '@/components/ui/Button';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { useTranslation } from '@/hooks/useTranslation';
import { Check } from 'lucide-react';

import { CropArea } from './components/CropArea';
import { CropperControls } from './components/CropperControls';
import { useImageCropper } from './useImageCropper';

interface ImageCropperProps {
  imageSrc: string;
  initialShape?: 'circle' | 'square';
  onCancel: () => void;
  onCropComplete: (croppedImage: string, shape: 'circle' | 'square') => void;
  isEditMode?: boolean;
}

export function ImageCropper({
  imageSrc,
  initialShape = 'square',
  onCancel,
  onCropComplete,
  isEditMode = false,
}: ImageCropperProps) {
  const { t } = useTranslation();
  const {
    imgRef,
    crop,
    setCrop,
    setCompletedCrop,
    completedCrop,
    aspectMode,
    zoom,
    setZoom,
    rotation,
    setRotation,
    flip,
    setFlip,
    isRound,
    setIsRound,
    isProcessing,
    ASPECTS,
    currentAspectValue,
    onImageLoad,
    handleAspectChange,
    handleReset,
    createCroppedImage,
    imageTransform,
  } = useImageCropper({
    imageSrc,
    initialShape,
    onCropComplete,
    isEditMode,
  });

  return (
    <DialogFrame
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      maxWidth="2xl"
      zIndexClassName="z-[60]"
      closePlacement="bar"
      header={
        <div className="border-border flex items-center border-b p-4 pr-14">
          <DialogFrameTitle className="text-foreground font-semibold">
            {t('image_cropper.title')}
          </DialogFrameTitle>
        </div>
      }
    >
      {/* Crop Area */}
      <CropArea
        crop={crop}
        setCrop={setCrop}
        setCompletedCrop={setCompletedCrop}
        aspect={currentAspectValue}
        isRound={isRound}
        aspectMode={aspectMode}
        imgRef={imgRef}
        imageSrc={imageSrc}
        onImageLoad={onImageLoad}
        imageTransform={imageTransform}
        imageAlt={t('image_cropper.alt_crop')}
      />

      {/* Controls. No `overflow` here: it would become the sticky footer's
          scroll ancestor and, being uncapped, kill the sticky. The scroll region
          is ModalContainer's, which the footer pins against. */}
      <div className="flex flex-col">
        <DialogFrameDescription className="sr-only">
          {t('image_cropper.description')}
        </DialogFrameDescription>

        <CropperControls
          t={t}
          aspectMode={aspectMode}
          handleAspectChange={handleAspectChange}
          aspects={ASPECTS}
          isRound={isRound}
          setIsRound={setIsRound}
          rotation={rotation}
          setRotation={setRotation}
          flip={flip}
          setFlip={setFlip}
          handleReset={handleReset}
          zoom={zoom}
          setZoom={setZoom}
        />

        {/* Action Buttons */}
        <div className="border-border bg-card sticky bottom-0 flex justify-end gap-3 border-t px-4 pt-6 pb-6">
          <Button variant="secondary" onClick={onCancel} className="flex-1 rounded-xl sm:flex-none">
            {t('image_cropper.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={createCroppedImage}
            disabled={!completedCrop}
            loading={isProcessing}
            className="flex-1 rounded-xl sm:flex-none"
          >
            {!isProcessing && <Check className="h-4 w-4" aria-hidden="true" />}
            {t('image_cropper.apply')}
          </Button>
        </div>
      </div>
    </DialogFrame>
  );
}
