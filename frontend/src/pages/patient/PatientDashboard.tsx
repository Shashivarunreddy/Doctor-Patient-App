import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { Link } from 'react-router-dom';
import { Search, CalendarDays, FileText, ArrowRight, Activity } from 'lucide-react';
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

  const cards = [
    {
      id: 'find',
      icon: <Search size={18} />,
      label: 'Find a Specialist',
      desc: 'Browse our verified directory of top-tier medical professionals.',
      action: 'Search Directory',
      to: '/patient-dashboard/doctors',
      badge: null,
    },
    {
      id: 'appts',
      icon: <CalendarDays size={18} />,
      label: 'Appointments',
      desc: 'Manage your upcoming visits and join secure video consultations.',
      action: 'View All',
      to: '/patient-dashboard/appointments',
      badge: upcoming.length > 0 ? `${upcoming.length} upcoming` : null,
    },
    {
      id: 'profile',
      icon: <FileText size={18} />,
      label: 'Health Profile',
      desc: 'Update your medical details, allergies, and emergency contacts.',
      action: 'Edit Profile',
      to: '/patient-dashboard/profile',
      badge: null,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-[32px] text-black font-semibold leading-tight tracking-tight">
          Patient Overview
        </h2>
        <p className="text-sm text-[#555555] mt-1">
          Welcome back, <span className="text-black font-medium">{user?.name}</span>. Here is your health summary.
        </p>
      </div>

      {/* Status strip */}
      <div className="flex items-center gap-2 bg-white border border-[#e1e1e1] px-4 py-2.5 rounded w-fit text-sm">
        <Activity size={14} className="text-black" />
        <span className="text-[#555555] font-medium">Account Active</span>
        <span className="ml-2 w-1.5 h-1.5 bg-black rounded-full inline-block" />
      </div>

      {/* Quick-action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white border border-[#e1e1e1] rounded-sm p-5 hover:bg-[#fafafa] transition-colors group relative overflow-hidden flex flex-col"
          >
            {/* Top row: label + icon */}
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">
                {card.label}
              </span>
              <div className="w-6 h-6 flex items-center justify-center text-black shrink-0">
                {card.icon}
              </div>
            </div>

            <p className="text-[13px] text-[#777777] leading-relaxed mb-4 flex-1">{card.desc}</p>

            {card.badge && (
              <div className="mb-3 border border-[#e1e1e1] rounded-sm px-2 py-1 text-[12px] font-semibold text-black bg-[#f5f5f5] w-fit">
                {card.badge}
              </div>
            )}

            <Link
              to={card.to}
              className="mt-auto flex items-center gap-1.5 text-[13px] font-medium text-black border border-[#e1e1e1] rounded-sm px-3 py-1.5 hover:bg-[#efefef] transition-colors w-fit"
            >
              {card.action}
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientDashboard;
