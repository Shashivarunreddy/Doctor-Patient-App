import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Video, Activity, Loader2, Hospital } from 'lucide-react';
import { Role } from '../../types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: Role.PATIENT as Role
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await authService.register(formData);
      if (res.success && res.data) {
        login(res.data.user, res.data.accessToken, res.data.refreshToken);
        navigate('/');
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errMap = err.response.data.errors;
        const msg = Object.values(errMap).join(', ');
        setError(msg);
      } else {
        setError(err.response?.data?.message || 'Failed to register');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />

      <div className="container relative z-10 flex w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/50 bg-white min-h-[700px] my-10">
        
        {/* Left Side: Hero Information */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-50 p-12 text-zinc-900 border-r border-zinc-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+Cgk8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9Im5vbmUiLz4KCTxwb2x5Z29uIHBvaW50cz0iMjAsMjAgMCwyMCAwLDAiIGZpbGw9IiNmOWNhMjQiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPgo8L3N2Zz4=')] opacity-20 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-16 text-primary">
              <Activity className="h-8 w-8" />
              <span className="text-2xl font-bold tracking-tight text-zinc-900">Docco360.</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight text-zinc-900">
              A new era of<br />connected health.
            </h1>
            <p className="text-lg text-zinc-600 max-w-md leading-relaxed font-medium">
              Start your journey with Docco360. Designed for seamless interactions and powerful insights.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
              <div className="p-3 bg-orange-100/50 text-primary rounded-full">
                <Hospital className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900">Smart Matchmaking</h4>
                <p className="text-zinc-500 text-sm">Find top tier specialists instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white overflow-y-auto max-h-[90vh] lg:max-h-none">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Create account</h2>
              <p className="text-zinc-500 mt-2">Enter your details to register as a new user.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-zinc-700">Full Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="h-12 bg-white border-zinc-300 focus-visible:ring-primary rounded-xl"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-zinc-700">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="h-12 bg-white border-zinc-300 focus-visible:ring-primary rounded-xl"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-zinc-700">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                    className="h-12 bg-white border-zinc-300 focus-visible:ring-primary rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-zinc-700">Account Type</Label>
                  <div className="relative">
                    <select
                      id="role"
                      className="flex h-12 w-full appearance-none items-center justify-between rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-primary"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                    >
                      <option value={Role.PATIENT}>Patient</option>
                      <option value={Role.DOCTOR}>Doctor</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 mt-4">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign up for free
              </Button>
            </form>

            <div className="text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
