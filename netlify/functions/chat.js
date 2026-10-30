exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "POST only" };
  if (process.env.APP_SECRET && event.headers["x-app-secret"] !== process.env.APP_SECRET) {
    return { statusCode: 401, body: "Unauthorized" };
  }
  try {
    const { messages = [] } = JSON.parse(event.body || "{}");
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "Tum SparkBot ho, Bunty ke personal business assistant. Hinglish me casual, short aur practical jawab do." },
          ...messages.slice(-20),
        ],
      }),
    });
    const d = await r.json();
    if (!r.ok) return { statusCode: 500, body: JSON.stringify(d) };
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: d.choices[0].message.content }),
    };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};
