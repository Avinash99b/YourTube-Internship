"use strict";
import multer from "multer";
import path from "path";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname,"../", "uploads"); // absolute
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, "_");
        cb(null, Date.now() + "-" + safeName);
    },
});

const filefilter = (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({ storage: storage, fileFilter: filefilter });
export default upload;
