import { Bot, Volume2, Sparkles } from "lucide-react";
import { EmotionType } from "../types";

interface SpeechBubbleProps {
  text: string;
  emotion: EmotionType;
  isSpeaking: boolean;
  isSpecial?: boolean;
  onReplay: () => void;
}

export function SpeechBubble({
  text,
  emotion,
  isSpeaking,
  isSpecial,
  onReplay,
}: SpeechBubbleProps) {
  if (!text) return null;

  const emotionBorders: Record<EmotionType, string> = {
    neutral: "border-cyan-500/40 shadow-cyan-500/10",
    happy: "border-emerald-500/40 shadow-emerald-500/10",
    thinking: "border-purple-500/40 shadow-purple-500/10",
    surprised: "border-sky-500/40 shadow-sky-500/10",
    excited: "border-amber-500/50 shadow-amber-500/15",
    empathetic: "border-rose-500/40 shadow-rose-500/10",
  };

  return (
    <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4 pointer-events-none animate-in fade-in zoom-in-95 duration-300">
      <div
        className={`pointer-events-auto relative p-4 rounded-3xl backdrop-blur-xl bg-slate-950/85 border shadow-2xl transition-all duration-300 ${
          isSpecial
            ? "border-amber-400 bg-amber-950/30 shadow-amber-500/20"
            : emotionBorders[emotion] || "border-cyan-500/40"
        }`}
      >
        {/* Subtle top indicator arrow */}
        <div className="flex items-start gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-cyan-400 flex-shrink-0 mt-0.5">
            <Bot className="w-4 h-4" />
            {isSpeaking && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold font-mono tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                Azizbek AI
                {isSpecial && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ⭐ Yaratuvchi haqida
                  </span>
                )}
              </span>

              <button
                onClick={onReplay}
                className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title="Qayta o'qish"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-['Plus_Jakarta_Sans'] font-medium">
              {text}
            </p>
          </div>
        </div>

        {isSpecial && (
          <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300/90 font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> 78-maktab • 7-B sinf o'quvchisi
            </span>
            <span className="font-semibold text-amber-200">Raxmiddinov Azizbek</span>
          </div>
        )}
      </div>
    </div>
  );
}
