import React, {useEffect, useState} from "react";
import {Avatar, AvatarFallback} from "./ui/avatar";
import {Button} from "./ui/button";
import {
    Clock,
    Download,
    Share,
    ThumbsDown,
    ThumbsUp,
} from "lucide-react";
import {formatDistanceToNow} from "date-fns";
import {useUser} from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import {Dialog, DialogContent, DialogTitle, DialogDescription} from "./ui/dialog";
import {useTheme} from "@/lib/ThemeContext";

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

const VideoInfo = ({video}: any) => {
    const [likes, setlikes] = useState(video.Like || 0);
    const [dislikes, setDislikes] = useState(video.Dislike || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
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
        setDislikes(video.Dislike || 0);
        setIsLiked(false);
        setIsDisliked(false);
        setIsWatchLater(false);
        setDownloadError("");
        // Fetch user-specific video state
        const fetchUserVideoState = async () => {
            if (!user) return;
            try {
                // Fetch like/dislike/watch later status
                const [likeRes, watchLaterRes] = await Promise.all([
                    axiosInstance.get(`/like/status/${video._id}?userId=${user._id}`),
                    axiosInstance.get(`/watch/status/${video._id}?userId=${user._id}`),
                ]);
                setIsLiked(!!likeRes.data.liked);
                setIsDisliked(!!likeRes.data.disliked);
                setIsWatchLater(!!(watchLaterRes.data.watchLater ?? watchLaterRes.data.watchlater));
            } catch (err) {
                // Ignore errors for status fetch
            }
        };
        fetchUserVideoState();
    }, [video, user]);

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
            await axiosInstance.post(`/like/${video._id}`, {
                userId: user._id,
            });
            // After toggling like, fetch the new status
            const statusRes = await axiosInstance.get(`/like/status/${video._id}?userId=${user._id}`);
            setIsLiked(!!statusRes.data.liked);
            setIsDisliked(!!statusRes.data.disliked);
            setlikes((prev: number) => statusRes.data.liked ? prev + (!isLiked ? 1 : 0) - (isLiked ? 1 : 0) : prev - (isLiked ? 1 : 0));
            setDislikes((prev: number) => statusRes.data.disliked ? prev + (!isDisliked ? 1 : 0) - (isDisliked ? 1 : 0) : prev - (isDisliked ? 1 : 0));
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
    const handleDislike = async () => {
        if (!user) return;
        try {
            await axiosInstance.post(`/like/${video._id}`, {
                userId: user._id,
            });
            // After toggling dislike, fetch the new status
            const statusRes = await axiosInstance.get(`/like/status/${video._id}?userId=${user._id}`);
            setIsLiked(!!statusRes.data.liked);
            setIsDisliked(!!statusRes.data.disliked);
            setlikes((prev: number) => statusRes.data.liked ? prev + (!isLiked ? 1 : 0) - (isLiked ? 1 : 0) : prev - (isLiked ? 1 : 0));
            setDislikes((prev: number) => statusRes.data.disliked ? prev + (!isDisliked ? 1 : 0) - (isDisliked ? 1 : 0) : prev - (isDisliked ? 1 : 0));
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
                // Download the file
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", video.filename || "video.mp4");
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
            }
        } catch (error:any) {
            const response = error.response;
            if (response.status === 403) {
                // Backend returns a message for download limit
                setDownloadError("Free users can only download one video per day. Upgrade to premium for unlimited downloads.");
                setShowUpgrade(true);
            } else if (response.status === 404) {
                setDownloadError("Video not found or user not found.");
            } else {
                setDownloadError("Download failed. Please try again.");
            }
        } finally {
            setIsDownloading(false);
        }
    };
    const handleUpgrade = async () => {
        if (!user) return;
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
            className={`rounded-lg shadow p-4 transition-colors duration-300 ${theme === "light" ? "bg-white text-black" : "bg-zinc-900 text-white"}`}>
            <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-12 h-12">
                    <AvatarFallback className={theme === "light" ? "bg-gray-200 text-black" : "bg-zinc-700 text-white"}>
                        {video?.videochanel?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold line-clamp-2">{video?.videotitle}</h2>
                    <div className={`text-xs ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                        {video?.videochanel} • {video?.views?.toLocaleString()} views
                        • {formatDistanceToNow(new Date(video?.createdAt))} ago
                    </div>
                </div>
                <Button variant="outline" className="ml-2" onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                }}>
                    <Share className="w-4 h-4 mr-1"/> Share
                </Button>
            </div>
            <div className="flex gap-4 mb-4">
                <Button variant={isLiked ? "default" : "ghost"} onClick={handleLike} disabled={!user}
                        aria-pressed={isLiked}>
                    <ThumbsUp className={isLiked ? "fill-white" : ""}/> {likes}
                </Button>
                <Button variant={isDisliked ? "default" : "ghost"} onClick={handleDislike} disabled={!user}
                        aria-pressed={isDisliked}>
                    <ThumbsDown className={isDisliked ? "fill-white" : ""}/> {dislikes}
                </Button>
                <Button variant={isWatchLater ? "default" : "outline"} onClick={handleWatchLater} disabled={!user}
                        aria-pressed={isWatchLater}>
                    <Clock className={isWatchLater ? "fill-white" : ""}/> Watch Later
                </Button>
                <Button variant="outline" onClick={handleDownload} disabled={!user || isDownloading}>
                    <Download className="w-4 h-4 mr-1"/> {isDownloading ? "Downloading..." : "Download"}
                </Button>
                <Button variant="outline" onClick={() => setShowUpgrade(true)} disabled={!user}>
                    Upgrade
                </Button>
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
            <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
                <DialogContent className={theme === "light" ? "bg-white text-black" : "bg-zinc-900 text-white"}>
                    <DialogTitle>Upgrade Plan</DialogTitle>
                    <DialogDescription>
                        Choose a plan to unlock more features:
                    </DialogDescription>
                    <div className="flex flex-col gap-2 mt-4">
                        {PLAN_DETAILS.map(plan => (
                            <Button
                                key={plan.key}
                                variant={selectedPlan === plan.key ? "default" : "outline"}
                                className={selectedPlan === plan.key ? (theme === "light" ? "bg-blue-600 text-white" : "bg-blue-500 text-white") : ""}
                                onClick={() => setSelectedPlan(plan.key)}
                            >
                                {plan.label} - ₹{plan.price} <span
                                className={theme === "light" ? "ml-2 text-xs text-gray-500" : "ml-2 text-xs text-gray-300"}>{plan.desc}</span>
                            </Button>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={() => setShowUpgrade(false)} variant="ghost">Cancel</Button>
                        <Button onClick={handleUpgrade} disabled={isUpgrading}>
                            {isUpgrading ? "Upgrading..." : "Upgrade"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VideoInfo;
