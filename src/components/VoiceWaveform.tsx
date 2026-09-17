import { EmotionType } from "../types";

interface VoiceWaveformProps {
  isActive: boolean;
  isListening: boolean;
  audioLevel: number;
  emotion: EmotionType;
}

export function VoiceWaveform({
  isActive,
  isListening,
  audioLevel,
  emotion,
}: VoiceWaveformProps) {
  const barsCount = 14;

  const emotionGlowColors: Record<EmotionType, string> = {
    neutral: "bg-cyan-400",
    happy: "bg-emerald-400",
    thinking: "bg-purple-400",
    surprised: "bg-sky-400",
    excited: "bg-amber-400",
    empathetic: "bg-rose-400",
  };

  const barColor = isListening ? "bg-red-400" : emotionGlowColors[emotion] || "bg-cyan-400";

  return (
    <div className="flex items-center justify-center gap-1 h-8 px-4 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800/80 shadow-inner">
      {Array.from({ length: barsCount }).map((_, index) => {
        // Compute procedural dynamic height based on audioLevel and wave math
        const centerDistance = Math.abs(index - (barsCount - 1) / 2) / ((barsCount - 1) / 2);
        const waveFactor = 1 - centerDistance * 0.4;
        const normalizedLevel = Math.max(0.15, audioLevel);
        const height = isActive
          ? Math.min(100, Math.max(15, (normalizedLevel * 90 + Math.sin(index + Date.now() * 0.01) * 20) * waveFactor))
          : 15;

        return (
          <div
            key={index}
            className={`w-1 rounded-full transition-all duration-75 ${barColor} ${
              isActive ? "opacity-90 shadow-sm" : "opacity-30"
            }`}
            style={{
              height: `${height}%`,
            }}
          />
        );
      })}
    </div>
  );
}
