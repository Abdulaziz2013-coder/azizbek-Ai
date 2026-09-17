import { Award, Sparkles, School, GraduationCap, Cpu, X, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskCreatorQuestion: () => void;
}

export function CreatorModal({
  isOpen,
  onClose,
  onAskCreatorQuestion,
}: CreatorModalProps) {
  if (!isOpen) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#00f0ff", "#f59e0b", "#10b981", "#8b5cf6"],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-slate-900/95 border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 text-slate-100 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
            <Award className="w-9 h-9" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 animate-bounce" />
          </div>

          <h3 className="text-xl font-bold font-['Outfit'] tracking-wide text-amber-300">
            Loyiha Yaratuvchisi
          </h3>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Raxmiddinov Azizbek
          </h2>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-cyan-300 text-xs font-medium mt-2">
            <School className="w-3.5 h-3.5 text-cyan-400" />
            <span>78-maktab • 7-B sinf o'quvchisi</span>
          </div>

          <p className="text-sm text-slate-300 mt-4 leading-relaxed">
            Azizbek AI loyihasi — zamonaviy 3D animatsiyalar, tabiiy ovozli boshqaruv va sun'iy intellekt orqali foydalanuvchilar bilan jonli muloqot qiluvchi innovatsion tizimdir.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-2.5 w-full mt-5 text-left text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-cyan-400 font-bold block mb-1 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> 3D Mimika
              </span>
              <span className="text-slate-400">Hissiyotlarga mos real vaqtda o'zgaruvchi yuz ifodalari</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-amber-400 font-bold block mb-1 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> Ovozli Boshqaruv
              </span>
              <span className="text-slate-400">Nutqni aniqlash va tabiiy ovoz sintezi (TTS)</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-6">
            <button
              onClick={() => {
                triggerConfetti();
                onAskCreatorQuestion();
                onClose();
              }}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Savolni berish</span>
            </button>

            <button
              onClick={triggerConfetti}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors cursor-pointer"
            >
              🎉 Tabriklash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
