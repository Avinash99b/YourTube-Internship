import React, { useState, useEffect } from "react";
import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import axiosInstance from "@/lib/axiosinstance";
import {useTheme} from "@/lib/ThemeContext";

const ChannelPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("videos");
  const [downloadedVideos, setDownloadedVideos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const {theme} = useTheme();
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    // Fetch channel videos (replace with real API call if needed)
    setVideos([
      // ...mock videos or fetch from backend...
    ]);
  }, []);

  useEffect(() => {
    setTimeout(()=>{
        if (activeTab === "downloads" && user?._id) {
            axiosInstance
                .get(`/video/downloads/user?userId=${user._id}`)
                .then((res) => setDownloadedVideos(res.data.downloadedVideos || []))
                .catch(() => setDownloadedVideos([]));
        }
    },1000)
  }, [activeTab, user]);

  // Handler for successful upload
  const handleUploadSuccess = () => {
    setShowUploader(false);
    // Optionally, refresh videos list here
    // fetchVideos();
  };

  return (
    <div className={`flex-1 min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-[var(--card)] text-[var(--card-foreground)]" : "bg-white text-black"}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 w-full">
        <ChannelHeader channel={user} user={user} />
        {/* Upload Video Button - only show if user is channel owner */}
        <div className="flex justify-end px-2 sm:px-4 mt-4">
          <button
            className="bg-blue-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded text-sm sm:text-base md:text-lg hover:bg-blue-700 transition"
            onClick={() => setShowUploader(true)}
          >
            Upload Video
          </button>
        </div>
        {/* VideoUploader Modal */}
        {showUploader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-2">
            <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded shadow-lg w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                onClick={() => setShowUploader(false)}
              >
                &times;
              </button>
              <VideoUploader onSuccess={handleUploadSuccess} channelId={id} uploaderId={user?._id} />
            </div>
          </div>
        )}
        <Channeltabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="px-2 sm:px-4 pb-8">
          {activeTab === "videos" && <ChannelVideos channelname={user?.channelname} />}
          {activeTab === "downloads" && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Downloaded Videos</h2>
              {downloadedVideos.length === 0 ? (
                <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                  No videos downloaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {downloadedVideos.map((video: any) => (
                    <div key={video._id} className="border rounded p-2 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700">
                      <div className="font-semibold text-sm sm:text-base md:text-lg">
                        {video.videotitle || video.title}
                      </div>
                      <div className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 mb-2">
                        {video.description}
                      </div>
                      {/*<a*/}
                      {/*  href={`${*/}
                      {/*    process.env.NEXT_PUBLIC_NEXT_PUBLIC_BACKEND_URL ||*/}
                      {/*    "http://localhost:5000"*/}
                      {/*  }/uploads/${video.filename}`}*/}
                      {/*  className="text-blue-600 dark:text-blue-400 underline"*/}
                      {/*  target="_blank"*/}
                      {/*  rel="noopener noreferrer"*/}
                      {/*>*/}
                      {/*  Download*/}
                      {/*</a>*/}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelPage;
