const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { OpenAI } = require("openai");

// ✅ Configuración OpenAI (Gemini API)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Dominios permitidos
const allowedOrigins = [
  "https://chat-bot-ruta.onrender.com",
  "http://localhost:5500",
];

// ✅ CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Preflight para /api/chat (IMPORTANTE)
app.options("/api/chat", cors());

// 🧠 API del chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Mensaje vacío" });

    // 🟢 1. Detección de saludo
    const texto = message.trim().toLowerCase();

    const saludos = [
      "hola",
      "buenos días",
      "buenas tardes",
      "buenas noches",
      "hey",
      "qué más",
      "que más",
      "saludos",
    ];

    const esSaludo = saludos.some((s) => texto.startsWith(s));

    if (esSaludo) {
      // 🟢 2. Respuesta personalizada sin llamar a la API
      const respuestas = [
        "¡Hola! 👋 Soy tu guía histórico virtual de la Ruta Libertadora. ¿Sobre qué etapa o personaje deseas aprender hoy?",
        "¡Saludos viajero del tiempo! 🚩 Estoy aquí para contarte los secretos de la Ruta Libertadora. ¿Por dónde quieres empezar?",
        "¡Hola! Soy el guía digital de la gesta libertadora de 1819. ¿Te gustaría que te hable sobre Bolívar, los batallones o el recorrido?",
      ];

      const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
      return res.json({ reply: respuesta });
    }

    // 🧠 3. Si no es saludo → responder con la API de Gemini
    const completion = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: "Eres un guía histórico de la Ruta Libertadora de 1819 en Colombia. Responde con tono educativo, amable y cercano.",
        },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    const code = error.code === "insufficient_quota" ? 429 : 500;
    const msg =
      error.code === "insufficient_quota"
        ? "Se agotó la cuota de Gemini o la clave es inválida."
        : "Error interno del servidor.";
    res.status(code).json({ error: msg });
  }
});

// 🌐 Página raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✨ SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
