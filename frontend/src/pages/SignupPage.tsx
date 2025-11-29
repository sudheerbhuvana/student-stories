import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, User, Github, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { logger } from "@/lib/logger"
import { authAPI } from "@/lib/api"
import { toast } from "sonner"

export function SignupPage() {
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [agreeToTerms, setAgreeToTerms] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)

    // OTP State
    const [showOTP, setShowOTP] = useState(false)
    const [otp, setOtp] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        logger.componentMount('SignupPage')
        return () => logger.componentUnmount('SignupPage')
    }, [])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Name is required"
        }

        if (!formData.username.trim()) {
            newErrors.username = "Username is required"
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters"
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = "Username can only contain letters, numbers, and underscores"
        }

        if (!formData.email) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid"
        }

        if (!formData.password) {
            newErrors.password = "Password is required"
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        if (!agreeToTerms) {
            newErrors.terms = "You must agree to the terms and conditions"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        logger.userAction('SignupPage', 'Signup form submitted', {
            name: formData.name,
            email: formData.email
        })

        if (validateForm()) {
            setIsLoading(true)
            try {
                await authAPI.register({
                    username: formData.username,
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
                logger.info('SignupPage', 'Registration successful, showing OTP')
                toast.success("Registration successful! Please check your email for the OTP.")
                setShowOTP(true)
            } catch (error: any) {
                logger.error('SignupPage', 'Registration failed', error)
                toast.error(error.response?.data?.message || "Registration failed")
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP")
            return
        }

        setIsVerifying(true)
        try {
            await authAPI.verifyEmail(formData.email, otp)
            toast.success("Email verified successfully!")
            navigate('/login')
        } catch (error: any) {
            logger.error('SignupPage', 'OTP verification failed', error)
            toast.error(error.response?.data?.message || "Invalid OTP")
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResendOTP = async () => {
        try {
            await authAPI.resendOTP(formData.email)
            toast.success("OTP resent successfully!")
        } catch (error: any) {
            toast.error("Failed to resend OTP")
        }
    }

    const handleSocialSignup = (provider: string) => {
        logger.userAction('SignupPage', `Social signup clicked`, { provider })
        // Handle social signup
    }

    if (showOTP) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FFC224] via-[#FF6B7A] to-[#6366F1] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white border-4 border-black rounded-3xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-center mb-8">
                        <div className="inline-block w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Check your email</h1>
                        <p className="text-gray-600">
                            We sent a verification code to <br />
                            <span className="font-bold text-black">{formData.email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Verification Code</label>
                            <Input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="h-14 text-center text-2xl tracking-widest border-3 border-black rounded-xl font-mono"
                                maxLength={6}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full h-14 bg-black text-white hover:bg-gray-900 rounded-xl text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all"
                        >
                            {isVerifying ? "Verifying..." : "Verify Email"}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                className="text-sm font-bold text-[#6366F1] hover:underline"
                            >
                                Resend Code
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFC224] via-[#FF6B7A] to-[#6366F1] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <div className="inline-block w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="w-10 h-10 bg-white rounded-full"></div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Join Paperfolio!</h1>
                    <p className="text-white/90">Create your account to get started</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Input */}
                        <div>
                            <label className="block text-sm font-bold mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => handleChange('username', e.target.value)}
                                    placeholder="johndoe"
                                    className="pl-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.username}</p>
                            )}
                        </div>

                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-bold mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="John Doe"
                                    className="pl-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.name}</p>
                            )}
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-bold mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="your@email.com"
                                    className="pl-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-bold mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className="block text-sm font-bold mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Terms and Conditions */}
                        <div>
                            <div className="flex items-start gap-2">
                                <Checkbox
                                    checked={agreeToTerms}
                                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                                    id="terms"
                                    className="mt-1"
                                    disabled={isLoading}
                                />
                                <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                                    I agree to the{" "}
                                    <Link to="/terms" className="text-[#6366F1] hover:underline">
                                        Terms and Conditions
                                    </Link>{" "}
                                    and{" "}
                                    <Link to="/privacy" className="text-[#6366F1] hover:underline">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {errors.terms && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.terms}</p>
                            )}
                        </div>

                        {/* Signup Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-black text-white hover:bg-gray-900 rounded-xl text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all"
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with</span>
                            </div>
                        </div>

                        {/* Social Signup */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleSocialSignup('google')}
                                className="h-12 border-3 border-black rounded-xl font-bold hover:bg-gray-50"
                                disabled={isLoading}
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleSocialSignup('github')}
                                className="h-12 border-3 border-black rounded-xl font-bold hover:bg-gray-50"
                                disabled={isLoading}
                            >
                                <Github className="w-5 h-5 mr-2" />
                                GitHub
                            </Button>
                        </div>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="font-bold text-[#6366F1] hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
