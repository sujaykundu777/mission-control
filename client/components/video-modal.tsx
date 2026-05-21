'use client'

import { X } from 'lucide-react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VideoModal({ isOpen, onClose }: VideoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl max-w-4xl w-full aspect-video relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-foreground hover:text-primary transition-colors"
          aria-label="Close modal"
        >
          <X className="w-8 h-8" />
        </button>
        
        <iframe
          className="w-full h-full rounded-xl"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="ContactOS Demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )
}