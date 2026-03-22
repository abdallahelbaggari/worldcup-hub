// 💰 PAYMENT (FIXED — DO NOT CHANGE ANYTHING ELSE)
premiumBtn.addEventListener("click", () => {

  statusBox.innerText = translations[currentLang].processing;

  Pi.createPayment(
    {
      amount: 0.5,
      memo: "WorldCup Premium",
      metadata: { type: "premium" }
    },
    {
      // ✅ MUST RETURN
      onReadyForServerApproval: (paymentId) => {
        return fetch("/.netlify/functions/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId })
        });
      },

      // ✅ MUST RETURN
      onReadyForServerCompletion: (paymentId, txid) => {
        return fetch("/.netlify/functions/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid })
        }).then(() => {
          statusBox.innerText = translations[currentLang].success;

          addTransaction("💰 Paid 0.5π — Premium");
        });
      },

      onCancel: () => {
        statusBox.innerText = "Payment cancelled";
      },

      onError: (err) => {
        statusBox.innerText = "Error: " + err;
        console.error(err);
      }
    }
  );

});
