"use client";

import * as React from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { CropRectPixels } from "@/lib/profile/image-resize-protocol";

interface CropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onOpenChange: (open: boolean) => void;
  onCropConfirm: (croppedAreaPixels: CropRectPixels) => void;
  isProcessing?: boolean;
}

export function CropDialog({
  open,
  imageSrc,
  onOpenChange,
  onCropConfirm,
  isProcessing = false,
}: CropDialogProps) {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const croppedAreaPixelsRef = React.useRef<Area | null>(null);

  // Reset the crop/zoom state whenever a new image is loaded into the dialog
  // (the "adjusting state on prop change during render" pattern, so this
  // doesn't trigger the cascading-render effect lint rule).
  const [resetForImageSrc, setResetForImageSrc] = React.useState(imageSrc);
  if (imageSrc !== resetForImageSrc) {
    setResetForImageSrc(imageSrc);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  // Ref writes must happen outside render, so the crop-rect ref is reset
  // in an effect keyed on the same imageSrc change.
  React.useEffect(() => {
    croppedAreaPixelsRef.current = null;
  }, [imageSrc]);

  const handleCropComplete = React.useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    croppedAreaPixelsRef.current = croppedAreaPixels;
  }, []);

  const handleConfirm = () => {
    if (croppedAreaPixelsRef.current) {
      onCropConfirm(croppedAreaPixelsRef.current);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Photo</DialogTitle>
        </DialogHeader>

        <div className="relative h-72 w-full overflow-hidden rounded-md bg-muted">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Zoom</span>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={([value]) => setZoom(value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
