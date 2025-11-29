import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { StoryCard } from "@/components/story-card"
import { storyAPI } from "@/lib/api"
import { logger } from "@/lib/logger"
import { Loader2, PenSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"

export function FeedPage() {
    const navigate = useNavigate()
    const [stories, setStories] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchStories()
    }, [])

    const fetchStories = async () => {
        try {
            setIsLoading(true)
            const response = await storyAPI.getStories({})
            setStories(response.data.stories) // API returns { success: true, stories: [...] }
            logger.info('FeedPage', 'Stories fetched successfully', { count: response.data.count })
        } catch (err) {
            logger.error('FeedPage', 'Failed to fetch stories', err)
            setError("Failed to load stories. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto">
                {/* Create Post Prompt */}
                <div className="bg-white border-3 border-black rounded-2xl p-4 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-black"></div>
                    <Link to="/create" className="flex-1">
                        <div className="bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2 text-gray-500 font-medium transition-colors cursor-pointer">
                            Share your story...
                        </div>
                    </Link>
                    <Link to="/create">
                        <Button size="icon" className="bg-[#6366F1] hover:bg-[#5558DD] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <PenSquare className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>

                {/* Feed Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-[#6366F1]" />
                        <p className="mt-4 font-bold text-gray-500">Loading stories...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-red-50 rounded-2xl border-2 border-red-100">
                        <p className="text-red-500 font-bold">{error}</p>
                        <Button
                            variant="outline"
                            className="mt-4 border-2 border-red-200 hover:bg-red-100"
                            onClick={fetchStories}
                        >
                            Try Again
                        </Button>
                    </div>
                ) : stories.length === 0 ? (
                    <div className="text-center py-12 bg-white border-3 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-xl font-bold mb-2">No stories yet!</h3>
                        <p className="text-gray-500 mb-6">Be the first one to share your journey.</p>
                        <Link to="/create">
                            <Button className="bg-black text-white hover:bg-gray-900 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]">
                                Create Story
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {stories.map((story) => (
                            <StoryCard
                                key={story._id}
                                story={story}
                                onClick={() => navigate(`/story/${story._id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
