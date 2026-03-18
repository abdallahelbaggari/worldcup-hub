exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    console.log("Complete:", data);

    return {
      statusCode: 200,
      body: JSON.stringify({ completed: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Completion failed" })
    };
  }
};
