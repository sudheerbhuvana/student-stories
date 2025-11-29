import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export function NotFoundPage() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8 relative inline-block">
                    <h1 className="text-9xl font-black text-gray-200 select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold bg-white px-4 py-2 border-3 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-6">
                            Oops!
                        </span>
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8 text-lg">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/">
                        <Button className="w-full sm:w-auto h-12 px-8 bg-black text-white hover:bg-gray-800 rounded-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                    <button onClick={() => window.history.back()}>
                        <Button variant="outline" className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-gray-50 rounded-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </button>
                </div>
            </div>
        </div>
    )
}
