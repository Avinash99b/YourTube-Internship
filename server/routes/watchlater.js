import express from "express";
import {
  getallwatchlater,
  handlewatchlater,
  getWatchLaterStatus,
  removeFromWatchLater,
} from "../controllers/watchlater.js";
import { authenticate } from "../middleware/auth.js";

const routes = express.Router();
routes.get("/:userId", authenticate, getallwatchlater);
routes.post("/:videoId", authenticate, handlewatchlater);
routes.get("/status/:videoId", authenticate, getWatchLaterStatus);
routes.delete("/:videoId", authenticate, removeFromWatchLater);
export default routes;
