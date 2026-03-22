// ✅ Pi Init
Pi.init({ version: "2.0", sandbox: true });

const loginBtn = document.getElementById("loginBtn");
const dashboard = document.getElementById("dashboard");
const username = document.getElementById("username");
const statusBox = document.getElementById("status");
const premiumBtn = document.getElementById("premiumBtn");
const languageSwitcher = document.getElementById("languageSwitcher");
const txList = document.getElementById("txList");

let points = 0;

// 🧠 LOAD SAVED TRANSACTIONS
let transactions = JSON.parse(localStorage.getItem("txHistory")) || [];

// 🧾 DISPLAY TRANSACTIONS
function renderTransactions() {
  txList.innerHTML = "";
  transactions.forEach(tx => {
    const li = document.createElement("li");
    li.innerText = tx;
    txList.prepend(li);
  });
}

// ➕ ADD TRANSACTION
function addTransaction(text) {
  const record = text + " (" + new Date().toLocaleString() + ")";
  transactions.unshift(record);

  localStorage.setItem("txHistory", JSON.stringify(transactions));
  renderTransactions();
}

// CLEAR HISTORY
document.getElementById("clearTxBtn").addEventListener("click", () => {
  transactions = [];
  localStorage.removeItem("txHistory");
  renderTransactions();
});

// INITIAL LOAD
renderTransactions();


// 🌍 LANGUAGE SYSTEM (same as yours)
const translations = {
  en: {
    statusLogin: "Logging in...",
    statusLogout: "Logged out",
    processing: "Processing payment...",
    success: "✅ Premium Unlocked!"
  },
  ar: {
    statusLogin: "جاري تسجيل الدخول...",
    statusLogout: "تم تسجيل الخروج",
    processing: "جاري الدفع...",
    success: "✅ تم تفعيل المميز!"
  },
  fr: {
    statusLogin: "Connexion...",
    statusLogout: "Déconnecté",
    processing: "Paiement en cours...",
    success: "✅ Premium activé !"
  }
};

let currentLang = localStorage.getItem("lang") || "en";

languageSwitcher.value = currentLang;

languageSwitcher.addEventListener("change", (e) => {
  currentLang = e.target.value;
  localStorage.setItem("lang", currentLang);

  if (currentLang === "ar") {
    document.body.style.direction = "rtl";
  } else {
    document.body.style.direction = "ltr";
  }
});

// MATCH DATA
const matches = [
  "Argentina vs Brazil - March 20",
  "France vs Germany - March 21",
  "Nigeria vs Ghana - March 22"
];

// LOAD MATCHES
const matchList = document.getElementById("matches");
matches.forEach(m => {
  const li = document.createElement("li");
  li.innerText = m;
  matchList.appendChild(li);
});

// LOGIN
loginBtn.addEventListener("click", async () => {
  try {
    statusBox.innerText = translations[currentLang].statusLogin;

    const auth = await Pi.authenticate(["username", "payments"]);

    username.innerText = auth.user.username;

    dashboard.style.display = "block";
    loginBtn.style.display = "none";

    statusBox.innerText = "Welcome " + auth.user.username;

  } catch (err) {
    statusBox.innerText = "Login failed";
  }
});

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", () => {
  dashboard.style.display = "none";
  loginBtn.style.display = "block";
  statusBox.innerText = translations[currentLang].statusLogout;
});

// PREDICTION
function predict(team) {
  document.getElementById("result").innerText = "You chose: " + team;
  points += 5;

  document.getElementById("leaderboard").innerHTML =
    "<li>You - " + points + " pts</li>";

  addTransaction("🎯 Prediction: " + team);
}

// STAKING
document.getElementById("stakeBtn").addEventListener("click", () => {
  const stake = parseInt(document.getElementById("stakeAmount").value);

  if (!stake || stake <= 0) return alert("Invalid");
  if (stake > points) return alert("Not enough points");

  const reward = Math.floor(Math.random() * 10);

  points = points - stake + reward;

  document.getElementById("leaderboard").innerHTML =
    "<li>You - " + points + " pts</li>";

  document.getElementById("stakeStatus").innerText =
    "+" + reward + " pts";

  addTransaction("📈 Staked " + stake + " pts, earned " + reward);
});

// COMMENTS
function addComment() {
  const input = document.getElementById("commentInput");
  if (!input.value.trim()) return;

  const li = document.createElement("li");
  li.innerText = input.value;

  document.getElementById("comments").prepend(li);

  addTransaction("💬 Comment posted");
  input.value = "";
}


// 💰 PAYMENT (UNCHANGED CORE — ONLY ADDED HISTORY)
premiumBtn.addEventListener("click", () => {

  statusBox.innerText = translations[currentLang].processing;

  Pi.createPayment(
    {
      amount: 0.5,
      memo: "WorldCup Premium",
      metadata: { type: "premium" }
    },
    {
      onReadyForServerApproval: (paymentId) => {
        fetch("/.netlify/functions/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId })
        });
      },

      onReadyForServerCompletion: (paymentId, txid) => {
        fetch("/.netlify/functions/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid })
        }).then(() => {
          statusBox.innerText = translations[currentLang].success;

          // ✅ ADD TO HISTORY
          addTransaction("💰 Paid 0.5π — Premium");
        });
      },

      onCancel: () => {
        statusBox.innerText = "Payment cancelled";
      },

      onError: (err) => {
        statusBox.innerText = "Error: " + err;
      }
    }
  );

});
