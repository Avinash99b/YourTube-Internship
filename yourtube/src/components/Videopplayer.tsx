"use client";

import React, { useRef, useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import axiosInstance from "@/lib/axiosinstance";
import { FaPlay, FaPause, FaForward, FaBackward, FaCommentDots, FaTimes, FaStepForward } from "react-icons/fa";
import "dotenv/config";
import ReactPlayer from "react-player";

interface CustomVideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
  onNextVideo?: () => void;
  onShowComments?: () => void;
}

const GESTURE_TIMEOUT = 300; // ms for tap grouping

export default function CustomVideoPlayer({
  video,
  onNextVideo,
  onShowComments,
  showWalkthrough = false,
  onDismissWalkthrough,
}: CustomVideoPlayerProps & { showWalkthrough?: boolean; onDismissWalkthrough?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useUser();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [watchSeconds, setWatchSeconds] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeMsg, setUpgradeMsg] = useState("");
  const tapCounts = useRef({ left: 0, center: 0, right: 0 });
  const tapTimers = useRef<{
    [zone: string]: NodeJS.Timeout | null;
  }>({ left: null, center: null, right: null });
  const [walkthroughVisible, setWalkthroughVisible] = useState(showWalkthrough);
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Helper: Show feedback overlay
  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 600);
  };

  // Gesture handler
  const handleZoneTap = (zone: "left" | "center" | "right") => {
    tapCounts.current[zone]++;
    if (tapTimers.current[zone]) clearTimeout(tapTimers.current[zone]!);
    tapTimers.current[zone] = setTimeout(() => {
      // Single tap center: pause/play
      if (zone === "center" && tapCounts.current.center === 1) {
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play();
            showFeedback("▶️ Play");
          } else {
            videoRef.current.pause();
            showFeedback("⏸️ Pause");
          }
        }
      }
      // Double tap right: +10s
      if (zone === "right" && tapCounts.current.right === 2) {
        if (videoRef.current && videoRef.current?.currentTime) {
          videoRef.current.currentTime = Math.min(
            videoRef.current.currentTime + 10,
            videoRef.current.duration
          );
          showFeedback("⏩ +10s");
        }
      }
      // Double tap left: -10s
      if (zone === "left" && tapCounts.current.left === 2) {
        if (videoRef.current && videoRef.current?.currentTime) {
          videoRef.current.currentTime = Math.max(
            videoRef.current?.currentTime - 10,
            0
          );
          showFeedback("⏪ -10s");
        }
      }
      // Triple tap center: next video
      if (zone === "center" && tapCounts.current.center === 3) {
        showFeedback("⏭️ Next Video");
        if (onNextVideo) onNextVideo();
      }
      // Triple tap right: close website
      if (zone === "right" && tapCounts.current.right === 3) {
        showFeedback("❌ Close");
        setTimeout(() => {
            window.location.href = "about:blank";
            alert("Please close this tab manually.");
        }, 400);
      }
      // Triple tap left: show comments
      if (zone === "left" && tapCounts.current.left === 3) {
        showFeedback("💬 Comments");
        if (onShowComments) onShowComments();
      }
      tapCounts.current[zone] = 0;
      tapTimers.current[zone] = null;
    }, GESTURE_TIMEOUT);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(tapTimers.current).forEach((timer) => timer && clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    setWalkthroughVisible(showWalkthrough);
  }, [showWalkthrough]);

  const handleDismissWalkthrough = () => {
    setWalkthroughVisible(false);
    if (onDismissWalkthrough) onDismissWalkthrough();
  };

  useEffect(() => {
    if (!videoRef.current) return;
    let interval: NodeJS.Timeout | null = null;
    const handleTimeUpdate = () => {
      setWatchSeconds(Math.floor(videoRef.current!.currentTime));
    };
    videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    // Plan-based watch time limit
    let limit: number = 300; // default 5 min
    if (user?.plan === "bronze") limit = 420;
    if (user?.plan === "silver") limit = 600;
    if (user?.plan === "gold") limit = Infinity;
    interval = setInterval(() => {
      if (limit !== Infinity && watchSeconds >= limit) {
        if (videoRef.current) videoRef.current.pause();
        setShowUpgrade(true);
        setUpgradeMsg(
          user?.plan === "free"
            ? "Free plan: Watch time limit reached (5 min). Upgrade for more!"
            : user?.plan === "bronze"
            ? "Bronze plan: Watch time limit reached (7 min). Upgrade for more!"
            : "Silver plan: Watch time limit reached (10 min). Upgrade for unlimited!"
        );
      }
    }, 1000);
    return () => {
      videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
      if (interval) clearInterval(interval);
    };
  }, [user, watchSeconds]);

  // Watch time logging
  useEffect(() => {
    if (!user || !video?._id) return;
    let interval: NodeJS.Timeout | null = null;
    let lastSent = 0;
    interval = setInterval(() => {
      if (!videoRef.current) return;
      const current = Math.floor(videoRef.current.currentTime);
      if (current > lastSent) {
        const delta = current - lastSent;
        if (delta > 0) {
          axiosInstance.post("/history/log-watch", {
            userId: user._id,
            videoId: video._id,
            watchTime: delta,
          });
          lastSent = current;
        }
      }
    }, 10000); // every 10 seconds
    // Also log on pause/end
    const logOnPause = () => {
      if (!videoRef.current) return;
      const current = Math.floor(videoRef.current.currentTime);
      if (current > lastSent) {
        const delta = current - lastSent;
        if (delta > 0) {
          axiosInstance.post("/history/log-watch", {
            userId: user._id,
            videoId: video._id,
            watchTime: delta,
          });
          lastSent = current;
        }
      }
    };
    videoRef.current?.addEventListener("pause", logOnPause);
    videoRef.current?.addEventListener("ended", logOnPause);
    return () => {
      if (interval) clearInterval(interval);
      if (videoRef.current) {
        videoRef.current.removeEventListener("pause", logOnPause);
        videoRef.current.removeEventListener("ended", logOnPause);
      }
    };
  }, [user, video?._id]);

  // Show controls on mouse move/tap
  const handleShowControls = () => {
    setShowControls(true);
    setTimeout(() => setShowControls(false), 2500);
  };

  // Update play/pause state
  useEffect(() => {
    if (!videoRef.current) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    videoRef.current.addEventListener("play", handlePlay);
    videoRef.current.addEventListener("pause", handlePause);
    return () => {
      videoRef.current?.removeEventListener("play", handlePlay);
      videoRef.current?.removeEventListener("pause", handlePause);
    };
  }, []);

  // Update time/duration
  useEffect(() => {
    if (!videoRef.current) return;
    const handleTimeUpdate = () => setCurrentTime(videoRef.current!.currentTime);
    const handleLoadedMetadata = () => setDuration(videoRef.current!.duration);
    videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    videoRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
      videoRef.current?.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [video]);

  // Seek bar handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Format time helper
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    let objectUrl: string | null = null;
    const fetchVideo = async () => {
      if (!video?.filepath) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${encodeURIComponent(video.filepath)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) throw new Error("Failed to fetch video");
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setVideoUrl(objectUrl);
      } catch (e) {
        setVideoUrl(null);
      }
    };
    fetchVideo();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setVideoUrl(null);
    };
  }, [video?.filepath]);

  return (
    <div
      className="relative w-full aspect-video bg-black dark:bg-zinc-900 transition-colors duration-300 rounded-lg overflow-hidden group"
      onMouseMove={handleShowControls}
      onClick={handleShowControls}
    >
      {/* Video element replaced with ReactPlayer */}
      <video
        ref={videoRef}
        controls={false}
        className="w-full h-full bg-black"
        src={videoUrl || undefined}
      >
        {/* fallback source for browsers that don't support JS */}
        {/* <source src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/${encodeURIComponent(video.filepath)}`} type="video/mp4" /> */}
      </video>
      {/* Tap zones for gestures */}
      <div className="absolute inset-0 flex z-20">
        <button
          className="w-1/3 h-full bg-transparent focus:outline-none active:bg-white/10 transition-colors"
          aria-label="Rewind"
          onClick={() => handleZoneTap("left")}
          onTouchStart={e => { e.preventDefault(); }}
          onTouchEnd={e => { e.preventDefault(); handleZoneTap("left"); }}
          style={{ touchAction: "manipulation" }}
        />
        <button
          className="w-1/3 h-full bg-transparent focus:outline-none active:bg-white/10 transition-colors"
          aria-label="Play/Pause/Next"
          onClick={() => handleZoneTap("center")}
          onTouchStart={e => { e.preventDefault(); }}
          onTouchEnd={e => { e.preventDefault(); handleZoneTap("center"); }}
          style={{ touchAction: "manipulation" }}
        />
        <button
          className="w-1/3 h-full bg-transparent focus:outline-none active:bg-white/10 transition-colors"
          aria-label="Forward/Close"
          onClick={() => handleZoneTap("right")}
          onTouchStart={e => { e.preventDefault(); }}
          onTouchEnd={e => { e.preventDefault(); handleZoneTap("right"); }}
          style={{ touchAction: "manipulation" }}
        />
      </div>
      {/* Feedback overlay with icons */}
      {feedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="bg-black/70 dark:bg-zinc-900/80 text-white px-8 py-6 rounded-xl shadow-lg text-3xl font-bold flex items-center gap-3 animate-fade-in">
            {feedback.includes("Play") && <FaPlay />}
            {feedback.includes("Pause") && <FaPause />}
            {feedback.includes("+10") && <FaForward />}
            {feedback.includes("-10") && <FaBackward />}
            {feedback.includes("Next") && <FaStepForward />}
            {feedback.includes("Comments") && <FaCommentDots />}
            {feedback.includes("Close") && <FaTimes />}
            <span>{feedback}</span>
          </div>
        </div>
      )}
      {/* Custom controls bar */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-3 flex flex-col gap-2 z-20 transition-opacity duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!videoRef.current) return;
                if (videoRef.current.paused) {
                  videoRef.current.play();
                } else {
                  videoRef.current.pause();
                }
              }}
              className="text-white text-2xl focus:outline-none hover:scale-110 transition-transform"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <span className="text-white text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-blue-500 h-1 rounded-lg cursor-pointer"
              aria-label="Seek"
            />
          </div>
        </div>
      )}
      {/* Walkthrough overlay */}
      {walkthroughVisible && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 text-black dark:text-white p-6 rounded-lg shadow-lg max-w-md w-full transition-colors">
            <h2 className="text-lg font-bold mb-2">Gesture Walkthrough</h2>
            <ul className="mb-4 space-y-2">
              <li>Double-tap left/right: <FaBackward className="inline" />/<FaForward className="inline" /> Rewind/Forward 10s</li>
              <li>Single-tap center: <FaPlay className="inline" />/<FaPause className="inline" /> Pause/Play</li>
              <li>Triple-tap left: <FaCommentDots className="inline" /> Show comments</li>
              <li>Triple-tap right: <FaTimes className="inline" /> Close website</li>
              <li>Triple-tap center: <FaStepForward className="inline" /> Next video</li>
            </ul>
            <button
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              onClick={handleDismissWalkthrough}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Upgrade dialog */}
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>{upgradeMsg}</DialogDescription>
          <div className="mt-4">
            <span className="text-sm">Upgrade your plan on the video page to watch longer!</span>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowUpgrade(false)}>Close</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
