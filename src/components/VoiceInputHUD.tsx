import React, { useState } from "react";
import { Mic, MicOff, Send, Square, Sparkles, Loader2 } from "lucide-react";
import { EmotionType, SupportedLanguage } from "../types";
import { VoiceWaveform } from "./VoiceWaveform";

interface VoiceInputHUDProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  audioLevel: number;
  emotion: EmotionType;
  interimTranscript: string;
  onToggleListening: () => void;
  onStopSpeaking: () => void;
  onSendMessage: (text: string) => void;
  language: SupportedLanguage;
}

export function VoiceInputHUD({
  isListening,
  isSpeaking,
  isProcessing,
  audioLevel,
  emotion,
  interimTranscript,
  onToggleListening,
  onStopSpeaking,
  onSendMessage,
  language,
}: VoiceInputHUDProps) {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const placeholderByLang = {
    uz: "Azizbek AI ga savol bering yoki mikrofondan foydalaning...",
    ru: "Задайте вопрос или используйте голосовой ввод...",
    en: "Ask Azizbek AI anything or use voice control...",
  };

  const statusTextByLang = {
    uz: isListening
      ? "Sizni eshitmoqda... Gapiring"
      : isProcessing
      ? "Azizbek AI o'ylamoqda..."
      : isSpeaking
      ? "Azizbek AI gapirmoqda..."
      : "Ovozli muloqot uchun bosing",
    ru: isListening
      ? "Слушаю вас... Говорите"
      : isProcessing
      ? "Azizbek AI думает..."
      : isSpeaking
      ? "Azizbek AI говорит..."
      : "Нажмите для голосового ввода",
    en: isListening
      ? "Listening to you... Speak"
      : isProcessing
      ? "Azizbek AI is thinking..."
      : isSpeaking
      ? "Azizbek AI is speaking..."
      : "Click to start voice chat",
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 pointer-events-none flex flex-col items-center gap-3">
      {/* Live Interim Transcript or Processing Banner */}
      {(isListening || isProcessing || isSpeaking) && (
        <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-xl max-w-xl text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
          {isProcessing ? (
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin flex-shrink-0" />
          ) : isListening ? (
            <span className="relative flex h-3 w-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          ) : (
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
          )}

          <p className="text-xs sm:text-sm font-medium text-slate-200 truncate">
            {interimTranscript ? `"${interimTranscript}"` : statusTextByLang[language]}
          </p>

          {(isSpeaking || isListening) && (
            <VoiceWaveform
              isActive={isSpeaking || isListening}
              isListening={isListening}
              audioLevel={audioLevel}
              emotion={emotion}
            />
          )}

          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Ovozni to'xtatish"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
        </div>
      )}

      {/* Main Interaction Bar */}
      <div className="pointer-events-auto w-full max-w-2xl flex items-center gap-2.5 bg-slate-950/80 backdrop-blur-xl p-2 rounded-3xl border border-slate-800 shadow-2xl shadow-black/40">
        {/* Central Voice Button */}
        <button
          id="main-voice-mic-btn"
          type="button"
          onClick={onToggleListening}
          className={`relative group flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 cursor-pointer flex-shrink-0 ${
            isListening
              ? "bg-red-500 text-white shadow-lg shadow-red-500/50 scale-105"
              : "bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:scale-105"
          }`}
          title={isListening ? "Tinglashni to'xtatish" : "Ovoz bilan gapirish"}
        >
          {/* Animated pulsing ring when listening */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-2xl bg-red-500/40 animate-ping" />
              <span className="absolute -inset-1 rounded-2xl border-2 border-red-400 animate-pulse" />
            </>
          )}
          {isListening ? (
            <MicOff className="w-5 h-5 relative z-10" />
          ) : (
            <Mic className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Text Input Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <input
            id="chat-text-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={placeholderByLang[language]}
            disabled={isProcessing}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500/60 focus:bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 outline-none transition-all"
          />
          <button
            id="send-message-btn"
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className={`p-2.5 rounded-xl font-medium transition-all duration-200 cursor-pointer flex-shrink-0 ${
              inputText.trim() && !isProcessing
                ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                : "bg-slate-800/60 text-slate-500 cursor-not-allowed"
            }`}
            title="Yuborish"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
