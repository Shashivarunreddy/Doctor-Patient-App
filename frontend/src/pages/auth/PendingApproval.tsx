import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PendingApproval: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name || 'Doctor';

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden font-sans">
      {/* Dynamic colorful blur backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-400/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />

      <div className="w-full max-w-xl mx-4 p-8 sm:p-12 bg-white rounded-3xl shadow-2xl border border-zinc-200/50 relative z-10 text-center space-y-8">
        
        {/* Icon wrapper */}
        <div className="mx-auto w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm relative group">
          <div className="absolute inset-0 rounded-full bg-orange-200/40 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
          <Clock className="h-12 w-12 text-primary relative z-10" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-primary border border-orange-100">
            <ShieldAlert size={12} /> Account Verification
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Account Pending Approval
          </h1>
          <p className="text-zinc-500 font-medium">
            Thank you for registering as a doctor on <span className="text-zinc-800 font-semibold">Docco360</span>, Dr. {name}.
          </p>
        </div>

        <div className="bg-zinc-50/50 rounded-2xl p-6 border border-zinc-150 text-left space-y-4">
          <p className="text-zinc-600 text-sm leading-relaxed">
            Your application is currently under review by our administration team. This is to ensure all credentials and practice details are verified.
          </p>
          <p className="text-zinc-500 text-xs leading-relaxed border-t border-zinc-200/80 pt-4">
            * This step typically takes <strong>1–2 business days</strong>. You will receive an email confirmation once your account has been approved and unlocked.
          </p>
        </div>

        <div className="pt-2">
          <Button 
            onClick={() => navigate('/login', { replace: true })} 
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-98"
          >
            Back to Login <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default PendingApproval;
