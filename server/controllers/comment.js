import comment from "../Modals/comment.js";
import mongoose from "mongoose";
import translate from "./translator.js";
import comment_reaction from "../Modals/comment_reaction.js";

function hasSpecialChars(text) {
    // allow letters numbers punctuation . , ? ! ' " - ( ) and spaces
    // disallow strange symbols like <>{}[]$%^*~`@# etc
    const regex = /^[A-Za-z0-9\s.,?!'"\-()]+$/u;
    return !regex.test(text);
}

export const postcomment = async (req, res) => {
    const commentdata = req.body;
    if (hasSpecialChars(commentdata.commentbody)) {
        return res.status(400).json({message:"Content Shouldn't have special characters"})
    }
    // Accept location from client, fallback to 'Unknown' if not provided
    const location = commentdata.location || 'Unknown';
    const newComment = new comment({
        ...commentdata,
        location
    });
    try {
        await newComment.save();
        return res.status(200).json({comment: true});
    } catch (error) {
        console.error(" error:", error);
        return res.status(500).json({message: "Something went wrong"});
    }
};
export const getallcomment = async (req, res) => {
    const {videoid} = req.params;
    try {
        const commentvideo = await comment.find({videoid: videoid});
        return res.status(200).json(commentvideo);
    } catch (error) {
        console.error(" error:", error);
        return res.status(500).json({message: "Something went wrong"});
    }
};
export const deletecomment = async (req, res) => {
    const {id: _id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send("comment unavailable");
    }
    try {
        await comment.findByIdAndDelete(_id);
        return res.status(200).json({comment: true});
    } catch (error) {
        console.error(" error:", error);
        return res.status(500).json({message: "Something went wrong"});
    }
};

export const editcomment = async (req, res) => {
    const {id: _id} = req.params;
    const {commentbody} = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send("comment unavailable");
    }
    if (hasSpecialChars(commentbody)) {
        return res.status(400).json({message:"Content Shouldn't have special characters"})
    }
    try {
        const updatecomment = await comment.findByIdAndUpdate(_id, {
            $set: {commentbody: commentbody, translated_body: await translate(commentbody)},
        });
        res.status(200).json(updatecomment);
    } catch (error) {
        console.error(" error:", error);
        return res.status(500).json({message: "Something went wrong"});
    }
};

export const reactToComment = async (req, res) => {
    const DISLIKE_THRESHOLD = 2;

    const {id: _id, userId} = req.params;
    const {reactionIsLike} = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send("comment unavailable");
    }

    try {
        const prev = await comment_reaction.findOne({comment_id: _id, user_id: userId})
        if (prev && prev.reactionIsLike === reactionIsLike) {
            return res.status(400).json({message: "Already Reacted"})
        }
        const updatecomment = await comment_reaction.findOneAndUpdate(
            {comment_id: _id, user_id: userId}, // query by these two fields
            {reactionIsLike, comment_id: _id, user_id: userId}, // update or insert
            {upsert: true, new: true} // insert if not found, return the document
        );

        const updation = reactionIsLike ? {$inc: {like_count: 1}} : {$inc: {dislike_count: 1}}

        const result = await comment.findByIdAndUpdate(_id, updation,{new: true})
        if(result.dislike_count >= DISLIKE_THRESHOLD){
            await comment.findByIdAndDelete(_id)
            await comment_reaction.deleteMany({comment_id: _id})
        }
        res.status(200).json(updatecomment);
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({message: "Something went wrong"});
    }
};
export const deleteReaction = async (req, res) => {
    const {comment_id, userId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(comment_id)) {
        return res.status(404).send("Comment unavailable");
    }

    try {
        let result = await comment_reaction.findOneAndDelete({comment_id, user_id: userId});
        if (!result) {
            return res.status(404).json({message: "Reaction not found"});
        }

        if (result.reactionIsLike) {
            console.log("likes decrementing");
            result = await comment.findByIdAndUpdate(
                comment_id,
                {$inc: {like_count: -1}},
                {new: true}
            );
        } else {
            console.log("dislikes decrementing");
            result = await comment.findByIdAndUpdate(
                comment_id,
                {$inc: {dislike_count: -1}}, // fix here
                {new: true}
            );
        }

        return res.status(200).json({deleted: true});
    } catch (error) {
        console.error("error:", error);
        return res.status(500).json({message: "Something went wrong"});
    }
};


export const fetchReaction = async (req, res) => {
    const {comment_id, userId} = req.params
    if (mongoose.Types.ObjectId.isValid(comment_id)) {
        const reactions = await comment_reaction.find({user_id: userId, comment_id})
        return res.status(200).json(reactions[0]);
    }
    return res.status(404).json({message: `Comment Not Found ${comment_id}`})
}