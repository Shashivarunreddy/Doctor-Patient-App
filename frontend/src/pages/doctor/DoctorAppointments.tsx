import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { type Appointment } from '../../types/appointment';
import { CalendarDays, Clock, Video, ChevronLeft, User } from 'lucide-react';

const statusLabels: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const callStatusLabels: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/doctor/appointments');
        if (res.data.success) {
          setAppointments(res.data.data || []);
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message || 'Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        to="/doctor-dashboard"
        className="inline-flex items-center text-sm font-medium text-[#555555] hover:text-black transition-colors border border-[#e1e1e1] bg-white hover:bg-[#efefef] px-3 py-1.5 rounded-sm"
      >
        <ChevronLeft size={14} className="mr-1" /> Back to Workspace
      </Link>

      {/* Page header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-6 h-6 flex items-center justify-center text-black">
            <CalendarDays size={18} />
          </div>
          <h2 className="text-2xl text-black font-semibold leading-tight tracking-tight">Patient Appointments</h2>
        </div>
        <p className="text-sm text-[#555555] mt-1">Review your schedule and join video consultations</p>
      </div>

      {error && (
        <div className="p-4 border border-[#e1e1e1] bg-[#fafafa] text-black text-sm font-medium rounded-sm">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="bg-white border border-[#e1e1e1] rounded-sm p-12 text-center">
          <div className="w-10 h-10 border border-[#e1e1e1] rounded-sm flex items-center justify-center mx-auto mb-4 bg-[#f5f5f5]">
            <CalendarDays size={20} className="text-[#555555]" />
          </div>
          <p className="text-black font-medium">No appointments yet</p>
          <p className="text-[#777777] text-sm mt-1">Patients will appear here once they book with you.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e1e1e1] rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#fafafa] text-[#555555] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e1e1e1]">
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Call Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-[#e1e1e1]">
                {appointments.map(appt => (
                  <tr key={appt.id} className="hover:bg-[#fcfcfc] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-sm border border-[#e1e1e1] bg-[#f5f5f5] flex-shrink-0 flex items-center justify-center text-black text-xs font-medium">
                          {appt.patient?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? <User size={14} />}
                        </div>
                        <div>
                          <div className="font-medium text-black">{appt.patient?.name}</div>
                          <div className="font-mono text-[#777777] text-[11px]">{appt.patient?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[#555555]">
                        <CalendarDays size={12} />
                        <span className="font-mono">{appt.timeSlot?.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#777777] mt-0.5">
                        <Clock size={12} />
                        <span className="font-mono text-[11px]">{appt.timeSlot?.startTime} – {appt.timeSlot?.endTime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 border border-[#e1e1e1] rounded-sm text-[11px] font-medium bg-[#f5f5f5] text-black">
                        {statusLabels[appt.status] ?? appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 border rounded-sm text-[11px] font-medium ${
                        appt.callStatus === 'IN_PROGRESS'
                          ? 'border-black bg-black text-white'
                          : 'border-[#e1e1e1] bg-[#f5f5f5] text-black'
                      }`}>
                        {callStatusLabels[appt.callStatus] ?? appt.callStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {appt.status === 'CONFIRMED' && (
                        <button
                          onClick={() => navigate(`/doctor-dashboard/call/${appt.id}`)}
                          className="inline-flex items-center gap-1.5 text-[13px] px-3 py-1 border border-[#e1e1e1] rounded-sm hover:bg-[#f0f0f0] transition-colors text-black font-medium cursor-pointer"
                        >
                          <Video size={12} />
                          {appt.callStatus === 'IN_PROGRESS' ? 'Rejoin' : 'Start Call'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {appointments.some(a => a.notes) && (
            <div className="border-t border-[#e1e1e1] px-4 py-3 bg-[#fafafa]">
              {appointments.filter(a => a.notes).map(appt => (
                <div key={appt.id} className="mb-2 last:mb-0">
                  <span className="text-[10px] font-semibold text-[#777777] uppercase tracking-wider">
                    Patient Notes — {appt.patient?.name}:
                  </span>
                  <p className="text-[13px] text-[#555555] mt-0.5">{appt.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
