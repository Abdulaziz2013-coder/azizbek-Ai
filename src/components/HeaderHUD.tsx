import { Sparkles, Volume2, VolumeX, MessageSquare, Award, Globe } from "lucide-react";
import { EmotionType, SupportedLanguage } from "../types";

interface HeaderHUDProps {
  emotion: EmotionType;
  isMuted: boolean;
  onToggleMute: () => void;
  showTranscript: boolean;
  onToggleTranscript: () => void;
  language: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenCreatorInfo: () => void;
}

const EMOTION_LABELS: Record<EmotionType, { text: string; color: string; badge: string }> = {
  neutral: { text: "Xotirjam", color: "text-cyan-400 border-cyan-500/30 bg-cyan-950/40", badge: "bg-cyan-400" },
  happy: { text: "Quvnoq", color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/40", badge: "bg-emerald-400" },
  thinking: { text: "O'ylamoqda", color: "text-purple-400 border-purple-500/30 bg-purple-950/40", badge: "bg-purple-400" },
  surprised: { text: "Hayratda", color: "text-sky-300 border-sky-500/30 bg-sky-950/40", badge: "bg-sky-400" },
  excited: { text: "Jo'shqin", color: "text-amber-400 border-amber-500/30 bg-amber-950/40", badge: "bg-amber-400" },
  empathetic: { text: "Samimiy", color: "text-rose-400 border-rose-500/30 bg-rose-950/40", badge: "bg-rose-400" },
};

export function HeaderHUD({
  emotion,
  isMuted,
  onToggleMute,
  showTranscript,
  onToggleTranscript,
  language,
  onSelectLanguage,
  onOpenCreatorInfo,
}: HeaderHUDProps) {
  const currentEmotionConfig = EMOTION_LABELS[emotion] || EMOTION_LABELS.neutral;

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 sm:p-6 pointer-events-auto">
      {/* Brand & Creator Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg shadow-black/20">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-wider uppercase text-slate-100 font-['Outfit']">
              Azizbek <span className="text-cyan-400 font-extrabold">AI</span>
            </h1>
          </div>
          <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/30">
            3D Cyber
          </span>
        </div>

        {/* Creator Tag - Highlighted Requirement */}
        <button
          id="creator-info-btn"
          onClick={onOpenCreatorInfo}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition-all duration-200 cursor-pointer shadow-sm hover:scale-105"
          title="Yaratuvchi haqida batafsil ma'lumot"
        >
          <Award className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="truncate max-w-[200px] sm:max-w-none">
            Yaratuvchi: <strong className="text-amber-200">Raxmiddinov Azizbek</strong> (78-maktab, 7-B)
          </span>
        </button>
      </div>

      {/* Controls & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Emotion Pill */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium backdrop-blur-md transition-colors duration-300 ${currentEmotionConfig.color}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${currentEmotionConfig.badge} animate-pulse`} />
          <span>{currentEmotionConfig.text}</span>
        </div>

        {/* Language Selector */}
        <div className="relative flex items-center bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full p-0.5">
          <button
            onClick={() => onSelectLanguage("uz")}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
              language === "uz"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="O'zbek tili"
          >
            UZ
          </button>
          <button
            onClick={() => onSelectLanguage("ru")}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
              language === "ru"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Русский язык"
          >
            RU
          </button>
          <button
            onClick={() => onSelectLanguage("en")}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
              language === "en"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="English"
          >
            EN
          </button>
        </div>

        {/* Mute Toggle */}
        <button
          id="toggle-mute-btn"
          onClick={onToggleMute}
          className={`p-2 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
            isMuted
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
              : "bg-slate-900/80 text-slate-300 hover:text-cyan-400 border-slate-700/60 hover:border-cyan-500/50"
          }`}
          title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish (Mute)"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Transcript drawer toggle */}
        <button
          id="toggle-transcript-btn"
          onClick={onToggleTranscript}
          className={`relative p-2 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
            showTranscript
              ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20"
              : "bg-slate-900/80 text-slate-300 hover:text-cyan-400 border-slate-700/60 hover:border-cyan-500/50"
          }`}
          title="Suhbat tarixini ko'rish"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
