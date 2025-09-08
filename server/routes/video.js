import express from "express";
import { getallvideo, uploadvideo, downloadVideo, getDownloadedVideos, getVideoById } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";
import { authenticate } from "../middleware/auth.js";

const routes = express.Router();

routes.post("/upload", authenticate, upload.single("file"), uploadvideo);
routes.get("/getall", getallvideo);
routes.get("/download/:id", downloadVideo); // Download video by id
routes.get("/downloads/user", authenticate, getDownloadedVideos); // Get user's downloaded videos
routes.get("/info/:id", getVideoById); // Get video info by id
export default routes;
