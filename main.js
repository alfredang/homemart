import { RetellWebClient } from "https://cdn.jsdelivr.net/npm/retell-client-js-sdk/+esm";

// ── Configuration ──
const CREATE_WEB_CALL_URL = "/api/create-web-call";

// ── Product Data (from household_products.csv) ──
const PRODUCTS = [
  { brand: "Dyson", price: 499, name: "Vacuum Cleaner V11", description: "Cordless high-power vacuum cleaner with advanced filtration", category: "cleaning", emoji: "🧹", tag: "Premium" },
  { brand: "Philips", price: 89, name: "Air Fryer Essential", description: "Healthy air fryer that uses rapid air technology for low oil cooking", category: "kitchen", emoji: "🍳", tag: "Popular" },
  { brand: "Panasonic", price: 120, name: "Microwave Oven NN-ST34", description: "Compact microwave oven with multiple cooking modes", category: "kitchen", emoji: "📡" },
  { brand: "LG", price: 650, name: "Smart Washing Machine 7kg", description: "Energy efficient front load washing machine with smart features", category: "appliance", emoji: "👕", tag: "Smart" },
  { brand: "Samsung", price: 320, name: "Robot Vacuum VR5000", description: "Automatic robot vacuum cleaner with smart navigation", category: "cleaning", emoji: "🤖", tag: "Smart" },
  { brand: "Tefal", price: 45, name: "Non-Stick Frying Pan 28cm", description: "Durable frying pan with titanium non-stick coating", category: "kitchen", emoji: "🍳" },
  { brand: "Sharp", price: 210, name: "Air Purifier FP-J30E", description: "Removes dust and allergens using Plasmacluster technology", category: "appliance", emoji: "🌬️", tag: "Health" },
  { brand: "Xiaomi", price: 60, name: "Electric Kettle Smart Pro", description: "Temperature controlled smart kettle with mobile app support", category: "kitchen", emoji: "☕", tag: "Smart" },
  { brand: "Black+Decker", price: 55, name: "Steam Iron BXIR2400", description: "Powerful steam iron with anti-drip and self-clean function", category: "appliance", emoji: "👔" },
  { brand: "Bosch", price: 180, name: "Hand Mixer MFQ4080", description: "Multi-speed hand mixer with whisk and dough hook attachments", category: "kitchen", emoji: "🥣" },
  { brand: "Brita", price: 35, name: "Water Filter Pitcher Marella", description: "Water filtration jug that reduces chlorine and impurities", category: "kitchen", emoji: "💧" },
  { brand: "Zojirushi", price: 150, name: "Rice Cooker NS-TSC10", description: "Automatic rice cooker with fuzzy logic cooking control", category: "kitchen", emoji: "🍚", tag: "Best Seller" },
  { brand: "KitchenAid", price: 420, name: "Stand Mixer Artisan", description: "Professional stand mixer with multiple attachment options", category: "kitchen", emoji: "🎂", tag: "Premium" },
  { brand: "Hamilton Beach", price: 70, name: "Blender Power Elite", description: "High-performance blender for smoothies and food processing", category: "kitchen", emoji: "🥤" },
  { brand: "Nestle", price: 12, name: "Instant Coffee Gold Blend", description: "Premium instant coffee with rich aroma and smooth taste", category: "care", emoji: "☕" },
  { brand: "Colgate", price: 4, name: "Total Toothpaste 150g", description: "Fluoride toothpaste for complete oral protection", category: "care", emoji: "🦷" },
  { brand: "Dettol", price: 6, name: "Antibacterial Hand Wash", description: "Kills 99.9% of germs and provides long-lasting hygiene", category: "care", emoji: "🧴" },
  { brand: "Scotch-Brite", price: 3, name: "Scrub Sponge Pack", description: "Multi-purpose scrub sponges for kitchen cleaning", category: "cleaning", emoji: "🧽" },
  { brand: "Pledge", price: 7, name: "Furniture Polish Spray", description: "Cleans and protects wooden furniture surfaces", category: "cleaning", emoji: "✨" },
  { brand: "Glad", price: 10, name: "Trash Bags 30L", description: "Durable garbage bags with leak protection for household waste", category: "cleaning", emoji: "🗑️" },
];

let currentFilter = "all";

// ── Render Products ──
function renderProducts(filter = "all") {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-category="${p.category}">
      <div class="product-card-visual">
        <span class="product-emoji">${p.emoji}</span>
      </div>
      <div class="product-card-body">
        <div class="product-brand">${p.brand}</div>
        <h3>${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <div class="product-footer">
          <span class="product-price">$${p.price}</span>
          ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
        </div>
      </div>
    </div>
  `).join("");
}

// ── Product Filtering ──
function setupFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderProducts(currentFilter);
    });
  });

  // Category cards also trigger filter
  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      const cat = card.dataset.category;
      currentFilter = cat;
      filterBtns.forEach(b => {
        b.classList.toggle("active", b.dataset.filter === cat);
      });
      renderProducts(cat);
      document.getElementById("products").scrollIntoView({ behavior: "smooth" });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  setupFilters();
});

// ── Retell client ──
const retellClient = new RetellWebClient();
let callActive = false;
let timerInterval = null;
let seconds = 0;

// ── DOM refs ──
const nav = document.getElementById("navbar");
const modal = document.getElementById("voice-modal");
const modalStatus = document.getElementById("vm-status");
const modalTimer = document.getElementById("vm-timer");
const modalAvatar = document.getElementById("vm-avatar");
const hangupBtn = document.getElementById("vm-hangup");

// ── Navbar scroll shadow ──
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 10);
});

// ── Mobile Nav ──
const hamburger = document.getElementById("nav-hamburger");
const mobileNav = document.getElementById("mobile-nav");
const mobileOverlay = document.getElementById("mobile-nav-overlay");
const mobileClose = document.getElementById("mobile-nav-close");

function openMobileNav() {
  mobileNav.classList.add("active");
  mobileOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeMobileNav() {
  mobileNav.classList.remove("active");
  mobileOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

if (hamburger) {
  hamburger.addEventListener("click", openMobileNav);
  mobileClose.addEventListener("click", closeMobileNav);
  mobileOverlay.addEventListener("click", closeMobileNav);

  // Close on link click
  document.querySelectorAll(".mobile-nav-links a").forEach(link => {
    link.addEventListener("click", closeMobileNav);
  });
}

// ── Voice call functions ──
function showModal() {
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function hideModal() {
  modal.classList.remove("active");
  document.body.style.overflow = "";
  stopTimer();
  modalAvatar.classList.remove("speaking");
  modalStatus.textContent = "Connecting...";
  modalTimer.textContent = "00:00";
}

function startTimer() {
  seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    modalTimer.textContent = `${m}:${s}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

async function startVoiceCall() {
  if (callActive) return;
  showModal();
  modalStatus.textContent = "Connecting...";

  try {
    const res = await fetch(CREATE_WEB_CALL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    const data = await res.json();
    await retellClient.startCall({ accessToken: data.access_token });
  } catch (err) {
    console.error("Failed to start voice call:", err);
    modalStatus.textContent = "Connection failed";
    setTimeout(hideModal, 2000);
  }
}

async function endVoiceCall() {
  retellClient.stopCall();
}

// ── Retell SDK events ──
retellClient.on("call_started", () => {
  callActive = true;
  modalStatus.textContent = "Speaking with Alex";
  startTimer();
});

retellClient.on("call_ended", () => {
  callActive = false;
  modalStatus.textContent = "Call ended";
  modalAvatar.classList.remove("speaking");
  stopTimer();
  setTimeout(hideModal, 1500);
});

retellClient.on("agent_start_talking", () => {
  modalAvatar.classList.add("speaking");
});

retellClient.on("agent_stop_talking", () => {
  modalAvatar.classList.remove("speaking");
});

retellClient.on("error", (e) => {
  console.error("Retell error:", e);
  callActive = false;
  modalStatus.textContent = "Something went wrong";
  stopTimer();
  setTimeout(hideModal, 2000);
});

// ── Button wiring ──
hangupBtn.addEventListener("click", endVoiceCall);

// Close modal on backdrop click
modal.addEventListener("click", (e) => {
  if (e.target === modal && !callActive) hideModal();
});

// ── Gemini Chat Backend ──
const CHAT_API_URL = "/api/chat";
let chatHistory = [];

// ── Assistant Popup ──
const fab = document.getElementById("assistant-fab");
const popup = document.getElementById("assistant-popup");
const apClose = document.getElementById("ap-close");
const apChatBtn = document.getElementById("ap-chat-btn");
const apTalkBtn = document.getElementById("ap-talk-btn");
const apInput = document.getElementById("ap-input");
const apSendBtn = document.getElementById("ap-send-btn");
const apMessages = document.getElementById("ap-messages");

function togglePopup() {
  popup.classList.toggle("open");
  if (popup.classList.contains("open")) {
    setTimeout(() => apInput.focus(), 300);
  }
}

function closePopup() {
  popup.classList.remove("open");
}

fab.addEventListener("click", togglePopup);
apClose.addEventListener("click", closePopup);

apChatBtn.addEventListener("click", () => {
  apChatBtn.classList.add("ap-option-active");
  apTalkBtn.classList.remove("ap-option-active");
  apInput.focus();
});

apTalkBtn.addEventListener("click", () => {
  apTalkBtn.classList.add("ap-option-active");
  apChatBtn.classList.remove("ap-option-active");
  closePopup();
  startVoiceCall();
});

function addMessage(sender, text) {
  const div = document.createElement("div");
  div.className = `chat-message ${sender}`;
  const p = document.createElement("p");
  p.textContent = text;
  div.appendChild(p);
  apMessages.appendChild(div);
  const body = popup.querySelector(".ap-body");
  if (body) body.scrollTop = body.scrollHeight;
}

function showTypingIndicator() {
  if (apMessages.querySelector(".typing-indicator")) return;
  const div = document.createElement("div");
  div.className = "typing-indicator";
  div.innerHTML = "<span></span><span></span><span></span>";
  apMessages.appendChild(div);
  const body = popup.querySelector(".ap-body");
  if (body) body.scrollTop = body.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = apMessages.querySelector(".typing-indicator");
  if (indicator) indicator.remove();
}

async function sendMessage() {
  const msg = apInput.value.trim();
  if (!msg) return;

  apInput.value = "";
  addMessage("user", msg);
  showTypingIndicator();

  chatHistory.push({ role: "user", text: msg });

  try {
    const res = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, history: chatHistory.slice(0, -1) }),
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    const data = await res.json();
    removeTypingIndicator();
    addMessage("alex", data.reply);
    chatHistory.push({ role: "assistant", text: data.reply });
  } catch (err) {
    console.error("Chat error:", err);
    removeTypingIndicator();
    addMessage("alex", "Sorry, something went wrong. Please try again!");
  }
}

apSendBtn.addEventListener("click", sendMessage);
apInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

document.querySelectorAll(".ap-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    apInput.value = chip.dataset.q;
    sendMessage();
  });
});

// Expose to onclick attributes
window.startVoiceCall = startVoiceCall;
