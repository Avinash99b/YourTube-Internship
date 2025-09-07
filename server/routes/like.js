import express from "express";
import { handlelike, getallLikedVideo } from "../controllers/like.js";
import { authenticate } from "../middleware/auth.js";

const routes = express.Router();
routes.get("/:userId", authenticate, getallLikedVideo);
routes.post("/:videoId", authenticate, handlelike);
export default routes;
