export interface CropRectPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeRequestPayload {
  requestId: string;
  file: File;
  crop: CropRectPixels;
  targetSize: number;
  quality: number;
  mimeType: "image/webp" | "image/jpeg";
}

export type ResizeRequestMessage = { type: "resize"; payload: ResizeRequestPayload };

export type ResizeResponseMessage =
  | { type: "resize-success"; requestId: string; blob: Blob }
  | { type: "resize-error"; requestId: string; message: string };
