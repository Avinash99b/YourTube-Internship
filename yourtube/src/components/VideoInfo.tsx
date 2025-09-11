import React, {useEffect, useState} from "react";
import {Avatar, AvatarFallback} from "./ui/avatar";
import {Button} from "./ui/button";
import {
    Clock,
    Download,
    Share,
    ThumbsUp,
} from "lucide-react";
import {formatDistanceToNow} from "date-fns";
import {useUser} from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import {Dialog, DialogContent, DialogTitle, DialogDescription} from "./ui/dialog";
import {useTheme} from "@/lib/ThemeContext";
import { saveVideoToDb } from "@/lib/downloadsDb";

// Add Razorpay type declaration
declare global {
    interface Window {
        Razorpay?: any;
    }
}

const PLAN_DETAILS = [
    {key: "bronze", label: "Bronze", price: 10, desc: "7 min watch, unlimited downloads"},
    {key: "silver", label: "Silver", price: 50, desc: "10 min watch, unlimited downloads"},
    {key: "gold", label: "Gold", price: 100, desc: "Unlimited watch, unlimited downloads"},
];

// Helper to get plan order
const PLAN_ORDER = ["free", "bronze", "silver", "gold"];
const getPlanIndex = (plan: string) => PLAN_ORDER.indexOf(plan || "free");

const VideoInfo = ({video}: any) => {
    const [likes, setlikes] = useState(video.Like || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const {user} = useUser();
    const [isWatchLater, setIsWatchLater] = useState(false);
    const [downloadError, setDownloadError] = useState("");
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("bronze");
    const [isUpgrading, setIsUpgrading] = useState(false);
    const {theme} = useTheme();

    useEffect(() => {
        setlikes(video.Like || 0);
        setIsLiked(false);
        setIsWatchLater(false);
        setDownloadError("");
        // Fetch liked videos and watch later status individually
        const fetchLikedVideos = async () => {
            if (!user) return;
            try {
                const likedVideosRes = await axiosInstance.get(`/like/${user._id}`);
                const likedVideoIds = likedVideosRes.data.map((item: any) => item.videoid?._id);
                setIsLiked(likedVideoIds.includes(video._id));
            } catch (err) {
                // Ignore errors for status fetch
            }
        };
        const fetchWatchLaterStatus = async () => {
            if (!user) return;
            try {
                const watchLaterRes = await axiosInstance.get(`/watch/status/${video._id}?userId=${user._id}`);
                setIsWatchLater(!!(watchLaterRes.data.watchLater ?? watchLaterRes.data.watchlater));
            } catch (err) {
                // Ignore errors for status fetch
            }
        };
        fetchLikedVideos();
        fetchWatchLaterStatus();
    }, [video, user]);

    const refreshLikedVideos = async () => {
        if (!user) return;
        try {
            const likedVideosRes = await axiosInstance.get(`/like/${user._id}`);
            const likedVideoIds = likedVideosRes.data.map((item: any) => item.videoid?._id || item.videoid);
            setIsLiked(likedVideoIds.includes(video._id));
        } catch (err) {}
    };

    useEffect(() => {
        const handleviews = async () => {
            if (user) {
                try {
                    return await axiosInstance.post(`/history/${video._id}`, {
                        userId: user?._id,
                    });
                } catch (error) {
                    return console.log(error);
                }
            } else {
                return await axiosInstance.post(`/history/views/${video?._id}`);
            }
        };
        handleviews();
    }, [user]);
    const handleLike = async () => {
        if (!user) return;
        try {
            const res = await axiosInstance.post(`/like/${video._id}`, {
                userId: user._id,
            });
            if (res.data.liked) {
                setlikes((prev: number) => prev + 1);
            } else {
                setlikes((prev: number) => Math.max(prev - 1, 0));
            }
            // Refresh liked videos to update isLiked state
            await refreshLikedVideos();
        } catch (error) {
            console.log(error);
        }
    };
    const handleWatchLater = async () => {
        if (!user) return;
        try {
            const res = await axiosInstance.post(`/watch/${video._id}`, {
                userId: user._id,
            });
            // Accept both possible keys from backend
            setIsWatchLater(!!(res.data.watchLater ?? res.data.watchlater));
        } catch (error) {
            console.log(error);
        }
    };
    const handleDownload = async () => {
        if (!user) {
            setDownloadError("Please login to download videos.");
            return;
        }
        setIsDownloading(true);
        setDownloadError("");
        try {
            // Use the backend endpoint: /download/:id?userId=...
            const response = await axiosInstance.get(`/video/download/${video._id}?userId=${user._id}`, {
                responseType: "blob"
            });
            if (response.status === 200 || response.status === 206) {
                // Save the file in browser storage (IndexedDB)
                await saveVideoToDb({
                    id: video._id,
                    title: video.videotitle,
                    filename: video.filename || "video.mp4",
                    channel: video.videochanel,
                    createdAt: video.createdAt,
                    description: video.description,
                }, response.data);
                setDownloadError("Video saved to browser downloads! Go to your profile to access it.");
            }
        } catch (error:any) {
            const response = error.response;
            if (response && response.status === 403) {
                setDownloadError("Free users can only download one video per day. Upgrade to premium for unlimited downloads.");
                setShowUpgrade(true);
            } else if (response && response.status === 404) {
                setDownloadError("Video not found or user not found.");
            } else {
                setDownloadError("Download failed. Please try again.");
            }
        } finally {
            setIsDownloading(false);
        }
    };
    // Only show upgrade if user is not on the highest plan
    const userPlan = user?.plan || "free";
    const userPlanIndex = getPlanIndex(userPlan);
    const maxPlanIndex = PLAN_ORDER.length - 1;
    const canUpgrade = userPlanIndex < maxPlanIndex;

    const handleUpgrade = async () => {
        if (!user) return;
        // Prevent upgrading to same or lower plan
        const selectedPlanIndex = getPlanIndex(selectedPlan);
        if (selectedPlanIndex <= userPlanIndex) return;
        setIsUpgrading(true);
        try {
            const {data} = await axiosInstance.post("/payment/create-order", {plan: selectedPlan});
            const order = data.order;
            // Load Razorpay script if not loaded
            if (!window.Razorpay) {
                await new Promise((resolve) => {
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = resolve;
                    document.body.appendChild(script);
                });
            }
            const rzp = new window.Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                order_id: order.id,
                name: "YourTube Premium Upgrade",
                description: `Upgrade to ${selectedPlan} plan`,
                handler: async function (response: any) {
                    // Call backend to confirm payment and upgrade plan
                    await axiosInstance.post("/payment/payment-success", {
                        userId: user._id,
                        plan: selectedPlan,
                        paymentId: response.razorpay_payment_id,
                    });
                    setShowUpgrade(false);
                },
                prefill: {
                    email: user.email,
                    name: user.name,
                },
                theme: {color: "#6366f1"},
            });
            rzp.open();
        } catch (err) {
            setDownloadError("Upgrade failed. Please try again.");
        } finally {
            setIsUpgrading(false);
        }
    };
    return (
        <div
            className={`rounded-lg shadow p-3 sm:p-4 md:p-6 transition-colors duration-300 ${theme === "light" ? "bg-white text-black" : "bg-zinc-900 text-white"}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 mb-4">
                <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                    <AvatarFallback className={theme === "light" ? "bg-gray-200 text-black" : "bg-zinc-700 text-white"}>
                        {video?.videochanel?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg md:text-xl font-semibold line-clamp-2">{video?.videotitle}</h2>
                    <div className={`text-xs sm:text-sm md:text-base ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                        {video?.videochanel} • {video?.views?.toLocaleString()} views • {formatDistanceToNow(new Date(video?.createdAt))} ago
                    </div>
                </div>
                <Button variant="outline" className="ml-0 sm:ml-2 w-full sm:w-auto text-xs sm:text-sm md:text-base px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5" onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                }}>
                    <Share className="w-4 h-4 mr-1"/> Share
                </Button>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4 md:gap-6 mb-4 w-full">
                <Button variant={isLiked ? "default" : "ghost"} onClick={handleLike} disabled={!user}
                        aria-pressed={isLiked} className="flex-1 min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm md:text-base px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5">
                    <ThumbsUp className={isLiked ? "fill-white" : ""}/> {likes}
                </Button>
                <Button variant={isWatchLater ? "default" : "outline"} onClick={handleWatchLater} disabled={!user}
                        aria-pressed={isWatchLater} className="flex-1 min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm md:text-base px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5">
                    <Clock className={isWatchLater ? "fill-white" : ""}/> Watch Later
                </Button>
                <Button variant="outline" onClick={handleDownload} disabled={!user || isDownloading} className="flex-1 min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm md:text-base px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5">
                    <Download className="w-4 h-4 mr-1"/> {isDownloading ? "Downloading..." : "Download"}
                </Button>
                {canUpgrade && (
                    <Button variant="outline" onClick={() => setShowUpgrade(true)} disabled={!user} className="flex-1 min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm md:text-base px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5">
                        Upgrade
                    </Button>
                )}
            </div>
            {downloadError &&
                <div className={theme === "light" ? "text-red-600 mb-2" : "text-red-400 mb-2"}>{downloadError}</div>}
            <div className="mb-2">
                <span className="font-semibold">Description:</span>
                <span className={theme === "light" ? "ml-2 text-gray-700" : "ml-2 text-gray-300"}>
          {showFullDescription ? video?.description : (video?.description?.slice(0, 120) || "")}
                    {video?.description?.length > 120 && (
                        <button
                            className={theme === "light" ? "ml-2 text-blue-600 underline" : "ml-2 text-blue-400 underline"}
                            onClick={() => setShowFullDescription(!showFullDescription)}>
                            {showFullDescription ? "Show less" : "Show more"}
                        </button>
                    )}
        </span>
            </div>
            {/* Dialog for upgrade */}
            {canUpgrade && (
            <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
                <DialogContent className={theme === "light" ? "bg-white text-black" : "bg-zinc-900 text-white"}>
                    <DialogTitle>Upgrade Plan</DialogTitle>
                    <DialogDescription>
                        Choose a plan to unlock more features:
                    </DialogDescription>
                    <div className="flex flex-col gap-2 mt-4">
                        {PLAN_DETAILS.map((plan) => {
                            const planIndex = getPlanIndex(plan.key);
                            const isDisabled = planIndex <= userPlanIndex;
                            return (
                                <Button
                                    key={plan.key}
                                    variant={selectedPlan === plan.key ? "default" : "outline"}
                                    className={
                                        `${selectedPlan === plan.key ? (theme === "light" ? "bg-blue-600 text-white" : "bg-blue-500 text-white") : ""} ` +
                                        (isDisabled ? "opacity-50 blur-[1.5px] pointer-events-none" : "") +
                                        " text-xs sm:text-sm md:text-base px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5"
                                    }
                                    onClick={() => !isDisabled && setSelectedPlan(plan.key)}
                                    disabled={isDisabled}
                                >
                                    {plan.label} - ₹{plan.price} <span
                                    className={theme === "light" ? "ml-2 text-xs text-gray-500" : "ml-2 text-xs text-gray-300"}>{plan.desc}</span>
                                </Button>
                            );
                        })}
                    </div>
                    <Button
                        onClick={handleUpgrade}
                        disabled={isUpgrading || selectedPlan === userPlan}
                        className="mt-4 w-full text-xs sm:text-sm md:text-base px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5"
                    >
                        {isUpgrading ? "Upgrading..." : "Upgrade"}
                    </Button>
                </DialogContent>
            </Dialog>
            )}
        </div>
    );
};

export default VideoInfo;
