// ✅ Initialize Pi SDK
Pi.init({ version: "2.0", sandbox: true });

// ---------------- ELEMENTS ----------------
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const premiumBtn = document.getElementById("premiumBtn");
const statusBox = document.getElementById("status");
const dashboard = document.getElementById("dashboard");
const usernameDisplay = document.getElementById("username");

const txList = document.getElementById("txList");
const clearTxBtn = document.getElementById("clearTxBtn");
const languageSwitcher = document.getElementById("languageSwitcher");

const adBox = document.getElementById("adBox");

// ---------------- STATE ----------------
let points = 0;
let lastAction = 0;

let transactions = JSON.parse(localStorage.getItem("txHistory")) || [];
let leaderboardData = JSON.parse(localStorage.getItem("leaderboard")) || [];

// ---------------- LANGUAGE ----------------
const translations = {
  en: { login: "Login with Pi", logout: "Logout" },
  ar: { login: "تسجيل الدخول", logout: "تسجيل الخروج" },
  fr: { login: "Se connecter", logout: "Se déconnecter" }
};

let currentLang = localStorage.getItem("lang") || "en";

function applyLanguage(lang) {
  const t = translations[lang];

  loginBtn.innerText = "🔐 " + t.login;
  logoutBtn.innerText = t.logout;

  document.body.style.direction = lang === "ar" ? "rtl" : "ltr";

  localStorage.setItem("lang", lang);
}

applyLanguage(currentLang);

languageSwitcher.addEventListener("change", (e) => {
  currentLang = e.target.value;
  applyLanguage(currentLang);
});

// ---------------- ADS ----------------
const ads = [
  "🔥 Discover new Pi apps",
  "🚀 Grow your Pi earnings",
  "💰 Promote your business with Pi"
];

function loadAd() {
  const random = ads[Math.floor(Math.random() * ads.length)];
  adBox.innerText = random;
}
loadAd();

// ---------------- ANTI SPAM ----------------
function canAct() {
  const now = Date.now();
  if (now - lastAction < 1500) return false;
  lastAction = now;
  return true;
}

// ---------------- TRANSACTIONS ----------------
function renderTransactions() {
  txList.innerHTML = "";

  if (transactions.length === 0) {
    txList.innerHTML = "<li>No transactions yet</li>";
    return;
  }

  transactions.forEach(tx => {
    const li = document.createElement("li");
    li.innerText = tx;
    txList.appendChild(li);
  });
}

function addTransaction(text) {
  const record = `${text} (${new Date().toLocaleString()})`;
  transactions.unshift(record);

  localStorage.setItem("txHistory", JSON.stringify(transactions));
  renderTransactions();
}

clearTxBtn.addEventListener("click", () => {
  transactions = [];
  localStorage.removeItem("txHistory");
  renderTransactions();
});

renderTransactions();

// ---------------- MATCHES ----------------
const matches = [
  "Argentina vs Brazil - March 20",
  "France vs Germany - March 21",
  "Nigeria vs Ghana - March 22"
];

const matchList = document.getElementById("matches");
matches.forEach(m => {
  const li = document.createElement("li");
  li.innerText = m;
  matchList.appendChild(li);
});

// ---------------- LOGIN ----------------
loginBtn.addEventListener("click", async () => {
  try {
    statusBox.innerText = "Opening Pi authentication...";

    const auth = await Pi.authenticate(["username", "payments"]);

    usernameDisplay.innerText = auth.user.username;

    dashboard.style.display = "block";
    loginBtn.style.display = "none";

    statusBox.innerText = `Logged in as: ${auth.user.username}`;

  } catch (err) {
    statusBox.innerText = "Authentication failed";
  }
});

// ---------------- LOGOUT ----------------
logoutBtn.addEventListener("click", () => {
  dashboard.style.display = "none";
  loginBtn.style.display = "block";
  statusBox.innerText = "Logged out";
});

// ---------------- LEADERBOARD ----------------
function updateLeaderboard() {
  const user = usernameDisplay.innerText;

  const existing = leaderboardData.find(u => u.name === user);

  if (existing) {
    existing.points = points;
  } else {
    leaderboardData.push({ name: user, points });
  }

  leaderboardData.sort((a, b) => b.points - a.points);

  localStorage.setItem("leaderboard", JSON.stringify(leaderboardData));

  const list = document.getElementById("leaderboard");
  list.innerHTML = "";

  leaderboardData.slice(0, 5).forEach(u => {
    const li = document.createElement("li");
    li.innerText = `${u.name} - ${u.points} pts`;
    list.appendChild(li);
  });
}

// ---------------- PREDICTION ----------------
function predict(team) {
  if (!canAct()) return;

  document.getElementById("result").innerText = `You chose: ${team}`;

  points += 5;

  updateLeaderboard();

  addTransaction(`🎯 Prediction: ${team}`);
}

// ---------------- STAKING ----------------
document.getElementById("stakeBtn").addEventListener("click", () => {
  if (!canAct()) return;

  const stake = parseInt(document.getElementById("stakeAmount").value);

  if (!stake || stake <= 0) return alert("Enter valid points");
  if (stake > points) return alert("Not enough points");

  const reward = Math.floor(Math.random() * 10);

  points = points - stake + reward;

  updateLeaderboard();

  document.getElementById("stakeStatus").innerText =
    `You earned +${reward} pts`;

  addTransaction(`📈 Staked ${stake} pts → +${reward}`);
});

// ---------------- DAILY REWARD ----------------
document.getElementById("dailyBtn").addEventListener("click", () => {
  const today = new Date().toDateString();
  const lastClaim = localStorage.getItem("lastClaim");

  if (lastClaim === today) return alert("Already claimed today");

  points += 10;
  localStorage.setItem("lastClaim", today);

  updateLeaderboard();
  addTransaction("🎁 Daily reward +10 pts");
});

// ---------------- COMMENTS ----------------
function addComment() {
  const input = document.getElementById("commentInput");

  if (!input.value.trim()) return;

  const li = document.createElement("li");
  li.innerText = input.value;

  document.getElementById("comments").prepend(li);

  addTransaction("💬 Comment posted");

  input.value = "";
}

// ---------------- PREMIUM STATUS ----------------
if (localStorage.getItem("isPremium") === "true") {
  premiumBtn.innerText = "✅ Premium Active";
  premiumBtn.disabled = true;
}

// ---------------- PAYMENT (UNCHANGED ✅) ----------------
premiumBtn.addEventListener("click", () => {

  statusBox.innerText = "Processing payment...";

  Pi.createPayment(
    {
      amount: 0.5,
      memo: "WorldCup Premium",
      metadata: { type: "premium" }
    },
    {
      onReadyForServerApproval: (paymentId) => {
        return fetch("/.netlify/functions/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId })
        });
      },

      onReadyForServerCompletion: (paymentId, txid) => {
        return fetch("/.netlify/functions/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid })
        }).then(() => {

          statusBox.innerText = "✅ Premium Unlocked!";

          localStorage.setItem("isPremium", "true");

          premiumBtn.innerText = "✅ Premium Active";
          premiumBtn.disabled = true;

          addTransaction("💰 Paid 0.5π — Premium");
        });
      },

      onCancel: () => {
        statusBox.innerText = "Payment cancelled";
      },

      onError: (err) => {
        statusBox.innerText = "Payment error: " + err;
      }
    }
  );

});
