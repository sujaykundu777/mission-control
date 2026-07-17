/// <reference lib="webworker" />
// Scoping the webworker lib to just this file (rather than adding it to the
// project-wide tsconfig "lib" array) avoids conflicting with "dom"'s `self`
// typing elsewhere. next.config.mjs also sets `typescript.ignoreBuildErrors`,
// so any residual editor-only type friction here is cosmetic, not a build
// blocker — don't "fix" this by editing the global tsconfig.

import type { ResizeRequestMessage, ResizeResponseMessage } from "./image-resize-protocol";

self.onmessage = async (event: MessageEvent<ResizeRequestMessage>) => {
  const { payload } = event.data;
  const { requestId, file, crop, targetSize, quality, mimeType } = payload;

  try {
    const bitmap = await createImageBitmap(file, crop.x, crop.y, crop.width, crop.height, {
      resizeWidth: targetSize,
      resizeHeight: targetSize,
      resizeQuality: "high",
    });

    const canvas = new OffscreenCanvas(targetSize, targetSize);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not acquire 2D context for OffscreenCanvas");
    }

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const blob = await canvas.convertToBlob({ type: mimeType, quality });

    const response: ResizeResponseMessage = { type: "resize-success", requestId, blob };
    self.postMessage(response);
  } catch (error) {
    const response: ResizeResponseMessage = {
      type: "resize-error",
      requestId,
      message: error instanceof Error ? error.message : "Failed to process image",
    };
    self.postMessage(response);
  }
};

export {};
