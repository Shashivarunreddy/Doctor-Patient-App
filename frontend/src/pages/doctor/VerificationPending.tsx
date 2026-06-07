import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { 
  ShieldCheck, CheckCircle2, AlertCircle, Clock, Lock, 
  LogOut, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const VerificationPending: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  // If approved, send to doctor workspace
  useEffect(() => {
    if (user?.doctorProfile?.approvalStatus === 'PHASE2_APPROVED') {
      navigate('/doctor-dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleRefreshStatus = async () => {
    setChecking(true);
    try {
      await refreshUser();
    } catch (err) {
      console.error('Failed to refresh status:', err);
    } finally {
      // Simulate delay for smooth UX
      setTimeout(() => setChecking(false), 800);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden font-sans">
      
      {/* Background Graphic Patterns */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-400/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-400/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      <div className="w-full max-w-xl mx-4 p-8 sm:p-12 bg-white rounded-3xl shadow-2xl border border-zinc-200/50 relative z-10 text-center space-y-8">
        
        {/* Floating Animated Badge */}
        <div className="mx-auto w-28 h-28 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm relative">
          <div className="absolute inset-0 rounded-full bg-orange-200/30 animate-ping opacity-75" style={{ animationDuration: '2.5s' }} />
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ShieldCheck className="h-10 w-10" />
          </div>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-primary border border-orange-100">
            <Clock size={12} className="animate-spin" style={{ animationDuration: '3s' }} /> Under Review
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Documents Under Review
          </h1>
          <p className="text-zinc-500 font-medium">
            Please wait for administrator verification.
          </p>
        </div>

        {/* Steps Status Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-left space-y-5 shadow-sm">
          
          {/* Step 1 */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-200 shrink-0">
              <CheckCircle2 size={18} className="stroke-[2.5]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-zinc-900 text-sm">Account Verified</h4>
              <p className="text-zinc-500 text-xs font-medium">Your basic account credentials have been approved.</p>
            </div>
          </div>

          <div className="h-px bg-zinc-100" />

          {/* Step 2 */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-200 shrink-0">
              <CheckCircle2 size={18} className="stroke-[2.5]" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-zinc-900 text-sm">Details Submitted</h4>
              <p className="text-zinc-500 text-xs font-medium">License, specializations, and fee details are received.</p>
            </div>
          </div>

          <div className="h-px bg-zinc-100" />

          {/* Step 3 */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-primary border border-orange-200 shrink-0 relative">
              <Clock size={18} className="animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-zinc-900 text-sm">Under Verification</h4>
              <p className="text-zinc-500 text-xs font-medium">Our validation team is verifyng your medical credentials. This takes 24–48 hours.</p>
            </div>
          </div>

          <div className="h-px bg-zinc-100" />

          {/* Step 4 */}
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 border border-zinc-200 shrink-0">
              <Lock size={16} />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-zinc-500 text-sm">Practice Access</h4>
              <p className="text-zinc-400 text-xs font-medium">Once approved, you will have access to slot settings and consultations.</p>
            </div>
          </div>

        </div>

        {/* Notice Banner */}
        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex gap-3 items-start text-left">
          <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-primary font-medium leading-relaxed">
            You will be notified via email once the review is completed. If you think there's a delay, you can refresh your status below or contact support.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleRefreshStatus}
            disabled={checking}
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold border-zinc-300 text-zinc-700 hover:bg-zinc-50 active:scale-98"
          >
            <RefreshCw size={16} className={`mr-2 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : 'Check Status'}
          </Button>

          <Button 
            onClick={handleLogout}
            variant="destructive"
            className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200/50 active:scale-98"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>

      </div>
    </div>
  );
};

export default VerificationPending;
