import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { Link } from 'react-router-dom';
import { Search, CalendarDays, FileText, ArrowRight, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '../../services/api';
import { type Appointment } from '../../types/appointment';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    api.get('/patient/appointments')
      .then(res => { if (res.data.success) setAppointments(res.data.data || []); })
      .catch((err: unknown) => {
        console.error('Failed to load appointments for dashboard:', err);
      });
  }, []);

  const upcoming = appointments.filter(a => a.status === 'CONFIRMED');

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
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-orange-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <Card className="rounded-3xl border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all group overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-orange-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity"/>
          <CardHeader>
            <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-4">
              <CalendarDays className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Appointments</CardTitle>
            <CardDescription className="text-zinc-500 text-sm leading-relaxed">
              Manage your upcoming visits and join secure video consultations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming.length > 0 ? (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center mb-3">
                <p className="text-sm font-extrabold text-primary">{upcoming.length} upcoming appointment{upcoming.length !== 1 ? 's' : ''}</p>
              </div>
            ) : (
              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-center mb-3">
                <p className="text-sm font-semibold text-zinc-500">No upcoming appointments</p>
              </div>
            )}
            <Button asChild className="w-full bg-primary hover:bg-orange-600 font-bold rounded-xl group-hover:translate-x-1 transition-transform">
              <Link to="/patient-dashboard/appointments">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Records Card */}
        <Card className="rounded-3xl border-zinc-200 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all group overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-orange-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Health Profile</CardTitle>
            <CardDescription className="text-zinc-500 text-sm leading-relaxed">
              Update your medical details, allergies list, emergency contacts, and history.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild className="w-full bg-primary hover:bg-orange-600 font-bold rounded-xl mt-2 group-hover:translate-x-1 transition-transform">
               <Link to="/patient-dashboard/profile">
                 Edit Health Profile <ArrowRight className="ml-2 h-4 w-4" />
               </Link>
             </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default PatientDashboard;
