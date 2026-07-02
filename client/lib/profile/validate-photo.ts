export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AcceptedPhotoType = (typeof ACCEPTED_PHOTO_TYPES)[number];

export type PhotoValidationError = "invalid-type" | "too-large";

export interface PhotoValidationResult {
  valid: boolean;
  error?: PhotoValidationError;
  message?: string;
}

export function validatePhotoFile(file: File): PhotoValidationResult {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type as AcceptedPhotoType)) {
    return {
      valid: false,
      error: "invalid-type",
      message: "Please choose a JPEG, PNG, or WebP image.",
    };
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return {
      valid: false,
      error: "too-large",
      message: "Image must be 5MB or smaller.",
    };
  }

  return { valid: true };
}
