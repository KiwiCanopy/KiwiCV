/**
 * Above this the photo picker refuses the file. The refusal interpolates
 * the MiB figure, so the number the user reads is this one —
 * `photoSizeLimit.test.tsx` holds them together.
 */
export const PHOTO_SIZE_LIMIT_BYTES = 10 * 1024 * 1024;

/** Floored, so the copy can only ever understate what the bytes compare against. */
export const PHOTO_SIZE_LIMIT_MB = Math.floor(PHOTO_SIZE_LIMIT_BYTES / (1024 * 1024));
