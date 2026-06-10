import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/useAuth';
import { ShieldCheck, Video, Activity, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Support both React Router's `state.from` and the `?returnTo=` query param
  // that api.ts injects when a 401 forces the user to re-login.
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo');
  const from = returnTo ? decodeURIComponent(returnTo) : (location.state?.from?.pathname || '/');
  const justRegistered = location.state?.registered === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        login(res.data.user, res.data.accessToken, res.data.refreshToken);
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden font-sans">
      {/* Background Graphic Pattern based on Spectra */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-400/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />

      <div className="container relative z-10 flex w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/50 bg-white min-h-175">
        
        {/* Left Side: Hero Information */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-50 border-r border-zinc-100 p-12 text-zinc-900 relative overflow-hidden">
          {/* Grid Pattern overlay for SaaS texture */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+Cgk8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9Im5vbmUiLz4KCTxwb2x5Z29uIHBvaW50cz0iMjAsMjAgMCwyMCAwLDAiIGZpbGw9IiNmOWNhMjQiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPgo8L3N2Zz4=')] opacity-20 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-16 text-primary">
              <Activity className="h-8 w-8" />
              <span className="text-2xl font-bold tracking-tight text-zinc-900">Docco360.</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight text-zinc-900">
              The Future of<br />Decision-Making<br />Made Simple
            </h1>
            <p className="text-lg text-zinc-600 max-w-md leading-relaxed">
              Crafted for doctors and patients alike, Docco360 offers an unrivaled innovative healthcare platform.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
              <div className="p-3 bg-orange-100/50 text-primary rounded-full">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900">Bank-Grade Security</h4>
                <p className="text-zinc-500 text-sm">HIPAA compliant patient data</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
              <div className="p-3 bg-orange-100/50 text-primary rounded-full">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900">High-Def Telehealth</h4>
                <p className="text-zinc-500 text-sm">Powered by modern WebRTC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
          <div className="w-full max-w-md space-y-10">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Sign in</h2>
              <p className="text-zinc-500 mt-2">Enter your credentials below to access your dashboard</p>
            </div>

            {justRegistered && (
              <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium">
                Account created successfully! Please sign in to continue.
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-700">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-white border-zinc-300 focus-visible:ring-primary rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-zinc-700">Password</Label>
                    <Link to="#" className="text-sm text-primary hover:underline font-medium">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 bg-white border-zinc-300 focus-visible:ring-primary rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="text-center text-sm text-zinc-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Sign up for free
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
