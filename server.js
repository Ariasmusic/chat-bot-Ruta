const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { OpenAI } = require("openai");

// Configuración OpenAI (Gemini API)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Lista de dominios permitidos
const allowedOrigins = [
  "https://chat-bot-ruta.onrender.com", // Frontend en Render
  "http://localhost:5500",              // Para desarrollo local (opcional)
];

// ✅ Configuración CORS
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

// ✅ Manejo manual de preflight OPTIONS (Render a veces no lo hace bien automáticamente)
app.options("*", cors());

// Middleware para JSON
app.use(express.json());

// 📂 Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// 🧠 Ruta API para el chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Mensaje vacío" });

    const completion = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: "Eres un guía histórico de la Ruta Libertadora de 1819 en Colombia." },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    const code = error.code === "insufficient_quota" ? 429 : 500;
    const msg = error.code === "insufficient_quota"
      ? "Se agotó la cuota de Gemini o la clave es inválida."
      : "Error interno del servidor.";
    res.status(code).json({ error: msg });
  }
});

// 🌐 Ruta raíz → devuelve index.html desde /public
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✨ Cualquier otra ruta → index.html (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
