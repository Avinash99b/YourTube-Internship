import express from "express";
import {
  getallhistoryVideo,
  handlehistory,
  handleview,
  logWatchTime,
} from "../controllers/history.js";
import { authenticate } from "../middleware/auth.js";

const routes = express.Router();
routes.post("/log-watch", authenticate, logWatchTime);
routes.get("/:userId", authenticate, getallhistoryVideo);
routes.post("/views/:videoId", handleview);
routes.post("/:videoId", authenticate, handlehistory);
export default routes;
