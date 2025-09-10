import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const SearchResult = ({ query }: any) => {
  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 transition-colors">
          Enter a search term to find videos and channels.
        </p>
      </div>
    );
  }
  const [video, setvideos] = useState<any>(null);
  const videos = async () => {
    const allVideos = [
      {
        _id: "1",
        videotitle: "Amazing Nature Documentary",
        filename: "nature-doc.mp4",
        filetype: "video/mp4",
        filepath: "/videos/nature-doc.mp4",
        filesize: "500MB",
        videochanel: "Nature Channel",
        Like: 1250,
        views: 45000,
        uploader: "nature_lover",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        videotitle: "Cooking Tutorial: Perfect Pasta",
        filename: "pasta-tutorial.mp4",
        filetype: "video/mp4",
        filepath: "/videos/pasta-tutorial.mp4",
        filesize: "300MB",
        videochanel: "Chef's Kitchen",
        Like: 890,
        views: 23000,
        uploader: "chef_master",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    let results = allVideos.filter(
      (vid) =>
        vid.videotitle.toLowerCase().includes(query.toLowerCase()) ||
        vid.videochanel.toLowerCase().includes(query.toLowerCase())
    );
    setvideos(results);
  };
  useEffect(() => {
    videos();
  }, [query]);
  if (!video) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white transition-colors">
          No results found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 transition-colors">
          Try different keywords or remove search filters
        </p>
      </div>
    );
  }
  const hasResults = video ? video.length > 0 : true;
  if (!hasResults) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2 text-black dark:text-white transition-colors">
          No results found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 transition-colors">
          Try different keywords or remove search filters
        </p>
      </div>
    );
  }
  const vids = "/video/vdo.mp4";
  return (
    <div className="space-y-6">
      {/* Video Results */}
      {video.length > 0 && (
        <div className="space-y-4">
          {video.map((video: any) => (
            <div key={video._id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 group p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
              <Link href={`/watch/${video._id}`} className="flex-shrink-0">
                <div className="relative w-full sm:w-80 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <video
                    src={vids}
                    className="object-cover group-hover:scale-105 transition-transform duration-200 w-full h-full"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
                    10:24
                  </div>
                </div>
              </Link>
              <div className="flex-1 min-w-0 py-1">
                <h3 className="font-medium text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {video.videotitle}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">{video.videochanel}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {video.views.toLocaleString()} views 3 {formatDistanceToNow(new Date(video.createdAt))} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResult;
