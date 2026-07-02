import { describe, it, expect } from "vitest";
import { validatePhotoFile, MAX_PHOTO_BYTES } from "../validate-photo";

function makeFile(sizeBytes: number, type: string, name = "photo") {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe("validatePhotoFile", () => {
  it("accepts a valid jpeg under the size limit", () => {
    const result = validatePhotoFile(makeFile(1024, "image/jpeg"));
    expect(result).toEqual({ valid: true });
  });

  it("accepts a valid png under the size limit", () => {
    const result = validatePhotoFile(makeFile(1024, "image/png"));
    expect(result.valid).toBe(true);
  });

  it("accepts a valid webp under the size limit", () => {
    const result = validatePhotoFile(makeFile(1024, "image/webp"));
    expect(result.valid).toBe(true);
  });

  it("rejects a file that is too large", () => {
    const result = validatePhotoFile(makeFile(MAX_PHOTO_BYTES + 1, "image/jpeg"));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("too-large");
  });

  it("rejects a file with an unsupported mime type", () => {
    const result = validatePhotoFile(makeFile(1024, "application/pdf"));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("invalid-type");
  });

  it("rejects a file with an empty mime type", () => {
    const result = validatePhotoFile(makeFile(1024, ""));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("invalid-type");
  });
});
