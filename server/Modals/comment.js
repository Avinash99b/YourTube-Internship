import mongoose from "mongoose";
const commentschema = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    commentbody: { type: String },
    usercommented: { type: String },
    commentedon: { type: Date, default: Date.now },
      like_count:{type:Number,default: 0},
      dislike_count:{type:Number,default: 0},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("comment", commentschema);
