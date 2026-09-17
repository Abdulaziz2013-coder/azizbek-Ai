import { useState, useEffect, useRef, useCallback } from "react";
import { SupportedLanguage } from "../types";

// SpeechRecognition type declarations for browsers
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function useVoice(
  language: SupportedLanguage,
  onSpeechResult: (text: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const ttsIntervalRef = useRef<number | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionClass =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      setHasSpeechRecognition(true);
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Set recognition language
      const langMap: Record<SupportedLanguage, string> = {
        uz: "uz-UZ",
        en: "en-US",
        ru: "ru-RU",
      };
      recognition.lang = langMap[language] || "uz-UZ";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalTranscript.trim()) {
          setInterimTranscript("");
          setIsListening(false);
          onSpeechResult(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setIsListening(false);
          setInterimTranscript("");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
    } else {
      setHasSpeechRecognition(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [language, onSpeechResult]);

  // Mic Audio Meter
  const startMicAudioMeter = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length / 255;
        setMicVolume(avg);
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn("Microphone meter initialization error:", err);
    }
  };

  const stopMicAudioMeter = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicVolume(0);
  };

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert("Kechirasiz, sizning brauzeringizda ovozni aniqlash (Speech Recognition) qo'llab-quvvatlanmaydi. Iltimos Chrome yoki Edge brauzeridan foydalaning yoki xabarni yozib yuboring.");
      return;
    }

    // Stop speaking if currently speaking
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setAudioLevel(0);
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      stopMicAudioMeter();
    } else {
      try {
        setInterimTranscript("");
        recognitionRef.current.start();
        startMicAudioMeter();
      } catch (err) {
        console.warn("Recognition start error:", err);
      }
    }
  }, [isListening]);

  // Text to Speech
  const speakText = useCallback(
    (text: string, langCode: SupportedLanguage = language) => {
      if (isMuted || !window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      if (ttsIntervalRef.current) {
        clearInterval(ttsIntervalRef.current);
      }

      const utterance = new SpeechSynthesisUtterance(text);

      const langMap: Record<SupportedLanguage, string> = {
        uz: "uz-UZ",
        en: "en-US",
        ru: "ru-RU",
      };
      utterance.lang = langMap[langCode] || "uz-UZ";

      // Try finding the most fitting voice
      const voices = window.speechSynthesis.getVoices();
      const targetLang = utterance.lang.toLowerCase();
      const foundVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith(targetLang.slice(0, 2))) ||
        voices.find((v) => v.lang.toLowerCase().includes("uz")) ||
        voices.find((v) => v.lang.toLowerCase().includes("ru")) ||
        voices[0];

      if (foundVoice) {
        utterance.voice = foundVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      utterance.onstart = () => {
        setIsSpeaking(true);

        // Simulate natural phoneme modulation for 3D lip-sync
        let tick = 0;
        ttsIntervalRef.current = window.setInterval(() => {
          tick++;
          const mod = Math.sin(tick * 0.8) * 0.4 + Math.random() * 0.5 + 0.1;
          setAudioLevel(Math.min(1, Math.max(0.1, mod)));
        }, 80);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setAudioLevel(0);
        if (ttsIntervalRef.current) {
          clearInterval(ttsIntervalRef.current);
          ttsIntervalRef.current = null;
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setAudioLevel(0);
        if (ttsIntervalRef.current) {
          clearInterval(ttsIntervalRef.current);
          ttsIntervalRef.current = null;
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [isMuted, language]
  );

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setAudioLevel(0);
    if (ttsIntervalRef.current) {
      clearInterval(ttsIntervalRef.current);
      ttsIntervalRef.current = null;
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    micVolume,
    audioLevel: isSpeaking ? audioLevel : isListening ? micVolume : 0,
    interimTranscript,
    isMuted,
    setIsMuted,
    hasSpeechRecognition,
    toggleListening,
    speakText,
    stopSpeaking,
  };
}
