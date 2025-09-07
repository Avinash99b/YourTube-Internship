import video from "../Modals/video.js";
import users from "../Modals/Auth.js";
import path from "path";
import fs from "fs";

export const uploadvideo = async (req, res) => {
  if (req.file === undefined) {
    return res
      .status(404)
      .json({ message: "plz upload a mp4 video file only" });
  } else {
    try {
      const file = new video({
        videotitle: req.body.videotitle,
        filename: req.file.originalname,
        filepath: req.file.path,
        filetype: req.file.mimetype,
        filesize: req.file.size,
        videochanel: req.body.videochanel,
        uploader: req.body.uploader,
        description: req.body.description || undefined,
      });
      await file.save();
      return res.status(201).json("file uploaded successfully");
    } catch (error) {
      console.error(" error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
};
export const getallvideo = async (req, res) => {
  try {
    const files = await video.find();
    return res.status(200).send(files);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const downloadVideo = async (req, res) => {
  try {
    const userId = req.query.userId;
    const videoId = req.params.id;
    if (!userId) return res.status(400).json({ message: "User ID required" });
    const user = await users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const downloadsToday = user.downloads.filter((d) => {
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === today.getTime();
    });
    if (user.plan === "free" && downloadsToday.length >= 1) {
      return res.status(403).json({
        message:
          "Free users can only download one video per day. Upgrade to premium for unlimited downloads.",
      });
    }
    // Check if video exists
    const vid = await video.findById(videoId);
    if (!vid) return res.status(404).json({ message: "Video not found" });
    // Record download
    user.downloads.push({ videoId });
    if (!user.downloadedVideos.includes(videoId)) {
      user.downloadedVideos.push(videoId);
    }
    await user.save();
    // Serve file with streaming and range support
    const filePath = path.resolve(vid.filepath);
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      if (start >= fileSize || end >= fileSize) {
        res.status(416).send('Requested range not satisfiable');
        return;
      }
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="${vid.filename}"`
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="${vid.filename}"`
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error downloading video" });
  }
};

export const getDownloadedVideos = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: "User ID required" });
    const user = await users.findById(userId).populate("downloadedVideos");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ downloadedVideos: user.downloadedVideos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching downloaded videos" });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const vid = await video.findById(id);
    if (!vid) {
      return res.status(404).json({ message: "Video not found" });
    }
    return res.status(200).json(vid);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching video info" });
  }
};
