const axios = require("axios");

exports.handler = async (event) => {
  try {
    const { paymentId } = JSON.parse(event.body);

    console.log("Approving payment:", paymentId);

    const response = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {},
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
    console.error("Approve error:", error.response?.data || error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Approval failed" })
    };
  }
};
