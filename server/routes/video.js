import express from "express";
import { getallvideo, uploadvideo, downloadVideo, getDownloadedVideos, getVideoById, getChannelVideos, deleteChannelVideo } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";
import { authenticate } from "../middleware/auth.js";

const routes = express.Router();

routes.post("/upload", authenticate, upload.single("file"), uploadvideo);
routes.get("/getall", getallvideo);
routes.get("/download/:id", downloadVideo); // Download video by id
routes.get("/downloads/user", authenticate, getDownloadedVideos); // Get user's downloaded videos
routes.get("/info/:id", getVideoById); // Get video info by id
routes.get("/channel/:channelname/videos", getChannelVideos); // Get all videos for a channel
routes.delete("/channel/:channelname/video/:videoId", authenticate, deleteChannelVideo); // Delete a video from a channel
export default routes;
