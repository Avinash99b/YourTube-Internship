import express from "express";
import axios from "axios"
const router = express.Router()
router.post("/", async (req, res) => {
    const {text} = req.body;
    if (!text) {
        return res.status(400).json({error: "Text is required"});
    }

    try {
        const url = `https://translation.googleapis.com/language/translate/v2`;

        const response = await axios.post(
            url,
            {
                q: text,
                target: "en", // target language English
            },
            {
                params: {key: process.env.GOOGLE_API_KEY},
                headers: {"Content-Type": "application/json"},
            }
        );

        const translatedText = response.data.data.translations[0].translatedText;

        return res.json({translatedText});
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({error: "Translation failed"});
    }
});

export default router;