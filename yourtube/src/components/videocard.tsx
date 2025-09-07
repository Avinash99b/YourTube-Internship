"use clinet";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";

export default function VideoCard({ video }: any) {
  return (
    <Link href={`/watch/${video?._id}`} className="group">
      <div className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 transition-colors duration-300">
          <video
            src={`${process.env.BACKEND_URL}/${video?.filepath}`}
            className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 dark:bg-white/80 text-white dark:text-black text-xs px-1 rounded shadow">
            10:24
          </div>
        </div>
        <div className="flex gap-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback>{video?.videochanel[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {video?.videotitle}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{video?.videochanel}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {video?.views.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video?.createdAt))} ago
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
