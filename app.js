// ------------------ Personality System ------------------
let personality = {
  preset: "friendly",
  custom: "",
  creativity: 50,
  humor: true,
  empathy: true,
  formality: "neutral"
};

// ------------------ Session Memory ------------------
let chatHistory = [];

// ------------------ Offline AI ------------------
const offlineKnowledge = {
  "hello": "Hey there! 👋 I'm Great AI, built by Evolutional Tech. How can I help?",
  "who are you": "I'm Great AI 🤖 — designed by Great Mayuku (Evolutional Tech CEO).",
  "what is evolutional tech": "Evolutional Tech™ is a community shaping the future of technology 🌍✨.",
  "bye": "Goodbye 👋 Stay innovative with Evolutional Tech!"
};

// ------------------ Quick Replies ------------------
const quickReplies = [
  "Tell me a joke",
  "Give me a quote",
  "What is Evolutional Tech?",
  "Switch to Offline Mode",
  "Who created you?"
];

// ------------------ Utility Functions ------------------
function getTimestamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function addMessage(sender, text, isTyping = false) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  if (isTyping) {
    msg.innerHTML = `<div class="typing-indicator">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>`;
    msg.id = "typing-indicator";
  } else {
    msg.innerHTML = `<div>${text}</div><div class="message-timestamp">${getTimestamp()}</div>`;
  }

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg;
}

function removeTyping() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

// ------------------ Offline AI Response ------------------
function offlineAI(input) {
  input = input.toLowerCase();
  return offlineKnowledge[input] || "I'm running offline mode, so my knowledge is limited ⚡";
}

// ------------------ Handle API Request ------------------
async function processAPIRequest(messages) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: messages
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "⚠️ No response received.";
  } catch (err) {
    console.error("API error:", err);
    return "⚠️ Failed to fetch response.";
  }
}

// ------------------ Send Message ------------------
async function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";

  chatHistory.push({ role: "user", content: text });

  // Typing indicator
  addMessage("bot", "", true);

  let reply;
  const selectedAPI = document.getElementById("apiSelector").value;

  if (selectedAPI === "offline") {
    await new Promise(r => setTimeout(r, 800));
    reply = offlineAI(text);
  } else {
    reply = await processAPIRequest(chatHistory);
  }

  removeTyping();
  addMessage("bot", reply);

  chatHistory.push({ role: "assistant", content: reply });

  showQuickReplies();
}

// ------------------ Quick Replies ------------------
function showQuickReplies() {
  const chat = document.getElementById("chat");
  const existing = document.querySelector(".quick-replies");
  if (existing) existing.remove();

  const qrContainer = document.createElement("div");
  qrContainer.className = "quick-replies";

  quickReplies.forEach(q => {
    const btn = document.createElement("button");
    btn.className = "quick-reply";
    btn.textContent = q;
    btn.onclick = () => {
      document.getElementById("userInput").value = q;
      sendMessage();
    };
    qrContainer.appendChild(btn);
  });

  chat.appendChild(qrContainer);
  chat.scrollTop = chat.scrollHeight;
}

// ------------------ Jokes & Quotes ------------------
document.getElementById("jokeBtn").onclick = () => {
  addMessage("bot", "😂 Why don’t skeletons fight each other? Because they don’t have the guts!");
};
document.getElementById("quoteBtn").onclick = () => {
  addMessage("bot", "🌟 'The best way to predict the future is to create it.' – Peter Drucker");
};

// ------------------ Calculator ------------------
document.getElementById("calcBtn").onclick = () => {
  const expr = prompt("Enter calculation (e.g., 5+3*2):");
  if (expr) {
    try {
      const result = eval(expr);
      addMessage("bot", `🧮 Result: ${result}`);
    } catch {
      addMessage("bot", "⚠️ Invalid expression.");
    }
  }
};

// ------------------ Personality Modal ------------------
const personalityBtn = document.getElementById("personalityBtn");
const personalityModal = document.getElementById("personalityModal");
const savePersonalityBtn = document.getElementById("savePersonalityBtn");

personalityBtn.onclick = () => personalityModal.style.display = "flex";
savePersonalityBtn.onclick = () => {
  personality.custom = document.getElementById("personalityInput").value;
  personality.creativity = document.getElementById("creativitySlider").value;
  personality.humor = document.getElementById("humorToggle").checked;
  personality.empathy = document.getElementById("empathyToggle").checked;
  personality.formality = document.getElementById("formalitySelect").value;
  personalityModal.style.display = "none";
  addMessage("bot", "✨ Personality updated!");
};

// ------------------ Personality Presets ------------------
document.querySelectorAll(".preset-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    personality.preset = card.dataset.preset;
  });
});

// ------------------ Tabs in Personality Modal ------------------
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    document.querySelectorAll(".tab-content").forEach(tc => tc.classList.add("hidden"));
    document.getElementById(`${btn.dataset.tab}-tab`).classList.remove("hidden");
  });
});

// ------------------ Join Modal ------------------
const joinModal = document.getElementById("joinModal");
const closeJoinModal = document.getElementById("closeJoinModal");

setTimeout(() => { joinModal.style.display = "flex"; }, 3000);
closeJoinModal.onclick = () => joinModal.style.display = "none";

// ------------------ Utility Buttons ------------------
document.getElementById("clearBtn").onclick = () => {
  document.getElementById("chat").innerHTML = "";
  chatHistory = [];
};
document.getElementById("saveBtn").onclick = () => {
  const content = chatHistory.map(m => `${m.role}: ${m.content}`).join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "chat.txt";
  a.click();
};

// ------------------ Dark/Light Mode ------------------
document.getElementById("modeToggle").onclick = () => {
  document.body.classList.toggle("light-mode");
};
