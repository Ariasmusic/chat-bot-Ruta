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

// ✅ CORS — permitir solo el dominio del frontend en Render
app.use(cors({
  origin: "https://chat-bot-ruta.onrender.com", // dominio frontend
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

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

// 🌐 Ruta raíz → devuelve el index.html desde la carpeta "public"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✨ Manejo de cualquier otra ruta no definida (Single Page Application)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
