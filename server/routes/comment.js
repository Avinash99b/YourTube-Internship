import express from "express";
import {
    deletecomment,
    getallcomment,
    postcomment,
    editcomment,
    reactToComment,
    fetchReaction, deleteReaction
} from "../controllers/comment.js";
import { authenticate } from "../middleware/auth.js";


const routes = express.Router();
routes.get("/:videoid", getallcomment);
routes.post("/postcomment", authenticate, postcomment);
routes.delete("/deletecomment/:id", authenticate, deletecomment);
routes.post("/editcomment/:id", authenticate, editcomment);
routes.post('/react/:id/:userId', authenticate, reactToComment)
routes.get("/reaction/:comment_id/:userId", fetchReaction)
routes.delete("/reaction/:comment_id/:userId", authenticate, deleteReaction)
export default routes;
