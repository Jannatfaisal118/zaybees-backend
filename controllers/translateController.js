// server.js or translateController.js
import express from "express";
import axios from "axios";
const app = express();
app.use(express.json());

app.post("/api/translate", async (req, res) => {
  const { text, targetLang } = req.body;

  try {
    // Example using Google Translate API
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
    res.status(500).json({ translatedText: text }); // fallback to original
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
