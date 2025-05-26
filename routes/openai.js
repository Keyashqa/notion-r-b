const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Initialize Google AI with API key
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

router.post("/chat", protect, async (req, res) => {

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `${prompt}`,
        temperature: 0.5,
    });
    console.log(response.text);
    res.status(200).json({ message: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
