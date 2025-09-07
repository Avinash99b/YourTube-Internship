import Comments from "@/components/Comments";
import GestureHelp from "@/components/GestureHelp";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import axiosInstance from "@/lib/axiosinstance";
import { useTheme } from "@/lib/ThemeContext";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();
  const [video, setVideo] = useState<any>(null); // current video info
  const [videos, setVideos] = useState<any[]>([]); // all videos
  const [loading, setloading] = useState(true);
  const [showWalkthrough, setShowWalkthrough] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("gestureWalkthroughDismissed");
    }
    return false;
  });
  const commentsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fetchVideoInfo = async () => {
      if (!id || typeof id !== "string") return;
      setloading(true);
      try {
        // Fetch current video info
        const res = await axiosInstance.get(`/video/info/${id}`);
        setVideo(res.data);
        // Fetch all videos for related/next video logic
        const allRes = await axiosInstance.get("/video/getall");
        setVideos(allRes.data);
      } catch (error) {
        console.log(error);
        setVideo(null);
      } finally {
        setloading(false);
      }
    };
    fetchVideoInfo();
  }, [id]);

  // Next video logic
  const handleNextVideo = () => {
    if (!video || !videos.length) return;
    const idx = videos.findIndex((v: any) => v._id === video._id);
    if (idx !== -1 && idx < videos.length - 1) {
      const nextId = videos[idx + 1]._id;
      router.push(`/watch/${nextId}`);
    }
  };

  // Show comments logic
  const handleShowComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDismissWalkthrough = () => {
    setShowWalkthrough(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("gestureWalkthroughDismissed", "1");
    }
  };

  if (loading) {
    return <div>Loading..</div>;
  }
  if (!video) {
    return <div>Video not found</div>;
  }
  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "light" ? "bg-white text-black" : "bg-zinc-900 text-white"}`}>
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Videopplayer
              video={video}
              onNextVideo={handleNextVideo}
              onShowComments={handleShowComments}
              showWalkthrough={showWalkthrough}
              onDismissWalkthrough={handleDismissWalkthrough}
            />
            <GestureHelp onShowWalkthrough={() => setShowWalkthrough(true)} />
            <VideoInfo video={video} />
            <div ref={commentsRef}>
              <Comments videoId={id} />
            </div>
          </div>
          <div className="space-y-4">
            <RelatedVideos videos={videos} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
