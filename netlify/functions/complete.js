const axios = require("axios");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { paymentId, txid } = JSON.parse(event.body || "{}");

    if (!paymentId || !txid) {
      return { statusCode: 400, body: "Missing paymentId or txid" };
    }

    const API_KEY = process.env.PI_API_KEY;
    const YOUR_WALLET = process.env.PI_MAINNET_WALLET;

    const EXPECTED_AMOUNT = 1;
    const EXPECTED_MEMO = "worldcup_hub_payment_v1";

    // 🔍 Verify payment again (CRITICAL)
    const verifyRes = await axios.get(
      `https://api.minepi.com/v2/payments/${paymentId}`,
      {
        headers: { Authorization: `Key ${API_KEY}` }
      }
    );

    const payment = verifyRes.data;

    // 🔒 Strong validation
    if (
      payment.status !== "APPROVED" ||
      payment.amount !== EXPECTED_AMOUNT ||
      payment.to_address !== YOUR_WALLET ||
      payment.memo !== EXPECTED_MEMO ||
      !payment.transaction ||
      payment.transaction.txid !== txid
    ) {
      return { statusCode: 400, body: "Verification failed" };
    }

    // ✅ Complete payment
    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      { txid },
      {
        headers: {
          Authorization: `Key ${API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };

  } catch (error) {
    console.error("Complete error:", error.response?.data || error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Completion failed" })
    };
  }
};
