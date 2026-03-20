// ✅ ENABLE SANDBOX (VERY IMPORTANT)
Pi.init({ version: "2.0", sandbox: true });

// Backend path
const backendURL = "/.netlify/functions";

const loginBtn = document.getElementById("loginBtn");
const dashboard = document.getElementById("dashboard");
const username = document.getElementById("username");
const statusBox = document.getElementById("status");

let points = 0;

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

// LOGIN (WITH PAYMENTS PERMISSION)
loginBtn.addEventListener("click", async () => {
  try {
    const scopes = ["username", "payments"]; // ✅ FIXED
    const auth = await Pi.authenticate(scopes);

    username.innerText = auth.user.username;

    dashboard.style.display = "block";
    loginBtn.style.display = "none";
    statusBox.innerText = "Logged in";

  } catch (error) {
    statusBox.innerText = "Login failed";
  }
});

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", () => {
  dashboard.style.display = "none";
  loginBtn.style.display = "block";
  statusBox.innerText = "Logged out";
});

// PREDICTION
function predict(team) {
  document.getElementById("result").innerText = "You chose: " + team;
  points += 5;
  document.getElementById("leaderboard").innerHTML =
    "<li>You - " + points + " pts</li>";
}

// COMMENTS
function addComment() {
  const input = document.getElementById("commentInput");
  if (!input.value.trim()) return;

  const li = document.createElement("li");
  li.innerText = input.value;

  document.getElementById("comments").prepend(li);
  input.value = "";
}

// ✅ PAYMENT (FULLY FIXED)
document.getElementById("premiumBtn").addEventListener("click", () => {

  Pi.createPayment(
    {
      amount: 0.5,
      memo: "Premium Access",
      metadata: { type: "premium" }
    },
    {
      onReadyForServerApproval: paymentId => {
        fetch(`${backendURL}/approve`, {   // ✅ FIXED syntax
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId })
        });
      },

      onReadyForServerCompletion: (paymentId, txid) => {  // ✅ FIXED
        fetch(`${backendURL}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid })
        });

        alert("Premium unlocked!");
      },

      onCancel: () => alert("Payment cancelled"),
      onError: err => alert("Error: " + err)
    }
  );

});
