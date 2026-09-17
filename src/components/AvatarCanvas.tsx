import { useEffect, useRef } from "react";
import { CyberAvatar3D } from "./CyberAvatar3D";
import { EmotionType } from "../types";

interface AvatarCanvasProps {
  emotion: EmotionType;
  isSpeaking: boolean;
  audioLevel: number;
  onAvatarClick?: () => void;
}

export function AvatarCanvas({
  emotion,
  isSpeaking,
  audioLevel,
  onAvatarClick,
}: AvatarCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarInstanceRef = useRef<CyberAvatar3D | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const avatar = new CyberAvatar3D(containerRef.current);
    avatarInstanceRef.current = avatar;

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          avatar.resize(width, height);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    // Mouse / Touch Pointer Tracking
    const handlePointerMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      avatar.setCursor(x, y);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const { innerWidth, innerHeight } = window;
        const x = (touch.clientX / innerWidth) * 2 - 1;
        const y = (touch.clientY / innerHeight) * 2 - 1;
        avatar.setCursor(x, y);
      }
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      resizeObserver.disconnect();
      avatar.dispose();
      avatarInstanceRef.current = null;
    };
  }, []);

  // Update Emotion
  useEffect(() => {
    if (avatarInstanceRef.current) {
      avatarInstanceRef.current.setEmotion(emotion);
    }
  }, [emotion]);

  // Update Speaking State
  useEffect(() => {
    if (avatarInstanceRef.current) {
      avatarInstanceRef.current.setSpeaking(isSpeaking);
    }
  }, [isSpeaking]);

  // Update Audio Level for Lip Sync
  useEffect(() => {
    if (avatarInstanceRef.current) {
      avatarInstanceRef.current.setAudioLevel(audioLevel);
    }
  }, [audioLevel]);

  return (
    <div
      id="avatar-canvas-container"
      ref={containerRef}
      onClick={() => {
        if (avatarInstanceRef.current) {
          avatarInstanceRef.current.triggerCelebration();
        }
        if (onAvatarClick) onAvatarClick();
      }}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none"
      title="Azizbek AI 3D modeli — Kursorni kuzatadi yoki bosganda reaksiyaga kirishadi"
    />
  );
}
