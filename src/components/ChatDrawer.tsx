import { useState } from "react";
import { X, Volume2, Copy, Check, Trash2, Bot, User, Sparkles } from "lucide-react";
import { ChatMessage, SupportedLanguage } from "../types";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onReplaySpeech: (text: string, lang?: string) => void;
  onClearMessages: () => void;
  language: SupportedLanguage;
}

export function ChatDrawer({
  isOpen,
  onClose,
  messages,
  onReplaySpeech,
  onClearMessages,
  language,
}: ChatDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const titleByLang = {
    uz: "Suhbat Tarixi",
    ru: "История Диалога",
    en: "Conversation History",
  };

  const emptyTextByLang = {
    uz: "Hali xabarlar yo'q. Mikrofonga gapiring yoki pastdagi savollardan birini tanlang!",
    ru: "Пока нет сообщений. Говорите в микрофон или выберите вопрос снизу!",
    en: "No messages yet. Speak into the mic or pick a prompt below!",
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-100 font-['Outfit']">
            {titleByLang[language]}
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {messages.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={onClearMessages}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              title="Tarixni tozalash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Sparkles className="w-8 h-8 text-cyan-500/40 mb-3 animate-pulse" />
            <p className="text-sm">{emptyTextByLang[language]}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAI = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${isAI ? "items-start" : "items-end"}`}
              >
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono px-1">
                  {isAI ? (
                    <>
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Azizbek AI</span>
                      {msg.emotion && (
                        <span className="text-[10px] text-cyan-400/80">({msg.emotion})</span>
                      )}
                    </>
                  ) : (
                    <>
                      <span>Siz</span>
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    </>
                  )}
                </div>

                <div
                  className={`group relative p-3.5 rounded-2xl max-w-[90%] text-sm leading-relaxed shadow-sm ${
                    isAI
                      ? msg.isSpecial
                        ? "bg-amber-950/40 text-amber-100 border border-amber-500/40 rounded-tl-sm"
                        : "bg-slate-900/90 text-slate-100 border border-slate-700/60 rounded-tl-sm"
                      : "bg-cyan-600 text-slate-950 font-medium rounded-tr-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Actions for AI messages */}
                  {isAI && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => onReplaySpeech(msg.text, msg.language)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Ovoz bilan qayta o'qish"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span className="text-[11px]">Tinglash</span>
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer"
                        title="Matnni nusxalash"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">Nusxalandi</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[11px]">Nusxa</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
