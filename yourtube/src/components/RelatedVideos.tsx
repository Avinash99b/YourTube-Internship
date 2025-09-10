import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface RelatedVideosProps {
  videos: Array<{
    _id: string;
    videotitle: string;
    videochanel: string;
    views: number;
    createdAt: string;
  }>;
}
const vid = "/video/vdo.mp4";
export default function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <div className="space-y-2">
      {videos.map((video) => (
        <Link
          key={video._id}
          href={`/watch/${video._id}`}
          className="flex flex-col sm:flex-row gap-2 group"
        >
          <div className="relative w-full sm:w-40 aspect-video bg-gray-100 dark:bg-zinc-800 rounded overflow-hidden flex-shrink-0 transition-colors duration-300">
            <video
              src={vid}
              className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {video.videotitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">{video.videochanel}</p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
              {video.views.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video.createdAt))} ago
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
