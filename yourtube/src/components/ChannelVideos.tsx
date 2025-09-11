import React, { useEffect, useState, useContext } from "react";
import VideoCard from "@/components/videocard";
import axiosInstance from "@/lib/axiosinstance";
import { UserContext } from "@/lib/AuthContext";

interface ChannelVideosProps {
  channelname: string;
}

export default function ChannelVideos({ channelname }: ChannelVideosProps) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext) as any;

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/video/channel/${channelname}/videos`);
        setVideos(res.data);
      } catch (err) {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [channelname]);

  const handleDelete = async (videoId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await axiosInstance.delete(`/video/channel/${channelname}/video/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      alert("Failed to delete video.");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 transition-colors">No videos uploaded yet.</p>
      </div>
    );
  }

  const isOwner = user && user.channelname === channelname;

  return (
    <div>
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-black dark:text-white transition-colors">Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {videos.map((video: any) => (
          <div key={video._id} className="relative">
            <VideoCard video={video} />
            {isOwner && (
              <button
                className="absolute top-2 right-2 bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm hover:bg-red-700 shadow"
                onClick={() => handleDelete(video._id)}
                title="Delete video"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
