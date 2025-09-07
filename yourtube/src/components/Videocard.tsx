import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface VideocardProps {
  video: any;
}

const Videocard: React.FC<VideocardProps> = ({ video }) => {
  return (
    <Link href={`/watch/${video._id}`} className="block">
      <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-lg shadow-md overflow-hidden transition-colors duration-300 hover:shadow-lg hover:scale-[1.02] focus-within:shadow-lg focus-within:scale-[1.02] cursor-pointer">
        <div className="aspect-video bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
          {/* Thumbnail or video preview */}
          <video
            src={video.filepath}
            className="w-full h-full object-cover"
            controls={false}
            preload="metadata"
            poster={video.thumbnail || "/video/vdo.mp4"}
            tabIndex={-1}
          />
        </div>
        <div className="p-4">
          <div className="font-semibold text-base mb-1 truncate" title={video.videotitle}>{video.videotitle}</div>
          <div className="text-xs text-gray-500 mb-1 truncate">{video.videochanel || video.uploader || "Unknown Channel"}</div>
          <div className="flex items-center text-xs text-gray-400 gap-2">
            <span>{video.views || 0} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Videocard;

