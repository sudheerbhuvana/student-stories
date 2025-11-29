import { LogIn, UserPlus } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"
import { useEffect } from "react"

export function Navigation() {
  useEffect(() => {
    logger.componentMount('Navigation')
    return () => logger.componentUnmount('Navigation')
  }, [])

  const handleNavClick = (section: string) => {
    logger.userAction('Navigation', 'Navigate', { section })
  }

  const handleAuthClick = (type: 'login' | 'signup') => {
    logger.userAction('Navigation', `${type} button clicked`)
  }

  return (
    <div className="container mx-auto px-4 pt-8 pb-4">
      <nav className="flex items-center justify-between bg-white border-4 border-black rounded-xl px-5 py-3 max-w-7xl mx-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
          <span className="hidden sm:block font-bold text-lg">StudentStories</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <Link to="/" onClick={() => handleNavClick('home')} className="text-[18px] font-bold leading-[20px] hover:opacity-70 transition-opacity">
            Home
          </Link>
          <Link to="/about" onClick={() => handleNavClick('about')} className="text-[18px] font-bold leading-[20px] hover:opacity-70 transition-opacity">
            About
          </Link>
          <Link to="/contact" onClick={() => handleNavClick('contact')} className="text-[18px] font-bold leading-[20px] hover:opacity-70 transition-opacity">
            Contact
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Login Button */}
          <Link to="/login" onClick={() => handleAuthClick('login')}>
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 border-3 border-black rounded-lg px-4 h-10 font-bold hover:bg-gray-50"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Button>
          </Link>

          {/* Signup Button */}
          <Link to="/signup" onClick={() => handleAuthClick('signup')}>
            <Button className="flex items-center gap-2 bg-[#6366F1] text-white hover:bg-[#5558E3] border-3 border-black rounded-lg px-4 h-10 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Up</span>
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  )
}
