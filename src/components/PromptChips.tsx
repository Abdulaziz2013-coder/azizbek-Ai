import { Sparkles, MessageCircle, Globe2, HelpCircle } from "lucide-react";
import { SupportedLanguage } from "../types";

interface PromptChipsProps {
  onSelectPrompt: (promptText: string) => void;
  language: SupportedLanguage;
  disabled?: boolean;
}

export function PromptChips({
  onSelectPrompt,
  language,
  disabled = false,
}: PromptChipsProps) {
  const promptsByLang: Record<SupportedLanguage, { label: string; text: string; icon: any; special?: boolean }[]> = {
    uz: [
      {
        label: "🎓 Seni kim yaratgan?",
        text: "Seni kim yaratgan?",
        icon: Sparkles,
        special: true,
      },
      {
        label: "🤖 O'zing haqingda aytib ber",
        text: "O'zing haqingda gapirib ber, qanday imkoniyatlaring bor?",
        icon: MessageCircle,
      },
      {
        label: "🌐 Can you speak English?",
        text: "Can you speak in English? Tell me something inspiring.",
        icon: Globe2,
      },
      {
        label: "💡 Qiziqarli fakt ayt",
        text: "Koinot yoki zamonaviy texnologiyalar haqida qiziqarli fakt aytib ber.",
        icon: HelpCircle,
      },
    ],
    ru: [
      {
        label: "🎓 Кто тебя создал?",
        text: "Кто тебя создал?",
        icon: Sparkles,
        special: true,
      },
      {
        label: "🤖 Расскажи о себе",
        text: "Расскажи о себе и о своих возможностях!",
        icon: MessageCircle,
      },
      {
        label: "🌐 Speak in English",
        text: "Let's practice English together!",
        icon: Globe2,
      },
      {
        label: "💡 Интересный факт",
        text: "Поделись интересным научным фактом о космосе или ИИ.",
        icon: HelpCircle,
      },
    ],
    en: [
      {
        label: "🎓 Who created you?",
        text: "Who created you?",
        icon: Sparkles,
        special: true,
      },
      {
        label: "🤖 Tell me about yourself",
        text: "Tell me about yourself and your capabilities!",
        icon: MessageCircle,
      },
      {
        label: "🇺🇿 O'zbekcha gapira olasanmi?",
        text: "O'zbek tilida gaplasha olasanmi?",
        icon: Globe2,
      },
      {
        label: "💡 Tell a cool fact",
        text: "Tell me an amazing fact about future technology.",
        icon: HelpCircle,
      },
    ],
  };

  const chips = promptsByLang[language] || promptsByLang.uz;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-2 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pointer-events-auto">
      {chips.map((chip, idx) => {
        return (
          <button
            key={idx}
            onClick={() => onSelectPrompt(chip.text)}
            disabled={disabled}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 backdrop-blur-md shadow-sm border ${
              chip.special
                ? "bg-amber-500/15 text-amber-200 border-amber-500/40 hover:bg-amber-500/25 hover:border-amber-400 hover:scale-105 shadow-amber-500/10"
                : "bg-slate-900/80 text-slate-300 border-slate-700/60 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-slate-800/90"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
