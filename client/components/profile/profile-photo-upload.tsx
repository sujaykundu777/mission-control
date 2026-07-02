"use client";

import * as React from "react";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validatePhotoFile } from "@/lib/profile/validate-photo";
import { useImageResizeWorker } from "@/hooks/use-image-resize-worker";
import { CropDialog } from "./crop-dialog";
import type { CropRectPixels } from "@/lib/profile/image-resize-protocol";

interface ProfilePhotoUploadProps {
  name?: string | null;
  initialImageUrl?: string | null;
  className?: string;
}

function getInitials(name?: string | null) {
  if (!name) return null;
  const parts = name.trim().split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || null;
}

export function ProfilePhotoUpload({ name, initialImageUrl, className }: ProfilePhotoUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  // previewUrl is local component state only — it updates the avatar shown on
  // this page but is never persisted to session.user.image, Prisma, or any
  // backend. A refresh reverts to initialImageUrl/fallback initials. This is
  // a deliberate scope boundary for this iteration, not a bug.
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const { resizeImage } = useImageResizeWorker();

  // Mirror the latest URLs in refs so the unmount cleanup below can revoke
  // whatever is current, not whatever was in state when the effect first ran.
  const objectUrlRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    objectUrlRef.current = objectUrl;
  }, [objectUrl]);
  const previewUrlRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const closeCropDialog = () => {
    setIsCropDialogOpen(false);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    setSelectedFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const result = validatePhotoFile(file);
    if (!result.valid) {
      toast.error(result.message ?? "Invalid image file");
      return;
    }

    setSelectedFile(file);
    setObjectUrl(URL.createObjectURL(file));
    setIsCropDialogOpen(true);
  };

  const handleCropConfirm = async (crop: CropRectPixels) => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const blob = await resizeImage({ file: selectedFile, crop });
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(blob);
      });
      toast.success("Photo updated");
      closeCropDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const initials = getInitials(name);

  return (
    <div className="relative inline-flex">
      <Avatar className={cn("h-16 w-16", className)}>
        <AvatarImage
          src={previewUrl ?? initialImageUrl ?? undefined}
          alt={name ?? "Profile photo"}
        />
        <AvatarFallback>{initials ?? <Camera className="h-6 w-6" />}</AvatarFallback>
      </Avatar>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Change profile photo"
      >
        <Camera className="h-3.5 w-3.5" />
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      <CropDialog
        open={isCropDialogOpen}
        imageSrc={objectUrl}
        onOpenChange={(open) => {
          if (!open) closeCropDialog();
        }}
        onCropConfirm={handleCropConfirm}
        isProcessing={isProcessing}
      />
    </div>
  );
}
