import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { StoryCard } from "@/components/story-card"
import { userAPI, storyAPI } from "@/lib/api"
import { logger } from "@/lib/logger"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from "react-router-dom"

export function ExplorePage() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("stories")
    const [stories, setStories] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [debouncedQuery, setDebouncedQuery] = useState("")

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        fetchResults()
    }, [debouncedQuery, activeTab])

    const fetchResults = async () => {
        setIsLoading(true)
        try {
            if (activeTab === "stories") {
                const response = await storyAPI.getStories({ search: debouncedQuery })
                setStories(response.data.stories)
            } else {
                const response = await userAPI.searchUsers(debouncedQuery)
                setUsers(response.data.users)
            }
        } catch (error) {
            logger.error('ExplorePage', 'Failed to fetch results', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-black mb-6">Explore</h1>

                    {/* Search Bar */}
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search stories, people, colleges..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-14 border-3 border-black rounded-2xl text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>

                    <Tabs defaultValue="stories" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-14 bg-white border-3 border-black rounded-xl p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
                            <TabsTrigger
                                value="stories"
                                className="h-full rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold text-lg transition-all"
                            >
                                Stories
                            </TabsTrigger>
                            <TabsTrigger
                                value="people"
                                className="h-full rounded-lg data-[state=active]:bg-black data-[state=active]:text-white font-bold text-lg transition-all"
                            >
                                People
                            </TabsTrigger>
                        </TabsList>

                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-10 h-10 animate-spin text-black" />
                            </div>
                        ) : (
                            <>
                                <TabsContent value="stories" className="mt-0">
                                    {stories.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500 text-lg">No stories found matching your search.</p>
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
                                </TabsContent>

                                <TabsContent value="people" className="mt-0">
                                    {users.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500 text-lg">No people found matching your search.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {users.map((user) => (
                                                <div
                                                    key={user._id}
                                                    onClick={() => navigate(user.username ? `/user/${user.username}` : '#')}
                                                    className="bg-white border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center gap-4"
                                                >
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full border-2 border-black overflow-hidden flex-shrink-0">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-lg truncate">{user.name}</h3>
                                                        {user.username && <p className="text-sm text-gray-500 truncate">@{user.username}</p>}
                                                        {(user.college || user.major) && (
                                                            <p className="text-sm text-gray-600 truncate mt-1">
                                                                {[user.major, user.college].filter(Boolean).join(' • ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </>
                        )}
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    )
}
