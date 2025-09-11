"use clinet";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";
import React, { useEffect, useState, useRef } from "react";

export default function VideoCard({ video }: any) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link href={`/watch/${video?._id}`} className="group block">
      <div className="space-y-3 p-2 sm:p-3 md:p-4">
        <div
          className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 transition-colors duration-300"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Buffering spinner overlay */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <video
            ref={videoRef}
            src={videoUrl || undefined}
            className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full"
            muted
            preload="metadata"
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            onStalled={() => setIsBuffering(true)}
          />
          <div className="absolute bottom-2 right-2 bg-black/80 dark:bg-white/80 text-white dark:text-black text-xs sm:text-sm md:text-base px-1 rounded shadow">
            10:24
          </div>
        </div>
        <div className="flex gap-3 sm:gap-4 min-w-0">
          <Avatar className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0">
            <AvatarFallback>{video?.videochanel[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base md:text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {video?.videotitle}
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1 truncate">{video?.videochanel}</p>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 truncate">
              {video?.views.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video?.createdAt))} ago
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
