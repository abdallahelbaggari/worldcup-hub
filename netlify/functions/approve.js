exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    console.log("Approve:", data);

    return {
      statusCode: 200,
      body: JSON.stringify({ approved: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Approval failed" })
    };
  }
};
