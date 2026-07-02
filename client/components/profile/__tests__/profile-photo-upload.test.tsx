import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { ProfilePhotoUpload } from "@/components/profile/profile-photo-upload";
import { toastSpies } from "@/lib/__tests__/setup";

const resizeImageMock = vi.fn();
vi.mock("@/hooks/use-image-resize-worker", () => ({
  useImageResizeWorker: () => ({ resizeImage: resizeImageMock, isSupported: true }),
}));

let capturedOnCropConfirm:
  | ((crop: { x: number; y: number; width: number; height: number }) => void)
  | null = null;
let lastCropDialogOpen = false;

vi.mock("@/components/profile/crop-dialog", () => ({
  CropDialog: ({
    open,
    onCropConfirm,
  }: {
    open: boolean;
    onCropConfirm: (crop: { x: number; y: number; width: number; height: number }) => void;
  }) => {
    lastCropDialogOpen = open;
    capturedOnCropConfirm = onCropConfirm;
    return open ? <div data-testid="crop-dialog" /> : null;
  },
}));

function selectFile(input: HTMLElement, file: File) {
  return userEvent.upload(input, file);
}

describe("ProfilePhotoUpload", () => {
  beforeEach(() => {
    toastSpies.success.mockClear();
    toastSpies.error.mockClear();
    resizeImageMock.mockReset();
    capturedOnCropConfirm = null;
    lastCropDialogOpen = false;
    if (!URL.createObjectURL) {
      // @ts-expect-error jsdom doesn't implement this
      URL.createObjectURL = vi.fn();
    }
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  it("rejects an oversized file without opening the crop dialog", async () => {
    render(<ProfilePhotoUpload name="Jane Doe" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const bigFile = new File([new Uint8Array(6 * 1024 * 1024)], "big.png", { type: "image/png" });
    await selectFile(input, bigFile);

    expect(toastSpies.error).toHaveBeenCalled();
    expect(lastCropDialogOpen).toBe(false);
  });

  it("rejects a non-image file without opening the crop dialog", async () => {
    // The input's accept attribute already blocks this at the OS file-picker
    // level; applyAccept:false simulates a mismatched file slipping through
    // (e.g. drag-and-drop) to exercise the component's own validation.
    const user = userEvent.setup({ applyAccept: false });
    render(<ProfilePhotoUpload name="Jane Doe" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const badFile = new File(["hello"], "doc.pdf", { type: "application/pdf" });
    await user.upload(input, badFile);

    expect(toastSpies.error).toHaveBeenCalled();
    expect(lastCropDialogOpen).toBe(false);
  });

  it("opens the crop dialog for a valid image", async () => {
    render(<ProfilePhotoUpload name="Jane Doe" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const goodFile = new File(["data"], "avatar.png", { type: "image/png" });
    await selectFile(input, goodFile);

    expect(screen.getByTestId("crop-dialog")).toBeInTheDocument();
  });

  it("calls resizeImage with the crop rect on confirm and shows a success toast", async () => {
    resizeImageMock.mockResolvedValue(new Blob(["result"]));
    render(<ProfilePhotoUpload name="Jane Doe" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const goodFile = new File(["data"], "avatar.png", { type: "image/png" });
    await selectFile(input, goodFile);

    expect(capturedOnCropConfirm).toBeTruthy();
    const crop = { x: 1, y: 2, width: 10, height: 10 };
    await act(async () => {
      await capturedOnCropConfirm!(crop);
    });

    expect(resizeImageMock).toHaveBeenCalledWith(expect.objectContaining({ file: goodFile, crop }));
    expect(toastSpies.success).toHaveBeenCalled();
  });
});
