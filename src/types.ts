export type EmotionType =
  | "neutral"
  | "happy"
  | "thinking"
  | "surprised"
  | "excited"
  | "empathetic";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: number;
  emotion?: EmotionType;
  language?: string;
  isSpecial?: boolean;
}

export type SupportedLanguage = "uz" | "en" | "ru";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  speechCode: string;
  flag: string;
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  volume: number;
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
}

export interface AvatarVisualState {
  emotion: EmotionType;
  isSpeaking: boolean;
  audioLevel: number;
  lookAt: { x: number; y: number };
}
