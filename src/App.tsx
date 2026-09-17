import { useState, useCallback, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { AvatarCanvas } from "./components/AvatarCanvas";
import { HeaderHUD } from "./components/HeaderHUD";
import { VoiceInputHUD } from "./components/VoiceInputHUD";
import { SpeechBubble } from "./components/SpeechBubble";
import { PromptChips } from "./components/PromptChips";
import { ChatDrawer } from "./components/ChatDrawer";
import { CreatorModal } from "./components/CreatorModal";
import { useVoice } from "./hooks/useVoice";
import { EmotionType, ChatMessage, SupportedLanguage } from "./types";

export default function App() {
  const [language, setLanguage] = useState<SupportedLanguage>("uz");
  const [emotion, setEmotion] = useState<EmotionType>("happy");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSpeech, setCurrentSpeech] = useState<string>(
    "Salom! Men Azizbek AI — 78-maktabdagi 7-B sinf o'quvchisi Raxmiddinov Azizbek tomonidan yaratilgan 3D ovozli yordamchiman. Savollaringizni ovoz bilan yoki yozib berishingiz mumkin!"
  );
  const [isSpecialCreatorResponse, setIsSpecialCreatorResponse] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [showCreatorModal, setShowCreatorModal] = useState<boolean>(false);

  const initialGreetingDone = useRef(false);

  // Send message to server backend API
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsProcessing(true);
      setEmotion("thinking");

      // Check if creator question
      const lower = text.toLowerCase();
      const isCreator =
        lower.includes("kim yaratgan") ||
        lower.includes("seni kim") ||
        lower.includes("who created") ||
        lower.includes("who made") ||
        lower.includes("кто тебя создал") ||
        lower.includes("кто создал") ||
        lower.includes("kim yasagan");

      if (isCreator) {
        // Trigger celebratory confetti immediately
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#00f0ff", "#10b981"],
        });
      }

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text.trim(),
            history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
            language,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server status ${response.status}`);
        }

        const data = await response.json();
        const replyText =
          data.reply ||
          "Meni 78-maktabdagi 7-B sinf o'quvchisi Raxmiddinov Azizbek yaratgan!";
        const newEmotion = (data.emotion as EmotionType) || "happy";

        const isSpecial = isCreator || data.specialEvent === "creator_recognition";
        setIsSpecialCreatorResponse(isSpecial);
        setCurrentSpeech(replyText);
        setEmotion(newEmotion);

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: replyText,
          timestamp: Date.now(),
          emotion: newEmotion,
          language: data.language || language,
          isSpecial,
        };

        setMessages((prev) => [...prev, aiMsg]);

        // Speak response out loud using TTS
        speakText(replyText, (data.language as SupportedLanguage) || language);

        if (isSpecial) {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
          });
        }
      } catch (err) {
        console.error("Chat error:", err);
        const fallback =
          "Meni 78-maktabdagi 7-B sinf o'quvchisi Raxmiddinov Azizbek yaratgan! U meni siz bilan muloqot qilishim uchun ishlab chiqqan.";
        setCurrentSpeech(fallback);
        setEmotion("happy");
        speakText(fallback, language);

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: fallback,
            timestamp: Date.now(),
            emotion: "happy",
            isSpecial: true,
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isProcessing, messages, language]
  );

  // Voice controller hook
  const {
    isListening,
    isSpeaking,
    audioLevel,
    interimTranscript,
    isMuted,
    setIsMuted,
    toggleListening,
    speakText,
    stopSpeaking,
  } = useVoice(language, handleSendMessage);

  // Initial greeting trigger on first interaction
  useEffect(() => {
    if (!initialGreetingDone.current) {
      initialGreetingDone.current = true;
      setMessages([
        {
          id: "welcome-1",
          sender: "ai",
          text: currentSpeech,
          timestamp: Date.now(),
          emotion: "happy",
          isSpecial: true,
        },
      ]);
    }
  }, [currentSpeech]);

  // Language change handler
  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    let langGreeting = "";
    if (lang === "uz") {
      langGreeting = "O'zbek tili tanlandi. Qanday savolingiz bor?";
    } else if (lang === "ru") {
      langGreeting = "Выбран русский язык. Чем я могу вам помочь?";
    } else {
      langGreeting = "English language selected. How can I assist you today?";
    }
    setCurrentSpeech(langGreeting);
    setIsSpecialCreatorResponse(false);
    setEmotion("happy");
    speakText(langGreeting, lang);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans'] select-none">
      {/* Background Cyber Grid & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/60 via-slate-950 to-black pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top HUD */}
      <HeaderHUD
        emotion={emotion}
        isMuted={isMuted}
        onToggleMute={() => {
          if (!isMuted) stopSpeaking();
          setIsMuted(!isMuted);
        }}
        showTranscript={showTranscript}
        onToggleTranscript={() => setShowTranscript((prev) => !prev)}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        onOpenCreatorInfo={() => setShowCreatorModal(true)}
      />

      {/* Speech Bubble Overlay */}
      <SpeechBubble
        text={currentSpeech}
        emotion={emotion}
        isSpeaking={isSpeaking}
        isSpecial={isSpecialCreatorResponse}
        onReplay={() => speakText(currentSpeech, language)}
      />

      {/* 3D Canvas Centered */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <AvatarCanvas
          emotion={emotion}
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          onAvatarClick={() => {
            setEmotion("excited");
            speakText(
              language === "uz"
                ? "Salom! Men sizni ko'rib turibman!"
                : language === "ru"
                ? "Привет! Я вас слышу и вижу!"
                : "Hello there! I can see you!",
              language
            );
          }}
        />
      </div>

      {/* Prompt Suggestions Chips (Above Bottom Bar) */}
      <div className="absolute bottom-24 sm:bottom-28 left-0 right-0 z-20 pointer-events-none">
        <PromptChips
          onSelectPrompt={handleSendMessage}
          language={language}
          disabled={isProcessing}
        />
      </div>

      {/* Bottom Voice & Text Input HUD */}
      <VoiceInputHUD
        isListening={isListening}
        isSpeaking={isSpeaking}
        isProcessing={isProcessing}
        audioLevel={audioLevel}
        emotion={emotion}
        interimTranscript={interimTranscript}
        onToggleListening={toggleListening}
        onStopSpeaking={stopSpeaking}
        onSendMessage={handleSendMessage}
        language={language}
      />

      {/* Conversation History Drawer */}
      <ChatDrawer
        isOpen={showTranscript}
        onClose={() => setShowTranscript(false)}
        messages={messages}
        onReplaySpeech={(text, lang) =>
          speakText(text, (lang as SupportedLanguage) || language)
        }
        onClearMessages={() => setMessages([])}
        language={language}
      />

      {/* Creator Info & Tribute Modal */}
      <CreatorModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
        onAskCreatorQuestion={() => handleSendMessage("Seni kim yaratgan?")}
      />
    </main>
  );
}
