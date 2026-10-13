import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropAreaProps {
  crop: Crop | undefined;
  setCrop: (crop: Crop) => void;
  setCompletedCrop: (crop: PixelCrop) => void;
  aspect: number | undefined;
  isRound: boolean;
  aspectMode: string;
  imgRef: React.RefObject<HTMLImageElement | null>;
  imageSrc: string;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  imageTransform: string;
  imageAlt: string;
}

export function CropArea({
  crop,
  setCrop,
  setCompletedCrop,
  aspect,
  isRound,
  aspectMode,
  imgRef,
  imageSrc,
  onImageLoad,
  imageTransform,
  imageAlt,
}: CropAreaProps) {
  return (
    <div
      className="relative flex w-full shrink-0 items-center justify-center overflow-hidden bg-black/90 p-4"
      style={{ minHeight: 280 }}
    >
      <ReactCrop
        crop={crop}
        onChange={(c) => setCrop(c)}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={aspect}
        circularCrop={isRound}
        ruleOfThirds
        keepSelection
        locked={aspectMode === 'full'}
        className="max-h-[300px] sm:max-h-[350px]"
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt={imageAlt}
          onLoad={onImageLoad}
          style={{
            maxHeight: 350,
            maxWidth: '100%',
            transform: imageTransform,
            transition: 'transform 0.2s ease',
          }}
          crossOrigin="anonymous"
        />
      </ReactCrop>
    </div>
  );
}
