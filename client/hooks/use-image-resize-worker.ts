import * as React from "react";
import type {
  CropRectPixels,
  ResizeRequestMessage,
  ResizeResponseMessage,
} from "@/lib/profile/image-resize-protocol";

export interface ResizeImageOptions {
  file: File;
  crop: CropRectPixels;
  targetSize?: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

interface PendingRequest {
  resolve: (blob: Blob) => void;
  reject: (error: Error) => void;
}

export function useImageResizeWorker() {
  const workerRef = React.useRef<Worker | null>(null);
  const pendingRef = React.useRef<Map<string, PendingRequest>>(new Map());
  const isSupported = typeof window !== "undefined" && typeof Worker !== "undefined";

  const getWorker = React.useCallback(() => {
    if (!isSupported) return null;

    if (!workerRef.current) {
      const worker = new Worker(new URL("../lib/profile/image-resize.worker.ts", import.meta.url), {
        type: "module",
      });
      worker.onmessage = (event: MessageEvent<ResizeResponseMessage>) => {
        const message = event.data;
        const pending = pendingRef.current.get(message.requestId);
        if (!pending) return;

        pendingRef.current.delete(message.requestId);
        if (message.type === "resize-success") {
          pending.resolve(message.blob);
        } else {
          pending.reject(new Error(message.message));
        }
      };
      workerRef.current = worker;
    }

    return workerRef.current;
  }, [isSupported]);

  const resizeImage = React.useCallback(
    ({
      file,
      crop,
      targetSize = 512,
      quality = 0.85,
      mimeType = "image/webp",
    }: ResizeImageOptions) => {
      const worker = getWorker();
      if (!worker) {
        return Promise.reject(new Error("Web Workers are not supported in this browser"));
      }

      return new Promise<Blob>((resolve, reject) => {
        const requestId = crypto.randomUUID();
        pendingRef.current.set(requestId, { resolve, reject });

        const message: ResizeRequestMessage = {
          type: "resize",
          payload: { requestId, file, crop, targetSize, quality, mimeType },
        };
        worker.postMessage(message);
      });
    },
    [getWorker],
  );

  React.useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return { resizeImage, isSupported };
}
