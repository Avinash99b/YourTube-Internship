import express from "express";
import axios from "axios"
import translate from "../controllers/translator.js";
const router = express.Router()
router.post("/", async (req, res) => {
    const {text,targetLanguage} = req.body

    try {
        const translation = await translate(text,targetLanguage)
        res.status(200).json({translation})
    }catch (e){
        res.status(500).json({message:"Internal Server Error"})
    }
});

export default router;