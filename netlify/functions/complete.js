const axios = require("axios");

exports.handler = async (event) => {
  try {
    const { paymentId, txid } = JSON.parse(event.body);

    console.log("Completing payment:", paymentId, txid);

    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      { txid },
      {
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`
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
