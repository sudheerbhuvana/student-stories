import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from "lucide-react"

interface StoryCardProps {
    story: {
        _id: string
        title: string
        content: string
        excerpt: string
        author: {
            _id: string
            name: string
            avatar?: string
            college?: string
            username?: string
        }
        images?: string[]
        reactions: {
            hearts: number
            users: string[]
        }
        comments: any[]
        createdAt: string
        tags?: string[]
    }
    onClick?: () => void
}

export function StoryCard({ story, onClick }: StoryCardProps) {
    return (
        <div
            onClick={onClick}
            className="bg-white border-3 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/user/${story.author.username || story.author._id}`;
                    }}
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-black flex items-center justify-center text-white font-bold overflow-hidden">
                        {story.author.avatar ? (
                            <img src={story.author.avatar} alt={story.author.name} className="w-full h-full object-cover" />
                        ) : (
                            story.author.name.charAt(0)
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm hover:underline">{story.author.name}</h3>
                        {story.author.username && (
                            <p className="text-xs text-gray-500 font-medium">@{story.author.username}</p>
                        )}
                        <p className="text-xs text-gray-400 font-medium">{story.author.college || 'Student'}</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-black">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-2 group-hover:text-[#6366F1] transition-colors">{story.title}</h2>
                <p className="text-gray-600 line-clamp-3 mb-4">{story.excerpt || story.content}</p>

                {(() => {
                    // Find the first valid image or video
                    const previewUrl = story.images?.find(url => {
                        const ext = url.split('.').pop()?.toLowerCase() || '';
                        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'].includes(ext);
                    });

                    if (previewUrl) {
                        const ext = previewUrl.split('.').pop()?.toLowerCase() || '';
                        const isVideo = ['mp4', 'webm', 'mov'].includes(ext);

                        return (
                            <div className="rounded-xl overflow-hidden border-2 border-black mb-4 aspect-video bg-gray-100 flex items-center justify-center bg-black">
                                {isVideo ? (
                                    <video
                                        src={previewUrl}
                                        className="w-full h-full object-contain"
                                        muted
                                        loop
                                        playsInline
                                        onMouseOver={e => e.currentTarget.play()}
                                        onMouseOut={e => e.currentTarget.pause()}
                                    />
                                ) : (
                                    <img
                                        src={previewUrl}
                                        alt={story.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* Tags */}
                {story.tags && story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {story.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600 border border-black">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer / Interactions */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group/like">
                        <Heart className="w-5 h-5 group-hover/like:fill-red-500" />
                        <span className="font-bold text-sm">{story.reactions?.hearts || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-bold text-sm">{story.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
                <button className="text-gray-400 hover:text-black">
                    <Bookmark className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
