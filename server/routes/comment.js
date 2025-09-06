import express from "express";
import {
    deletecomment,
    getallcomment,
    postcomment,
    editcomment,
    reactToComment,
    fetchReaction, deleteReaction
} from "../controllers/comment.js";


const routes = express.Router();
routes.get("/:videoid", getallcomment);
routes.post("/postcomment", postcomment);
routes.delete("/deletecomment/:id", deletecomment);
routes.post("/editcomment/:id", editcomment);
routes.post('/react/:id/:userId',reactToComment)
routes.get("/reaction/:comment_id/:userId", fetchReaction)
routes.delete("/reaction/:comment_id/:userId", deleteReaction)
export default routes;
