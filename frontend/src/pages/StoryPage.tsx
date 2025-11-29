import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import ReactMarkdown from 'react-markdown'
import { AppLayout } from "@/components/layout/app-layout"
import { storyAPI } from "@/lib/api"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, Loader2, Send, Trash2, CornerDownRight, ChevronLeft, ChevronRight, FileText, Download } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Comment {
    _id: string
    user: {
        _id: string
        name: string
        avatar?: string
        username?: string
    }
    text: string
    parentId?: string
    createdAt: string
    children?: Comment[]
}

export function StoryPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [story, setStory] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [commentText, setCommentText] = useState("")
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyText, setReplyText] = useState("")
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        if (id) {
            fetchStory(id)
        }
    }, [id])

    const fetchStory = async (storyId: string) => {
        try {
            setIsLoading(true)
            const response = await storyAPI.getStory(storyId)
            setStory(response.data.story)
            logger.info('StoryPage', 'Story fetched successfully', { storyId })
        } catch (err) {
            logger.error('StoryPage', 'Failed to fetch story', err)
            setError("Failed to load story. It might have been deleted.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!story) return
        try {
            await storyAPI.deleteStory(story._id)
            toast.success("Story deleted successfully")
            navigate('/feed')
        } catch (err) {
            logger.error('StoryPage', 'Failed to delete story', err)
            toast.error("Failed to delete story")
        }
    }

    const handleLike = async () => {
        if (!story) return
        try {
            const response = await storyAPI.reactToStory(story._id)
            setStory((prev: any) => ({
                ...prev,
                reactions: response.data.reactions
            }))
        } catch (err) {
            logger.error('StoryPage', 'Failed to like story', err)
            toast.error("Failed to update reaction")
        }
    }

    const handleComment = async (parentId?: string) => {
        const text = parentId ? replyText : commentText
        if (!text.trim()) return

        try {
            setIsSubmittingComment(true)
            const response = await storyAPI.addComment(story._id, text, parentId)
            setStory((prev: any) => ({
                ...prev,
                comments: response.data.comments
            }))
            if (parentId) {
                setReplyText("")
                setReplyingTo(null)
            } else {
                setCommentText("")
            }
            toast.success("Comment added!")
        } catch (err) {
            logger.error('StoryPage', 'Failed to add comment', err)
            toast.error("Failed to post comment")
        } finally {
            setIsSubmittingComment(false)
        }
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
    }

    // Organize comments into tree
    const getCommentTree = (comments: Comment[]) => {
        const commentMap = new Map<string, Comment>()
        const roots: Comment[] = []

        // First pass: create map and initialize children
        comments.forEach(c => {
            commentMap.set(c._id, { ...c, children: [] })
        })

        // Second pass: link children to parents
        comments.forEach(c => {
            const comment = commentMap.get(c._id)!
            if (c.parentId && commentMap.has(c.parentId)) {
                commentMap.get(c.parentId)!.children!.push(comment)
            } else {
                roots.push(comment)
            }
        })

        return roots
    }

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-[#6366F1]" />
                </div>
            </AppLayout>
        )
    }

    if (error || !story) {
        return (
            <AppLayout>
                <div className="max-w-2xl mx-auto text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || "Story not found"}</p>
                    <Button onClick={() => navigate('/feed')} variant="outline">
                        Back to Feed
                    </Button>
                </div>
            </AppLayout>
        )
    }

    const commentTree = getCommentTree(story.comments || [])

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/feed')}
                        className="hover:bg-transparent hover:text-[#6366F1] pl-0 gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Feed
                    </Button>

                    {user && story.author._id === user.id && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="gap-2 rounded-xl">
                                    <Trash2 className="w-4 h-4" />
                                    Delete Story
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border-3 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold">Delete this story?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-600">
                                        This action cannot be undone. This will permanently delete your story and all associated comments.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl border-2 border-black font-bold hover:bg-gray-100">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 border-2 border-transparent"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                <div className="bg-white border-3 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    {/* Header */}
                    <div className="p-8 border-b-2 border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-3 border-black flex items-center justify-center text-white font-bold text-2xl overflow-hidden cursor-pointer"
                                onClick={() => navigate(`/user/${story.author.username || story.author._id}`)}
                            >
                                {story.author.avatar ? (
                                    <img src={story.author.avatar} alt={story.author.name} className="w-full h-full object-cover" />
                                ) : (
                                    story.author.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-1">{story.title}</h1>
                                <div className="flex items-center gap-2 text-gray-500 font-medium">
                                    <span
                                        className="hover:underline cursor-pointer text-black"
                                        onClick={() => navigate(`/user/${story.author.username || story.author._id}`)}
                                    >
                                        {story.author.name}
                                    </span>
                                    {story.author.username && (
                                        <span
                                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                            onClick={() => navigate(`/user/${story.author.username}`)}
                                        >
                                            @{story.author.username}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span>{story.author.college || 'Student'}</span>
                                    <span>•</span>
                                    <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {story.tags && story.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {story.tags.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-600 border border-black">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-8">
                        {/* Content */}
                        <div className="prose max-w-none mb-8 text-xl text-gray-800 whitespace-pre-wrap leading-relaxed break-words">
                            <ReactMarkdown>
                                {story.content}
                            </ReactMarkdown>
                        </div>

                        {/* Attachments */}
                        {(story.images?.length > 0 || story.attachments?.length > 0) && (
                            <div className="mb-8">
                                {/* Media Carousel (Images & Videos) */}
                                {(() => {
                                    // Use attachments if available, otherwise fall back to images array
                                    const allFiles = story.attachments?.map((att: any) => ({
                                        url: att.url,
                                        name: att.originalName,
                                        type: att.mimeType
                                    })) || story.images?.map((url: string) => ({
                                        url,
                                        name: '',
                                        type: ''
                                    })) || [];

                                    const mediaFiles = allFiles.filter((file: any) => {
                                        const ext = file.url.split('.').pop()?.toLowerCase() || '';
                                        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'].includes(ext);
                                    });

                                    const documentFiles = allFiles.filter((file: any) => {
                                        const ext = file.url.split('.').pop()?.toLowerCase() || '';
                                        return !['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'].includes(ext);
                                    });

                                    return (
                                        <>
                                            {/* Carousel */}
                                            {mediaFiles.length > 0 && (
                                                <div className="relative rounded-3xl overflow-hidden border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-black mb-8 group">
                                                    <div className="aspect-[4/3] md:aspect-[16/9] flex items-center justify-center bg-black">
                                                        {(() => {
                                                            const file = mediaFiles[currentImageIndex];
                                                            const ext = file.url.split('.').pop()?.toLowerCase() || '';
                                                            const isVideo = ['mp4', 'webm', 'mov'].includes(ext);

                                                            if (isVideo) {
                                                                return (
                                                                    <video
                                                                        key={file.url}
                                                                        controls
                                                                        className="w-full h-full object-contain"
                                                                    >
                                                                        <source src={file.url} />
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                );
                                                            } else {
                                                                return (
                                                                    <img
                                                                        src={file.url}
                                                                        alt={`Slide ${currentImageIndex + 1}`}
                                                                        className="w-full h-full object-contain"
                                                                    />
                                                                );
                                                            }
                                                        })()}
                                                    </div>

                                                    {/* Navigation Arrows */}
                                                    {mediaFiles.length > 1 && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCurrentImageIndex(prev => (prev === 0 ? mediaFiles.length - 1 : prev - 1));
                                                                }}
                                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center border-2 border-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                            >
                                                                <ChevronLeft className="w-6 h-6" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCurrentImageIndex(prev => (prev === mediaFiles.length - 1 ? 0 : prev + 1));
                                                                }}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center border-2 border-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                            >
                                                                <ChevronRight className="w-6 h-6" />
                                                            </button>

                                                            {/* Dots Indicator */}
                                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                                                {mediaFiles.map((_: any, idx: number) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`w-2.5 h-2.5 rounded-full border border-white/50 transition-all ${idx === currentImageIndex ? 'bg-white scale-110' : 'bg-white/40'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Document Attachments */}
                                            {documentFiles.length > 0 && (
                                                <div className="grid grid-cols-1 gap-3">
                                                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                                        <FileText className="w-5 h-5" />
                                                        Attachments
                                                    </h3>
                                                    {documentFiles.map((file: any, index: number) => {
                                                        let extension = '';
                                                        try {
                                                            const urlObj = new URL(file.url);
                                                            extension = urlObj.pathname.split('.').pop()?.toLowerCase() || '';
                                                        } catch (e) {
                                                            extension = file.url.split('.').pop()?.toLowerCase() || '';
                                                        }

                                                        return (
                                                            <a
                                                                key={index}
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-black rounded-xl hover:bg-gray-100 transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group"
                                                            >
                                                                <div className="w-12 h-12 bg-white border-2 border-gray-200 group-hover:border-black rounded-lg flex items-center justify-center transition-colors">
                                                                    <span className="font-bold text-xs uppercase text-gray-700">{extension || 'FILE'}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-sm truncate text-gray-800 group-hover:text-black">
                                                                        {file.name || `Attachment ${index + 1}`}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 uppercase font-medium">{extension} Document</p>
                                                                </div>
                                                                <Button variant="ghost" size="sm" className="shrink-0 text-gray-500 group-hover:text-black">
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                    Download
                                                                </Button>
                                                            </a>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between py-6 border-t-2 border-b-2 border-gray-100">
                            <div className="flex items-center gap-6">
                                <Button
                                    variant="ghost"
                                    onClick={handleLike}
                                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl h-12 px-4 transition-all"
                                >
                                    <Heart className={`w-6 h-6 ${story.reactions?.users?.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
                                    <span className="font-bold text-lg">{story.reactions?.hearts || 0}</span>
                                </Button>
                                <Button variant="ghost" className="flex items-center gap-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl h-12 px-4">
                                    <MessageCircle className="w-6 h-6" />
                                    <span className="font-bold text-lg">{story.comments?.length || 0}</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={handleShare}
                                    className="flex items-center gap-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-xl h-12 px-4"
                                >
                                    <Share2 className="w-6 h-6" />
                                    <span className="font-bold text-lg">Share</span>
                                </Button>
                            </div>
                            <Button variant="ghost" className="text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl h-12 w-12 p-0">
                                <Bookmark className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-8">
                            <h3 className="text-2xl font-bold mb-6">Comments ({story.comments?.length || 0})</h3>

                            {/* Add Main Comment */}
                            <div className="flex gap-4 mb-8">
                                <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-black flex-shrink-0">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold">
                                            {user?.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="min-h-[100px] border-2 border-gray-200 focus:border-black rounded-xl mb-4 text-lg"
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => handleComment()}
                                            disabled={!commentText.trim() || isSubmittingComment}
                                            className="bg-black text-white hover:bg-gray-900 rounded-xl font-bold px-6"
                                        >
                                            {isSubmittingComment ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Send className="w-4 h-4 mr-2" />
                                            )}
                                            Post Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Comment List */}
                            <div className="space-y-6">
                                {commentTree.length > 0 ? (
                                    commentTree.map((comment) => (
                                        <CommentItem
                                            key={comment._id}
                                            comment={comment}
                                            replyingTo={replyingTo}
                                            setReplyingTo={setReplyingTo}
                                            replyText={replyText}
                                            setReplyText={setReplyText}
                                            handleComment={handleComment}
                                            isSubmittingComment={isSubmittingComment}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        No comments yet. Be the first to share your thoughts!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </AppLayout >
    )
}

interface CommentItemProps {
    comment: Comment
    depth?: number
    replyingTo: string | null
    setReplyingTo: (id: string | null) => void
    replyText: string
    setReplyText: (text: string) => void
    handleComment: (parentId?: string) => void
    isSubmittingComment: boolean
}

const CommentItem = ({
    comment,
    depth = 0,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    handleComment,
    isSubmittingComment
}: CommentItemProps) => (
    <div className={`flex gap-4 ${depth > 0 ? 'mt-4' : ''}`}>
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-black flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
                {comment.user?.avatar ? (
                    <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
                ) : (
                    comment.user?.name?.charAt(0) || 'U'
                )}
            </div>
            {depth > 0 && <div className="w-0.5 flex-1 bg-gray-200 my-2"></div>}
        </div>

        <div className="flex-1">
            <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span
                            className="font-bold cursor-pointer hover:underline"
                            onClick={() => window.location.href = `/user/${comment.user?.username || comment.user?._id}`}
                        >
                            {comment.user?.name || 'User'}
                        </span>
                        {comment.user?.username && (
                            <span
                                className="text-xs text-gray-500 cursor-pointer hover:text-gray-700"
                                onClick={() => window.location.href = `/user/${comment.user.username}`}
                            >
                                @{comment.user.username}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <p className="text-gray-700">{comment.text}</p>

                <button
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                    className="text-sm font-bold text-gray-500 hover:text-black mt-2 flex items-center gap-1"
                >
                    <MessageCircle className="w-3 h-3" /> Reply
                </button>
            </div>

            {replyingTo === comment._id && (
                <div className="mt-4 flex gap-3 ml-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full border border-gray-300 flex items-center justify-center">
                        <CornerDownRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to ${comment.user?.name}...`}
                            className="min-h-[80px] border-2 border-gray-200 focus:border-black rounded-xl mb-2 text-sm"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setReplyingTo(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleComment(comment._id)}
                                disabled={!replyText.trim() || isSubmittingComment}
                                className="bg-black text-white hover:bg-gray-900 rounded-lg font-bold"
                            >
                                {isSubmittingComment ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reply'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {comment.children && comment.children.length > 0 && (
                <div className="mt-4">
                    {comment.children.map(child => (
                        <CommentItem
                            key={child._id}
                            comment={child}
                            depth={depth + 1}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            handleComment={handleComment}
                            isSubmittingComment={isSubmittingComment}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
)
