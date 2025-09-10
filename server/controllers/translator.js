import axios from "axios";
import "dotenv/config.js"
async function translate(text, targetLanguage = "en") {
    if (!text) throw new Error("Text is required");
    if (!targetLanguage) throw new Error("Target language is required");

    try {
        const url = "https://deep-translate1.p.rapidapi.com/language/translate/v2";

        const response = await axios.post(
            url,
            {
                q: text,
                source: "auto",        // Auto-detect source language
                target: targetLanguage // Target language dynamically
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-rapidapi-host": "deep-translate1.p.rapidapi.com",
                    "x-rapidapi-key": process.env.RAPIDAPI_KEY // Set in .env
                },
            }
        );

        // Return translated text
        return response.data?.data.translations?.translatedText;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw new Error("Translation failed");
    }
}

export default translate;