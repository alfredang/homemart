module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "";

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("n8n webhook error:", response.status, text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.json({ access_token: data.access_token });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Failed to create web call" });
  }
};
