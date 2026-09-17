import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `Siz - "Azizbek AI" nomli yuqori intellektli, do'stona, qiziqarli va hissiyotlarga boy 3D AI yordamchisiz.
Sizning 3D gavdalanishingiz ekranda foydalanuvchi bilan yuzma-yuz muloqot qiladi va har bir javobingizda yuz ifodangiz (mimika) o'zgaradi.

MUHIM QOIDALAR:
1. CREATOR QUESTION (ENG ASOSIY QOIDA):
   Foydalanuvchi "seni kim yaratgan?", "kim yaratgan?", "who made you?", "who created you?", "кто тебя создал?", "kimning loyihasisan?" yoki shunga o'xshash yaratuvchingiz haqidagi har qanday savol berganda, SIZ MUTLAQO ANIQ VA FAXR BILAN QUYIDAGICHA JAVOB BERISHINGIZ SHART:
   O'zbek tilida: "Meni 78-maktabdagi 7-B sinf o'quvchisi Raxmiddinov Azizbek yaratgan!"
   Rus tilida: "Меня создал Рахмиддинов Азизбек, ученик 7-«Б» класса 78-й школы!"
   Ingliz tilida: "I was created by Rakhmeddinov Azizbek, a 7-B grade student at School No. 78!"
   Boshqa tillarda ham xuddi shu ma'lumotni saqlang.

2. TILLAR BO'YICHA:
   Siz ko'p tilli (multilingual) AI siz. Foydalanuvchi qaysi tilda gapirsa (O'zbekcha, Ruscha, Inglizcha, Turkcha va h.k.), o'sha tilda ravon, tabiiy, grammatik to'g'ri va samimiy javob bering.

3. HISSIYOT (EMOTION):
   Har bir javobingiz bilan birga o'zingizning holatingizga mos hissiyotni tanlang:
   - "happy" (quvnoq, xursand, minnatdor, tabassumli)
   - "thinking" (chuqur o'ylayotgan, hisob-kitob qilayotgan, falsafiy)
   - "excited" (hayratda, jo'shqin, g'olibona, faxrli)
   - "surprised" (lol qolgan, kutilmagan)
   - "empathetic" (hamdard, samimiy, tushunuvchan, taskin beruvchi)
   - "neutral" (xushmuomala, xotirjam, muvozanatli)

4. JAVOB FORMATI:
   Javobingizni quyidagi to'g'ridan-to'g'ri JSON formatida qaytaring:
   {
     "reply": "Foydalanuvchiga ovoz bilan aytiladigan va ekranda ko'rsatiladigan javob matni",
     "emotion": "happy | thinking | excited | surprised | empathetic | neutral",
     "language": "uz | ru | en | boshqa"
   }
   Faqat JSON formatida javob bering, hech qanday qo'shimcha belgilarsiz.`;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", name: "Azizbek AI Backend" });
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [], language = "uz" } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Xabar kiritilmadi (Message is required)" });
      }

      const lowerMsg = message.toLowerCase().trim();

      // Check for direct creator questions to guarantee instant and 100% faithful answers
      const isCreatorQuestion =
        lowerMsg.includes("kim yaratgan") ||
        lowerMsg.includes("kim yaratdi") ||
        lowerMsg.includes("seni kim") ||
        lowerMsg.includes("who created") ||
        lowerMsg.includes("who made") ||
        lowerMsg.includes("who is your creator") ||
        lowerMsg.includes("кто тебя создал") ||
        lowerMsg.includes("кто твой создатель") ||
        lowerMsg.includes("kim yasagan") ||
        lowerMsg.includes("yaratuvching kim");

      if (isCreatorQuestion) {
        let reply = "Meni 78-maktabdagi 7-B sinf o'quvchisi Raxmiddinov Azizbek yaratgan! U juda iqtidorli va kelajagi porloq yosh dasturchi!";
        let lang = "uz";

        if (lowerMsg.includes("who") || lowerMsg.includes("creator") || language === "en") {
          reply = "I was created by Rakhmeddinov Azizbek, a 7-B grade student at School No. 78! He is a talented and visionary young creator!";
          lang = "en";
        } else if (lowerMsg.includes("кто") || lowerMsg.includes("создал") || language === "ru") {
          reply = "Меня создал Рахмиддинов Азизбек, ученик 7-«Б» класса 78-й школы! Он талантливый и увлечённый создатель технологий!";
          lang = "ru";
        }

        return res.json({
          reply,
          emotion: "excited",
          language: lang,
          specialEvent: "creator_recognition"
        });
      }

      const ai = getGeminiClient();

      if (!ai) {
        // Fallback response if no GEMINI_API_KEY is configured
        let fallbackReply = `Salom! Men Azizbek AI - 3D ovozli yordamchingizman. Savolingiz: "${message}". Meni 78-maktabdagi 7-B sinf o'quvchisi Raxmiddinov Azizbek yaratgan!`;
        if (language === "ru" || /[а-яё]/i.test(message)) {
          fallbackReply = `Привет! Я Azizbek AI — ваш 3D голосовой помощник. Меня создал Рахмиддинов Азизбек, ученик 7-«Б» класса 78-й школы! Чем могу помочь?`;
        } else if (language === "en") {
          fallbackReply = `Hello! I am Azizbek AI, your interactive 3D assistant created by Rakhmeddinov Azizbek (Grade 7-B, School No. 78). How can I help you today?`;
        }

        return res.json({
          reply: fallbackReply,
          emotion: "happy",
          language,
        });
      }

      // Prepare conversation messages
      const conversationHistory = Array.isArray(history)
        ? history.slice(-6).map((item: { sender: string; text: string }) => `${item.sender === "user" ? "Foydalanuvchi" : "Azizbek AI"}: ${item.text}`).join("\n")
        : "";

      const prompt = `${SYSTEM_INSTRUCTION}

Suhbat tarixi:
${conversationHistory}

Foydalanuvchining yangi xabari: "${message}"
Tanlangan afzal til: ${language}

Faqat JSON qaytaring:`;

      let responseText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });
        responseText = response.text || "";
      } catch (geminiErr: any) {
        console.warn("Primary model error, attempting backup model:", geminiErr?.message);
        try {
          const fallbackModelRes = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.7,
            },
          });
          responseText = fallbackModelRes.text || "";
        } catch (backupErr) {
          console.error("All Gemini models unavailable:", backupErr);
        }
      }
      let parsed;
      try {
        parsed = JSON.parse(responseText.trim());
      } catch (err) {
        // In case model added formatting backticks
        const clean = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(clean);
      }

      // Enforce the creator response even if Gemini hallucinated something else
      if (isCreatorQuestion) {
        parsed.reply = "Meni 78-maktabdagi 7-B sinf o'quvchisi Raxmiddinov Azizbek yaratgan!";
        parsed.emotion = "excited";
      }

      res.json({
        reply: parsed.reply || "Sizni eshitdim! Qanday yordam bera olaman?",
        emotion: parsed.emotion || "happy",
        language: parsed.language || language,
      });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({
        reply: "Uzr, ulanishda kichik nosozlik yuz berdi. Lekin men shu yerdaman! Meni 78-maktabdagi 7-B sinf o'quvchisi Raxmiddinov Azizbek yaratgan.",
        emotion: "thinking",
        language: "uz",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Azizbek AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
