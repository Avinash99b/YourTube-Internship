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
    const [languages, setLanguages] = useState<{ code: string; name: string }[]>([]);
    const [commentReactionStatus, setCommentReactionStatus] = useState<null | "liked" | "disliked">(null)
    const [translating, setTranslating] = useState(false);

    useEffect(() => {
        async function fetchLanguages() {
            const langs = getGoogleTranslateLanguages();
            setLanguages(langs);
        }
        fetchLanguages();
    }, []);

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
        setTranslating(true);
        try {
            const response = await axiosInstance.post('/translate', {
                text: commentBody,
                targetLanguage: translateLanguage
            })
            setCommentBody(response.data.translation)
            setShowingTranslated(true)
        } catch (e) {
            console.log(e)
        } finally {
            setTranslating(false);
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
        <div className="flex flex-col sm:flex-row gap-3 py-3 border-b border-gray-200 dark:border-zinc-700">
            <div className="flex-shrink-0 flex items-start">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                    <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
                </Avatar>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="font-semibold text-xs sm:text-sm truncate">{comment.usercommented}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDistanceToNow(new Date(comment.commentedon))} ago</span>
                </div>
                <div className="text-sm sm:text-base mt-1 break-words whitespace-pre-line">
                    {translating ? (
                        <div className="animate-pulse bg-gray-200 dark:bg-zinc-700 h-6 w-2/3 rounded mb-2"></div>
                    ) : (
                        commentBody
                    )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    <select
                        className="border rounded px-2 py-1 text-xs"
                        value={translateLanguage}
                        onChange={e => setTranslateLanguage(e.target.value)}
                        aria-label="Select language to translate"
                    >
                        {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                    <Button size="sm" variant="ghost" onClick={() => reactToComment(true)} aria-pressed={commentReactionStatus === 'liked'}>
                        <ThumbsUp className="w-4 h-4 mr-1" /> {comment.like_count}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => reactToComment(false)} aria-pressed={commentReactionStatus === 'disliked'}>
                        <ThumbsDown className="w-4 h-4 mr-1" /> {comment.dislike_count}
                    </Button>
                    {user && user._id === comment.userid && (
                        <>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(comment)}>{editing ? 'Cancel' : 'Edit'}</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(comment._id)}>Delete</Button>
                        </>
                    )}
                    <Button size="sm" variant="outline" onClick={translateComment} disabled={translating}>
                        {translating ? (
                            <span className="flex items-center gap-1">
                                <svg className="animate-spin h-4 w-4 mr-1 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                Translating...
                            </span>
                        ) : (
                            'Translate'
                        )}
                    </Button>
                    {showingTranslated && (
                        <Button size="sm" variant="ghost" onClick={() => { setCommentBody(comment.commentbody); setShowingTranslated(false); }}>Show Original</Button>
                    )}
                </div>
                {editing && (
                    <div className="mt-2 flex flex-col gap-2">
                        <Textarea value={editText} onChange={e => setEditText(e.target.value)} className="w-full min-h-[60px]" />
                        <div className="flex gap-2">
                            <Button size="sm" variant="default" onClick={handleUpdateComment}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}


// Utility to get location details using browser geolocation and OpenStreetMap
async function getLocationDetails():Promise<{state:string,city:string,pincode:string,error?:string}> {
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
