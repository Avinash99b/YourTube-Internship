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
import {stat,createReadStream} from "fs"



dotenv.config();
const app = express();
import path from "path";
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
// Add CORS headers for static video file responses
app.get("/uploads/:file", (req, res) => {
    const filePath = path.join("uploads", req.params.file);

    stat(filePath, (err, stats) => {
        if (err) {
            res.sendStatus(404);
            return;
        }

        const range = req.headers.range;
        if (!range) {
            // No range → send entire file
            res.writeHead(200, {
                "Content-Length": stats.size,
                "Content-Type": "video/mp4",
            });
            fs.createReadStream(filePath).pipe(res);
            return;
        }

        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunkSize = end - start + 1;

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${stats.size}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "video/mp4",
        });

        createReadStream(filePath, { start, end }).pipe(res);
    });
});
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
