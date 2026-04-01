import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, CalendarDays, FileText, ArrowRight, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PatientDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-[100px] pointer-events-none opacity-50" />
        <div className="relative z-10 flex items-center gap-6">
           <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
             <Activity className="h-8 w-8" />
           </div>
           <div>
             <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Patient Overview</h1>
             <p className="text-zinc-500 mt-1">Welcome back, <span className="font-semibold text-zinc-800">{user?.name}</span>. Here is your health summary.</p>
           </div>
        </div>
        <div className="relative z-10 flex items-center gap-3 bg-zinc-50 px-5 py-3 rounded-full border border-zinc-200">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-zinc-700">Account Active</span>
        </div>
      </div>
      
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Find Doctor Card */}
        <Card className="rounded-3xl border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all group overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-4">
              <Search className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Find a Specialist</CardTitle>
            <CardDescription className="text-zinc-500 text-sm leading-relaxed">
              Browse our verified directory of top-tier medical professionals and book instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-primary hover:bg-orange-600 font-bold rounded-xl mt-2 group-hover:translate-x-1 transition-transform">
              <Link to="/patient-dashboard/doctors">
                Search Directory <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Appointments Card */}
        <Card className="rounded-3xl border-zinc-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
          <CardHeader>
            <div className="bg-zinc-100 w-12 h-12 rounded-xl flex items-center justify-center text-zinc-600 mb-4">
              <CalendarDays className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Appointments</CardTitle>
            <CardDescription className="text-zinc-500 text-sm leading-relaxed">
              Manage your upcoming visits and ongoing secure video consultations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-center">
               <p className="text-sm font-semibold text-zinc-500">No appointments scheduled</p>
            </div>
          </CardContent>
        </Card>

        {/* Records Card */}
        <Card className="rounded-3xl border-zinc-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
          <CardHeader>
            <div className="bg-zinc-100 w-12 h-12 rounded-xl flex items-center justify-center text-zinc-600 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Medical Records</CardTitle>
            <CardDescription className="text-zinc-500 text-sm leading-relaxed">
              Securely access your prescriptions, notes, and lab reports sent by doctors.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button variant="outline" className="w-full text-zinc-600 border-zinc-200 hover:bg-zinc-50 font-bold rounded-xl mt-2">
               View Vault
             </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default PatientDashboard;
