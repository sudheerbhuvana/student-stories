import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const validateForm = () => {
        const newErrors = { email: '', password: '' };
        let isValid = true;

        if (!formData.email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            logger.warn('LoginPage', 'Form validation failed');
            return;
        }

        setLoading(true);
        logger.info('LoginPage', 'Attempting login', { email: formData.email });

        try {
            await login(formData.email, formData.password);
            logger.info('LoginPage', 'Login successful');
            navigate('/feed');
        } catch (err: any) {
            logger.error('LoginPage', 'Login failed', err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        logger.userAction('LoginPage', 'Social login clicked', { provider });
        setError('Social login not yet implemented');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FF6B6B] via-[#6366F1] to-[#2F81F7] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="w-10 h-10 bg-white rounded-full"></div>
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
                    <p className="text-white/90">Login to StudentStories</p>
                </div>

                <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="your@email.com"
                                    className="pl-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={loading}
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 h-14 border-3 border-black rounded-xl text-base"
                                    disabled={loading}
                                    autoComplete="current-password"
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

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={formData.rememberMe}
                                    onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                                    id="remember"
                                />
                                <label htmlFor="remember" className="text-sm font-medium cursor-pointer">
                                    Remember me
                                </label>
                            </div>
                            <Link to="/forgot-password" className="text-sm font-bold text-[#6366F1] hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-black text-white hover:bg-gray-900 rounded-xl text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleSocialLogin('google')}
                                className="h-12 border-3 border-black rounded-xl font-bold hover:bg-gray-50"
                                disabled={loading}
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
                                onClick={() => handleSocialLogin('github')}
                                className="h-12 border-3 border-black rounded-xl font-bold hover:bg-gray-50"
                                disabled={loading}
                            >
                                <Github className="w-5 h-5 mr-2" />
                                GitHub
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link to="/signup" className="font-bold text-[#6366F1] hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
