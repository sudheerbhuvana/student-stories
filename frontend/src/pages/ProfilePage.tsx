import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { StoryCard } from "@/components/story-card"
import { userAPI, storyAPI } from "@/lib/api"
import { logger } from "@/lib/logger"
import { Loader2, MapPin, Calendar, BookOpen, Mail, Linkedin, Github, Globe, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate, useParams } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export function ProfilePage() {
    const navigate = useNavigate()
    const { username } = useParams()
    const { user: currentUser, setUser: setCurrentUser } = useAuth()
    const [user, setUser] = useState<any>(null)
    const [stories, setStories] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    // Edit Profile State
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editForm, setEditForm] = useState({
        name: "",
        username: "",
        bio: "",
        college: "",
        major: "",
        linkedin: "",
        github: "",
        portfolio: "",
        twitter: ""
    })

    useEffect(() => {
        fetchProfileAndStories()
    }, [username]) // Re-fetch when username changes

    const fetchProfileAndStories = async () => {
        try {
            setIsLoading(true)
            let userData;

            if (username) {
                // Fetch public profile by username
                const userResponse = await userAPI.getUserByUsername(username)
                userData = userResponse.data.user
            } else {
                // Fetch current user profile
                const userResponse = await userAPI.getProfile()
                userData = userResponse.data.user
            }

            setUser(userData)

            // Initialize edit form if it's the current user
            if (!username || (currentUser && currentUser.id === userData._id)) {
                setEditForm({
                    name: userData.name || "",
                    username: userData.username || "",
                    bio: userData.bio || "",
                    college: userData.college || "",
                    major: userData.major || "",
                    linkedin: userData.linkedin || "",
                    github: userData.github || "",
                    portfolio: userData.portfolio || "",
                    twitter: userData.twitter || ""
                })
            }

            // Fetch user's stories
            const storiesResponse = await storyAPI.getStories({ author: userData._id })
            setStories(storiesResponse.data.stories)

            logger.info('ProfilePage', 'Profile and stories fetched successfully', { userId: userData._id, storyCount: storiesResponse.data.count })
        } catch (err) {
            logger.error('ProfilePage', 'Failed to fetch profile or stories', err)
            setError("Failed to load profile. Please try again later.")
        } finally {
            setIsLoading(false)
        }
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

    if (error || !user) {
        return (
            <AppLayout>
                <div className="max-w-2xl mx-auto text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || "Profile not found"}</p>
                    <Button onClick={() => navigate('/feed')} variant="outline">
                        Back to Feed
                    </Button>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white border-3 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-8">
                    <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 border-b-3 border-black"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="w-24 h-24 bg-white rounded-full border-3 border-black p-1">
                                <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold text-gray-500">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
                                </div>
                            </div>

                            {/* Edit Profile Button - Only show if viewing own profile */}
                            {(!username || (currentUser && currentUser.id === user._id)) && (
                                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="border-2 border-black font-bold">
                                            Edit Profile
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
                                            <DialogDescription>
                                                Make changes to your profile here. Click save when you're done.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name" className="font-bold">Name</Label>
                                                <Input
                                                    id="name"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="border-2 border-black rounded-xl"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="username" className="font-bold">Username</Label>
                                                <Input
                                                    id="username"
                                                    value={editForm.username}
                                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                    className="border-2 border-black rounded-xl"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="bio" className="font-bold">Bio</Label>
                                                <Textarea
                                                    id="bio"
                                                    value={editForm.bio}
                                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                                    className="border-2 border-black rounded-xl min-h-[100px]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="college" className="font-bold">College</Label>
                                                    <Input
                                                        id="college"
                                                        value={editForm.college}
                                                        onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                                                        className="border-2 border-black rounded-xl"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="major" className="font-bold">Major</Label>
                                                    <Input
                                                        id="major"
                                                        value={editForm.major}
                                                        onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                                                        className="border-2 border-black rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="linkedin" className="font-bold">LinkedIn URL</Label>
                                                    <Input
                                                        id="linkedin"
                                                        value={editForm.linkedin}
                                                        onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                                                        className="border-2 border-black rounded-xl"
                                                        placeholder="https://linkedin.com/in/..."
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="github" className="font-bold">GitHub URL</Label>
                                                    <Input
                                                        id="github"
                                                        value={editForm.github}
                                                        onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                                                        className="border-2 border-black rounded-xl"
                                                        placeholder="https://github.com/..."
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="portfolio" className="font-bold">Personal Website</Label>
                                                    <Input
                                                        id="portfolio"
                                                        value={editForm.portfolio}
                                                        onChange={(e) => setEditForm({ ...editForm, portfolio: e.target.value })}
                                                        className="border-2 border-black rounded-xl"
                                                        placeholder="https://yourwebsite.com"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="twitter" className="font-bold">Twitter URL</Label>
                                                    <Input
                                                        id="twitter"
                                                        value={editForm.twitter}
                                                        onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                                                        className="border-2 border-black rounded-xl"
                                                        placeholder="https://twitter.com/..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-2 border-black font-bold">
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={async () => {
                                                    try {
                                                        setIsSaving(true)
                                                        const response = await userAPI.updateProfile(editForm)
                                                        setUser(response.data.user)
                                                        setCurrentUser((prev: any) => ({ ...prev, ...response.data.user }))
                                                        setIsEditOpen(false)
                                                        toast.success("Profile updated successfully!")
                                                    } catch (err: any) {
                                                        toast.error(err.response?.data?.message || "Failed to update profile")
                                                    } finally {
                                                        setIsSaving(false)
                                                    }
                                                }}
                                                disabled={isSaving}
                                                className="bg-black text-white hover:bg-gray-900 border-2 border-black font-bold"
                                            >
                                                {isSaving ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                            <p className="text-gray-600 mb-4 max-w-2xl">{user.bio || "No bio yet."}</p>

                            <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
                                {user.college && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {user.college}
                                    </div>
                                )}
                                {user.major && (
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="w-4 h-4" />
                                        {user.major}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {user.email}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {new Date().getFullYear()} {/* Assuming createdAt is not available on user object for now, or use a default */}
                                </div>
                            </div>

                            {/* Social Media Links */}
                            <div className="flex gap-4 mt-4">
                                {user.linkedin && (
                                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0077b5] transition-colors">
                                        <Linkedin className="w-6 h-6" />
                                    </a>
                                )}
                                {user.github && (
                                    <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors">
                                        <Github className="w-6 h-6" />
                                    </a>
                                )}
                                {user.portfolio && (
                                    <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors">
                                        <Globe className="w-6 h-6" />
                                    </a>
                                )}
                                {user.twitter && (
                                    <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1DA1F2] transition-colors">
                                        <Twitter className="w-6 h-6" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User's Stories */}
                <h2 className="text-2xl font-bold mb-6">My Stories ({stories.length})</h2>

                {
                    stories.length === 0 ? (
                        <div className="text-center py-12 bg-white border-3 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-xl font-bold mb-2">No stories yet</h3>
                            <p className="text-gray-500 mb-6">You haven't shared any stories yet.</p>
                            <Button
                                onClick={() => navigate('/create')}
                                className="bg-black text-white hover:bg-gray-900 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]"
                            >
                                Create Story
                            </Button>
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
                    )
                }
            </div >
        </AppLayout >
    )
}
