import mongoose from "mongoose";

const comment_reaction_schema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        comment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment",
            required: true,
        },
        reactionIsLike: {type: Boolean, default: false},
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("comment_reaction", comment_reaction_schema);
