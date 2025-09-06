import React, {useEffect, useState} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "./ui/avatar";
import {Textarea} from "./ui/textarea";
import {Button} from "./ui/button";
import {formatDistanceToNow} from "date-fns";
import {useUser} from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import {getGoogleTranslateLanguages} from "@/lib/countrycodes";
import {ThumbsDown, ThumbsUp} from "lucide-react";

interface Comment {
    _id: string;
    videoid: string;
    userid: string;
    commentbody: string;
    usercommented: string;
    commentedon: string;
}

const Comment = ({comment, setComments}) => {
    const {user} = useUser();
    const [editText, setEditText] = useState("");
    const [editing, setEditing] = useState<boolean>(false);
    const [commentBody, setCommentBody] = useState(comment.commentbody)
    const [showingTranslated, setShowingTranslated] = useState(false)
    const [translateLanguage, setTranslateLanguage] = useState<string>("en")
    const [commentReactionStatus, setCommentReactionStatus] = useState<null | "liked" | "disliked">(null)
    const [reactions, setReactions] = useState({likes_count: comment.like_count, dislike_count: comment.dislike_count})

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
                setComments((prev) =>
                    prev.map((c) =>
                        c._id === comment._id ? {...c, commentbody: editText} : c
                    )
                );
                setEditing(false);
                setEditText("");
            }
        } catch (error) {
            console.log(error);
        }
    };


    const handleDelete = async (id: string) => {
        try {
            const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
            if (res.data.comment) {
                setComments((prev) => prev.filter((c) => c._id !== id));
            }
        } catch (error) {
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
                if (reactionIsLike) {
                    setReactions({...reactions, likes_count: reactions.likes_count + 1})
                } else {
                    setReactions({...reactions, dislike_count: reactions.dislike_count + 1})
                    if(reactions.dislike_count+1 >= 2){
                        setComments((prev) => prev.filter((c) => c._id === comment._id))
                    }
                }
                setCommentReactionStatus(reactionIsLike ? "liked" : "disliked")

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
                if (commentReactionStatus === "liked") {
                    setReactions({...reactions, likes_count: reactions.likes_count - 1})
                }else{
                    setReactions({...reactions, dislike_count: reactions.dislike_count - 1})
                }
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

        <div key={comment._id} className="flex gap-4">
            <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40"/>
                <AvatarFallback>{comment.usercommented[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.usercommented}
                  </span>
                    <span className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                </div>

                {editing ? (
                    <div className="space-y-2">
                        <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
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
                        <p className="text-sm">{commentBody}</p>


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
                                        {reactions.likes_count.toLocaleString()}
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
                                        {reactions.dislike_count.toLocaleString()}
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
            const res = await axiosInstance.post("/comment/postcomment", {
                videoid: videoId,
                userid: user._id,
                commentbody: newComment,
                usercommented: user.name,
            });
            if (res.data.comment) {
                const newCommentObj: Comment = {
                    _id: Date.now().toString(),
                    videoid: videoId,
                    userid: user._id,
                    commentbody: newComment,
                    usercommented: user.name || "Anonymous",
                    commentedon: new Date().toISOString(),
                };
                setComments([]);

                loadComments()
            }
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

            {user && (
                <div className="flex gap-4">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={user.image || ""}/>
                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e: any) => setNewComment(e.target.value)}
                            className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
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
                        <Comment comment={comment} setComments={setComments}/>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comments;
