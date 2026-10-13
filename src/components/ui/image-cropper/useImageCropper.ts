import { useCallback, useMemo, useRef, useState } from 'react';
import {
  type Crop,
  type PixelCrop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from 'react-image-crop';

import { useTranslation } from '@/hooks/useTranslation';
import { encodeOpaqueJpeg } from '@/utils/image';

import { type AspectMode, getAspectOptions } from './constants';

interface UseImageCropperProps {
  imageSrc: string;
  initialShape?: 'circle' | 'square';
  onCropComplete: (croppedImage: string, shape: 'circle' | 'square') => void;
  isEditMode?: boolean;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

export function useImageCropper({
  imageSrc,
  initialShape = 'square',
  onCropComplete,
  isEditMode = false,
}: UseImageCropperProps) {
  const { t } = useTranslation();
  const defaultAspectMode = isEditMode ? 'full' : '4:5';

  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspectMode, setAspectMode] = useState<AspectMode>(defaultAspectMode as AspectMode);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ x: false, y: false });
  const [isRound, setIsRound] = useState(initialShape === 'circle');
  const [isProcessing, setIsProcessing] = useState(false);

  const ASPECTS = useMemo(() => getAspectOptions(t), [t]);
  const currentAspectValue = ASPECTS.find((a) => a.mode === aspectMode)?.value;

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight, width, height } = e.currentTarget;
      let defaultCrop: Crop;
      if (aspectMode === 'full') {
        defaultCrop = { unit: '%', x: 0, y: 0, width: 100, height: 100 };
      } else {
        const initialAspect = ASPECTS.find((a) => a.mode === aspectMode)?.value || 1;
        defaultCrop = centerAspectCrop(naturalWidth, naturalHeight, initialAspect);
      }
      setCrop(defaultCrop);
      setCompletedCrop(convertToPixelCrop(defaultCrop, width, height));
    },
    [aspectMode, ASPECTS],
  );

  const handleAspectChange = (mode: AspectMode) => {
    setAspectMode(mode);
    if (!imgRef.current) return;
    const { naturalWidth, naturalHeight, width, height } = imgRef.current;

    if (mode === 'full') {
      const newCrop: Crop = { unit: '%', x: 0, y: 0, width: 100, height: 100 };
      setCrop(newCrop);
      setCompletedCrop(convertToPixelCrop(newCrop, width, height));
    } else {
      const asp = ASPECTS.find((a) => a.mode === mode);
      if (asp?.value) {
        const newCrop = centerAspectCrop(naturalWidth, naturalHeight, asp.value);
        setCrop(newCrop);
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlip({ x: false, y: false });
    setAspectMode(defaultAspectMode as AspectMode);
    setIsRound(initialShape === 'circle');
    if (imgRef.current) {
      const { naturalWidth, naturalHeight, width, height } = imgRef.current;

      let newCrop: Crop;
      if (defaultAspectMode === 'full') {
        newCrop = { unit: '%', x: 0, y: 0, width: 100, height: 100 };
      } else {
        newCrop = centerAspectCrop(naturalWidth, naturalHeight, 4 / 5);
      }

      setCrop(newCrop);
      setCompletedCrop(convertToPixelCrop(newCrop, width, height));
    }
  };

  const createCroppedImage = async () => {
    if (!imgRef.current || !completedCrop) return;
    setIsProcessing(true);

    try {
      if (aspectMode === 'full' && zoom === 1 && rotation === 0 && !flip.x && !flip.y) {
        onCropComplete(imageSrc, isRound ? 'circle' : 'square');
        return;
      }

      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const MAX_DIMENSION = 800;
      const pixelRatio = window.devicePixelRatio || 1;

      let targetWidth = completedCrop.width * scaleX;
      let targetHeight = completedCrop.height * scaleY;

      const scaleDownRatio = Math.min(MAX_DIMENSION / targetWidth, MAX_DIMENSION / targetHeight, 1);
      targetWidth *= scaleDownRatio;
      targetHeight *= scaleDownRatio;

      const canvasWidth = Math.floor(targetWidth * pixelRatio);
      const canvasHeight = Math.floor(targetHeight * pixelRatio);

      const drawCrop = (ctx: CanvasRenderingContext2D) => {
        ctx.scale(pixelRatio * scaleDownRatio, pixelRatio * scaleDownRatio);
        ctx.imageSmoothingQuality = 'high';

        const cropCenterX = canvasWidth / 2 / (pixelRatio * scaleDownRatio);
        const cropCenterY = canvasHeight / 2 / (pixelRatio * scaleDownRatio);
        ctx.translate(cropCenterX, cropCenterY);

        const imgCenterX = (image.width * scaleX) / 2;
        const imgCenterY = (image.height * scaleY) / 2;
        const currentCropCenterX = completedCrop.x * scaleX + (completedCrop.width * scaleX) / 2;
        const currentCropCenterY = completedCrop.y * scaleY + (completedCrop.height * scaleY) / 2;

        ctx.translate(imgCenterX - currentCropCenterX, imgCenterY - currentCropCenterY);
        ctx.scale(zoom, zoom);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flip.x ? -1 : 1, flip.y ? -1 : 1);
        ctx.translate(-imgCenterX, -imgCenterY);

        ctx.drawImage(
          image,
          0,
          0,
          image.naturalWidth,
          image.naturalHeight,
          0,
          0,
          image.naturalWidth,
          image.naturalHeight,
        );
      };

      const base64 = encodeOpaqueJpeg(canvasWidth, canvasHeight, drawCrop, 0.85);
      if (!base64) return;
      onCropComplete(base64, isRound ? 'circle' : 'square');
    } catch (e) {
      console.error('Crop failed:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const imageTransform = [
    `scale(${zoom})`,
    `rotate(${rotation}deg)`,
    `scaleX(${flip.x ? -1 : 1})`,
    `scaleY(${flip.y ? -1 : 1})`,
  ].join(' ');

  return {
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
    t,
  };
}
