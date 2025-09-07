import mongoose from "mongoose";

const userschema = mongoose.Schema({
    email: {type: String, required: true},
    name: {type: String},
    channelname: {type: String},
    description: {type: String},
    image: {type: String},
    joinedon: {type: Date, default: Date.now},
    plan: {type: String, enum: ["free", "bronze", "silver", "gold"], default: "free"},
    planExpiry: {type: Date},
    downloads: [
        {
            videoId: {type: mongoose.Schema.Types.ObjectId, ref: "videofiles"},
            date: {type: Date, default: Date.now}
        }
    ],
    downloadedVideos: [{type: mongoose.Schema.Types.ObjectId, ref: "videofiles"}],
    state: {type: String},
    otp: {type: String},
    verificationId:{type:String},
    mobile: {type: String},
    otpChannel: {type: String, enum: ["email", "mobile"], default: "email"},
    otpVerified: {type: Boolean, default: false},
});

export default mongoose.model("user", userschema);
