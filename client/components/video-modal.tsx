"use client";

import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ isOpen, onClose }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative aspect-video w-full max-w-4xl rounded-xl bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-foreground transition-colors hover:text-primary"
          aria-label="Close modal"
        >
          <X className="h-8 w-8" />
        </button>

        <iframe
          className="h-full w-full rounded-xl"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="ContactOS Demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
