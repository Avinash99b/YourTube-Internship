import React, {useEffect, useState} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "./ui/avatar";
import {Textarea} from "./ui/textarea";
import {Button} from "./ui/button";
import {formatDistanceToNow} from "date-fns";
import {useUser} from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import {getGoogleTranslateLanguages} from "@/lib/countrycodes";
import {ThumbsDown, ThumbsUp} from "lucide-react";
import {toast} from "sonner";

interface Comment {
    _id: string;
    videoid: string;
    userid: string;
    commentbody: string;
    usercommented: string;
    commentedon: string;
    location: string;
    like_count: number;
    dislike_count: number;
}

// Define CommentProps for the Comment component
interface CommentProps {
    comment: Comment;
    triggerCommentReload: () => void;
}

const Comment = ({comment, triggerCommentReload}: CommentProps) => {
    const {user} = useUser();
    const [editText, setEditText] = useState("");
    const [editing, setEditing] = useState<boolean>(false);
    const [commentBody, setCommentBody] = useState(comment.commentbody)
    const [showingTranslated, setShowingTranslated] = useState(false)
    const [translateLanguage, setTranslateLanguage] = useState<string>("en")
    const [commentReactionStatus, setCommentReactionStatus] = useState<null | "liked" | "disliked">(null)

    const handleEdit = (comment: Comment) => {
        setEditing((prevState) => !prevState);
        setEditText(comment.commentbody);
    };

    const handleUpdateComment = async () => {
        if (!editText.trim()) return;
        try {
            const res = await axiosInstance.post(
                `/comment/editcomment/${comment._id}`,
                {commentbody: editText}
            );
            if (res.data) {
                setEditing(false);
                setEditText("");
                triggerCommentReload()
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    };


    const handleDelete = async (id: string) => {
        try {
            const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
            if (res.data.comment) {
                triggerCommentReload()
            }
        } catch (error: any) {
            console.log(error);
        }
    }

    const translateComment = async () => {
        try {
            const response = await axiosInstance.post('/translate', {
                text: commentBody,
                targetLanguage: translateLanguage
            })
            setCommentBody(response.data.translation)
            setShowingTranslated(true)
        } catch (e) {
            console.log(e)
        }
    }

    const reactToComment = async (reactionIsLike: boolean) => {
        if (!user) return;
        try {
            if (reactionIsLike && commentReactionStatus === "liked") {
                return await deleteReaction()
            } else if (!reactionIsLike && commentReactionStatus === "disliked") {
                return await deleteReaction()
            }
            const res = await axiosInstance.post(`/comment/react/${comment._id}/${user?._id}`, {
                userId: user?._id,
                reactionIsLike
            });
            if (res.status === 200) {
                triggerCommentReload()

            }
        } catch (error) {
            console.log(error);
        }
    };

    const deleteReaction = async () => {
        if (!user) return;
        try {
            const res = await axiosInstance.delete(`/comment/reaction/${comment._id}/${user?._id}`);
            if (res.status === 200) {
                setCommentReactionStatus(null)
                triggerCommentReload()
            }
        } catch (error) {
            console.log(error);
        }
    };
    const fetchReaction = async () => {
        if (!user) return;
        try {
            const res = await axiosInstance.get(`/comment/reaction/${comment._id}/${user?._id}`);
            if (res.status === 200) {
                if (!res.data) return setCommentReactionStatus(null)
                if (res.data.reactionIsLike) {
                    setCommentReactionStatus("liked")
                } else {
                    setCommentReactionStatus("disliked")
                }
            }
            return res.data
        } catch (error) {
            console.log(error);
            return null
        }
    }
    fetchReaction()
    return (
        <div key={comment._id} className="flex gap-4 p-4 rounded-lg shadow-sm mb-2 transition-colors duration-300 bg-white dark:bg-zinc-900">
            <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-gray-200 dark:bg-zinc-700 text-black dark:text-white">{comment.usercommented[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm text-black dark:text-white">
                    {comment.usercommented}
                  </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{comment.location || "Unknown"}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                </div>
                {editing ? (
                    <div className="space-y-2">
                        <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-black dark:text-white"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                onClick={handleUpdateComment}
                                disabled={!editText.trim()}
                            >
                                Save
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setEditing(false);
                                    setEditText("");
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/*  Comment body*/}
                        <p className="text-sm text-gray-800 dark:text-gray-200">{commentBody}</p>


                        <div className="flex gap-2 mt-2 text-sm text-gray-500">

                            {comment.userid === user?._id && (<>
                                <button onClick={() => handleEdit(comment)}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(comment._id)}>
                                    Delete
                                </button>
                            </>)}
                            {showingTranslated ? <>
                                <button onClick={() => {
                                    setCommentBody(comment.commentbody);
                                    setShowingTranslated(false)
                                    setTranslateLanguage("en")
                                }}>Show Original
                                </button>
                            </> : <button onClick={translateComment}>
                                Translate to <select onChange={(e) => setTranslateLanguage(e.target.value)}
                                                     defaultValue={"en"}>
                                {getGoogleTranslateLanguages().map((language) => {
                                    return <option value={language.code}>{language.name}</option>
                                })}
                            </select>
                            </button>}
                            {user?._id && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-l-full"
                                        onClick={() => reactToComment(true)}
                                    >
                                        <ThumbsUp
                                            className={`w-5 h-5 mr-2 ${
                                                commentReactionStatus === "liked" ? "fill-black text-black" : ""
                                            }`}
                                        />
                                        {comment.like_count.toLocaleString()}
                                    </Button>
                                    <div className="w-px h-6 bg-gray-300"/>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-r-full"
                                        onClick={() => reactToComment(false)}
                                    >
                                        <ThumbsDown
                                            className={`w-5 h-5 mr-2 ${
                                                commentReactionStatus === "disliked" ? "fill-black text-black" : ""
                                            }`}
                                        />
                                        {comment.dislike_count.toLocaleString()}
                                    </Button>

                                </div>
                            )}
                        </div>

                    </>
                )}
            </div>
        </div>
    )
}


// Utility to get location details using browser geolocation and OpenStreetMap
async function getLocationDetails() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ state: "", city: "", pincode: "", error: "Geolocation not supported" });
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "location-app"
          }
        });
        const data = await response.json();
        if (!data.address) {
          resolve({ state: "", city: "", pincode: "", error: "Failed to fetch address" });
          return;
        }
        const state = data.address.state || "";
        const city = data.address.city ||
                     data.address.town ||
                     data.address.village ||
                     data.address.municipality ||
                     data.address.locality ||
                     data.address.county || "";
        const pincode = data.address.postcode || "";
        resolve({ state, city, pincode });
      } catch (error) {
        resolve({ state: "", city: "", pincode: "", error: "Something went wrong" });
      }
    }, () => {
      resolve({ state: "", city: "", pincode: "", error: "Permission denied" });
    });
  });
}

const Comments = ({videoId}: any) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {user} = useUser();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadComments();
    }, [videoId]);

    const loadComments = async () => {
        try {
            const res = await axiosInstance.get(`/comment/${videoId}`);
            setComments(res.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return <div>Loading history...</div>;
    }
    const handleSubmitComment = async () => {
        if (!user || !newComment.trim()) return;
        setIsSubmitting(true);
        try {
            // Get location from browser
            const loc = await getLocationDetails();
            let location = "Unknown";
            if (loc.city && loc.state) {
                location = `${loc.city}/${loc.state}`;
            }
            // Post comment with location
            const res = await axiosInstance.post("/comment/postcomment", {
                videoid: videoId,
                userid: user._id,
                commentbody: newComment,
                usercommented: user.name,
                location,
            });
            if (res.data.comment) {
                setComments([]);

                loadComments()
            }
            setNewComment("");
        } catch (error: any) {
            toast.error(error.response.data.message)
        } finally {
            setIsSubmitting(false);
        }
    };
    const reloadComments = () => {
        setComments([])
        loadComments()
    }
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">{comments.length} Comments</h2>
            {user && (
                <div className="flex gap-4 bg-[var(--card)] p-4 rounded-lg shadow-sm mb-4 transition-colors duration-300">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={user.image || ""}/>
                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e: any) => setNewComment(e.target.value)}
                            className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0 bg-transparent text-[var(--card-foreground)]"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="ghost"
                                onClick={() => setNewComment("")}
                                disabled={!newComment.trim()}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim() || isSubmitting}
                            >
                                Comment
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                        No comments yet. Be the first to comment!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <Comment comment={comment} triggerCommentReload={reloadComments}/>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comments;
