module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("POST only");
  if (process.env.APP_SECRET && req.headers["x-app-secret"] !== process.env.APP_SECRET) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const { messages = [] } = req.body || {};
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
    if (!r.ok) return res.status(500).json(d);
    return res.status(200).json({ reply: d.choices[0].message.content });
  } catch (e) {
    return res.status(500).send(String(e));
  }
};
