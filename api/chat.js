module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const systemInstruction = `You are Alex, a friendly and knowledgeable AI shopping assistant for HomeMart, a household products retailer. You help customers find the right products, compare options, and make purchase decisions.

PRODUCT CATALOG:
1. Dyson Vacuum Cleaner V11 - $499 - Cordless high-power vacuum cleaner with advanced filtration
2. Philips Air Fryer Essential - $89 - Healthy air fryer that uses rapid air technology for low oil cooking
3. Panasonic Microwave Oven NN-ST34 - $120 - Compact microwave oven with multiple cooking modes
4. LG Smart Washing Machine 7kg - $650 - Energy efficient front load washing machine with smart features
5. Samsung Robot Vacuum VR5000 - $320 - Automatic robot vacuum cleaner with smart navigation
6. Tefal Non-Stick Frying Pan 28cm - $45 - Durable frying pan with titanium non-stick coating
7. Sharp Air Purifier FP-J30E - $210 - Removes dust and allergens using Plasmacluster technology
8. Xiaomi Electric Kettle Smart Pro - $60 - Temperature controlled smart kettle with mobile app support
9. Black+Decker Steam Iron BXIR2400 - $55 - Powerful steam iron with anti-drip and self-clean function
10. Bosch Hand Mixer MFQ4080 - $180 - Multi-speed hand mixer with whisk and dough hook attachments
11. Brita Water Filter Pitcher Marella - $35 - Water filtration jug that reduces chlorine and impurities
12. Zojirushi Rice Cooker NS-TSC10 - $150 - Automatic rice cooker with fuzzy logic cooking control
13. KitchenAid Stand Mixer Artisan - $420 - Professional stand mixer with multiple attachment options
14. Hamilton Beach Blender Power Elite - $70 - High-performance blender for smoothies and food processing
15. Nestle Instant Coffee Gold Blend - $12 - Premium instant coffee with rich aroma and smooth taste
16. Colgate Total Toothpaste 150g - $4 - Fluoride toothpaste for complete oral protection
17. Dettol Antibacterial Hand Wash - $6 - Kills 99.9% of germs and provides long-lasting hygiene
18. Scotch-Brite Scrub Sponge Pack - $3 - Multi-purpose scrub sponges for kitchen cleaning
19. Pledge Furniture Polish Spray - $7 - Cleans and protects wooden furniture surfaces
20. Glad Trash Bags 30L - $10 - Durable garbage bags with leak protection for household waste

GUIDELINES:
- Be warm, conversational, and helpful
- When customers ask about products, provide details from the catalog above
- Help compare products when asked
- Suggest products based on customer needs and budget
- Keep responses concise (2-3 sentences max)
- If asked about products not in the catalog, politely let them know and suggest similar items from the catalog`;

  const contents = [];
  if (history && Array.isArray(history)) {
    for (const entry of history) {
      contents.push({
        role: entry.role === "user" ? "user" : "model",
        parts: [{ text: entry.text }],
      });
    }
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Gemini API error:", response.status, text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response. Please try again.";

    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Failed to get response" });
  }
};
