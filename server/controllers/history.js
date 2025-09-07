import history from "../Modals/history.js";
import users from "../Modals/Auth.js";

// Log or update watch time for a user/video for today
export const logWatchTime = async (req, res) => {
  try {
    const { userId, videoId, watchTime } = req.body;
    if (!userId || !videoId || typeof watchTime !== "number") {
      return res.status(400).json({ message: "userId, videoId, and watchTime are required" });
    }
    // Find or create today's history record for this user/video
    const today = new Date();
    today.setHours(0,0,0,0);
    let record = await history.findOne({
      viewer: userId,
      videoid: videoId,
      createdAt: { $gte: today }
    });
    if (record) {
      record.watchTime += watchTime;
      await record.save();
    } else {
      record = await history.create({
        viewer: userId,
        videoid: videoId,
        watchTime,
      });
    }
    // Optionally, update user's total watch time (not required for quota)
    res.status(200).json({ message: "Watch time logged", watchTime: record.watchTime });
  } catch (error) {
      console.log(error)
    res.status(500).json({ message: "Error logging watch time" });
  }
};

// Get all history videos for a user
export const getallhistoryVideo = async (req, res) => {
  try {
    const { userId } = req.params;
    const historyList = await history.find({ viewer: userId }).populate("videoid");
    res.status(200).json(historyList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
};

// Add a video to history (or update timestamp)
export const handlehistory = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID required" });
    let record = await history.findOne({ viewer: userId, videoid: videoId });
    if (record) {
      record.likedon = new Date();
      await record.save();
    } else {
      record = await history.create({ viewer: userId, videoid: videoId });
    }
    res.status(200).json({ message: "History updated", record });
  } catch (error) {
      console.log(error)
    res.status(500).json({ message: "Error updating history" });
  }
};

// Increment view count for a video (for anonymous or logged-in)
export const handleview = async (req, res) => {
  try {
    const { videoId } = req.params;
    // Optionally, increment view count in video model here
    res.status(200).json({ message: "View logged" });
  } catch (error) {
    res.status(500).json({ message: "Error logging view" });
  }
};
