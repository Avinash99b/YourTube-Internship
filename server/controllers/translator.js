import axios from "axios";

async function translate(text) {
    if (!text) {
        throw Error("text is required");
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

        return response.data.data.translations[0].translatedText;
    } catch (error) {
        console.error(error.response?.data || error.message);
        throw Error("Something went wrong");
    }
}

export default translate;