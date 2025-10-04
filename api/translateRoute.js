import express from "express";
import axios from "axios";
const translateRouter= express.Router();

translateRouter.post("/", async (req, res) => {
  const { text, targetLang } = req.body;

  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2`,
      {},
      {
        params: {
          q: text,
          target: targetLang,
          key: process.env.GOOGLE_API_KEY
        }
      }
    );

    const translatedText = response.data.data.translations[0].translatedText;
    res.json({ translatedText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ translatedText: text }); // fallback to English
  }
});

export default translateRouter;
