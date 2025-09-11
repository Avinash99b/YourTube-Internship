import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import translateRoute from "./routes/translate.js";
import paymentroutes from "./routes/payment.js";
import fs from "fs";
import users from "./Modals/Auth.js"

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
import path from "path";
import {authenticate} from "./middleware/auth.js";
import {getWatchTime} from "./controllers/auth.js";
import {PLAN_DETAILS} from "./controllers/payment.js";
app.use(cors());
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods","GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers","Content-Type");
    next();
})

app.get("/uploads/:filename", authenticate,async (req, res) => {
    //Check if time still left for watch to user
    const user = await users.findById(req.user.id)
    const userWatchTime = await getWatchTime(user._id)
    if(PLAN_DETAILS[user.plan].watchLimit!=null && (userWatchTime/60) >=PLAN_DETAILS[user.plan].watchLimit){
        return res.status(403).send("Limit Exceeded.")
    }
    try {
        const filePath = path.join(__dirname, "uploads", req.params.filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).send("File not found");
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            const file = fs.createReadStream(filePath, {start, end});
            const head = {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": "video/mp4",
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                "Content-Length": fileSize,
                "Content-Type": "video/mp4",
            };
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (err) {
        console.error("Video streaming error:", err);
        res.status(500).send("Error streaming video");
    }
});


app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.get("/", (req, res) => {
  res.send("You tube backend is working");
});



app.use(bodyParser.json());
app.use("/auth", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/translate", translateRoute);
app.use("/payment", paymentroutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

const DBURL = process.env.DB_URL;
mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((error) => {
    console.log(error);
  });
