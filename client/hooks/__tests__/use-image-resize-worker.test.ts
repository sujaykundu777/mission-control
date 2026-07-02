import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useImageResizeWorker } from "../use-image-resize-worker";
import type {
  ResizeRequestMessage,
  ResizeResponseMessage,
} from "@/lib/profile/image-resize-protocol";

class MockWorker {
  static instances: MockWorker[] = [];
  static shouldError = false;
  onmessage: ((event: MessageEvent<ResizeResponseMessage>) => void) | null = null;
  terminated = false;

  constructor() {
    MockWorker.instances.push(this);
  }

  postMessage(message: ResizeRequestMessage) {
    const { requestId } = message.payload;
    const response: ResizeResponseMessage = MockWorker.shouldError
      ? { type: "resize-error", requestId, message: "boom" }
      : { type: "resize-success", requestId, blob: new Blob(["fake"]) };
    queueMicrotask(() =>
      this.onmessage?.({ data: response } as MessageEvent<ResizeResponseMessage>),
    );
  }

  terminate() {
    this.terminated = true;
  }
}

describe("useImageResizeWorker", () => {
  afterEach(() => {
    MockWorker.instances = [];
    MockWorker.shouldError = false;
    vi.unstubAllGlobals();
  });

  it("resolves with the blob returned by the worker", async () => {
    vi.stubGlobal("Worker", MockWorker);
    const { result } = renderHook(() => useImageResizeWorker());

    const file = new File(["data"], "photo.png", { type: "image/png" });
    const blob = await result.current.resizeImage({
      file,
      crop: { x: 0, y: 0, width: 10, height: 10 },
    });

    expect(blob).toBeInstanceOf(Blob);
  });

  it("rejects when the worker reports an error", async () => {
    MockWorker.shouldError = true;
    vi.stubGlobal("Worker", MockWorker);
    const { result } = renderHook(() => useImageResizeWorker());

    const file = new File(["data"], "photo.png", { type: "image/png" });
    const resizePromise = result.current.resizeImage({
      file,
      crop: { x: 0, y: 0, width: 10, height: 10 },
    });

    await expect(resizePromise).rejects.toThrow("boom");
  });

  it("terminates the worker on unmount", () => {
    vi.stubGlobal("Worker", MockWorker);
    const { unmount, result } = renderHook(() => useImageResizeWorker());

    const file = new File(["data"], "photo.png", { type: "image/png" });
    void result.current.resizeImage({ file, crop: { x: 0, y: 0, width: 10, height: 10 } });

    unmount();

    expect(MockWorker.instances[0].terminated).toBe(true);
  });

  it("reports unsupported when Worker is unavailable", () => {
    vi.stubGlobal("Worker", undefined);
    const { result } = renderHook(() => useImageResizeWorker());

    expect(result.current.isSupported).toBe(false);
  });
});
