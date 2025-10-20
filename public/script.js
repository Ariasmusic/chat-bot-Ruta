const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// URL del backend en Render
const API_URL = "https://chat-bot-ruta.onrender.com/api/chat";

function addMessage(content, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = content;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      mode: "cors", // ✅ Esto es clave para peticiones cross-origin
    });

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const data = await res.json();
    if (data.reply) {
      addMessage(data.reply, "bot");
    } else if (data.error) {
      addMessage(`⚠️ ${data.error}`, "bot");
    } else {
      addMessage("⚠️ Respuesta inesperada del servidor.", "bot");
    }
  } catch (err) {
    console.error("❌ Error de conexión:", err);
    addMessage("❌ No se pudo conectar con el servidor.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
