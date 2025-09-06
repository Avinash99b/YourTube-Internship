import axios from "axios";

async function translate(text, targetLanguage = "en") {
    if (!text) {
        throw Error("text is required");
    }

    if (!targetLanguage) {
        throw Error("targetLanguage is required");
    }

    try {
        const url = `https://translation.googleapis.com/language/translate/v2`;

        const response = await axios.post(
            url,
            {
                q: text,
                target: targetLanguage, // dynamically set target language
            },
            {
                params: { key: process.env.GOOGLE_API_KEY },
                headers: { "Content-Type": "application/json" },
            }
        );

        return response.data.data.translations[0].translatedText;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw Error("Something went wrong");
    }
}


export default translate;