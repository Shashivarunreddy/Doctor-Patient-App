import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { Link } from 'react-router-dom';
import { Users, CalendarClock, Settings, Activity, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { type Appointment } from '../../types/appointment';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    api.get('/doctor/appointments')
      .then(res => { if (res.data.success) setAppointments(res.data.data || []); })
      .catch((err: unknown) => {
        console.error('Failed to load appointments for dashboard:', err);
      });
  }, []);

  const confirmed = appointments.filter(a => a.status === 'CONFIRMED');

  const cards = [
    {
      id: 'queue',
      icon: <Users size={18} />,
      label: 'Incoming Queue',
      desc: 'Patients scheduled for consultations. Launch secure video calls instantly.',
      action: 'View All',
      to: '/doctor-dashboard/appointments',
      badge: confirmed.length > 0 ? `${confirmed.length} patient${confirmed.length !== 1 ? 's' : ''} queued` : null,
    },
    {
      id: 'slots',
      icon: <CalendarClock size={18} />,
      label: 'Schedule Availability',
      desc: 'Configure your working hours and generate 30-minute slots for patients to book.',
      action: 'Manage Slots',
      to: '/doctor-dashboard/slots',
      badge: null,
    },
    {
      id: 'profile',
      icon: <Settings size={18} />,
      label: 'Clinic Profile',
      desc: 'Update your public credentials, specialties, and professional bio.',
      action: 'Edit Information',
      to: '/doctor-dashboard/profile',
      badge: null,
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-[32px] text-black font-semibold leading-tight tracking-tight">
          Doctor Workspace
        </h2>
        <p className="text-sm text-[#555555] mt-1">
          Dr. <span className="text-black font-medium">{user?.name}</span>, manage your clinic operations.
        </p>
      </div>

      {/* Status strip */}
      <div className="flex items-center gap-2 bg-white border border-[#e1e1e1] px-4 py-2.5 rounded-sm w-fit text-sm">
        <Activity size={14} className="text-black" />
        <span className="text-[#555555] font-medium">Available</span>
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

export default DoctorDashboard;
