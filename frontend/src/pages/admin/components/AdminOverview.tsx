import {
  Users,
  UserCheck,
  IndianRupee,
  CalendarDays,
  CheckCircle,
  XCircle,
  ShieldCheck,
  FileText,
  ToggleRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from './StatsCard';
import type { Stats, Tab } from '../types';

interface AdminOverviewProps {
  stats: Stats | null;
  onTabChange: (tab: Tab) => void;
}

export const AdminOverview = ({ stats, onTabChange }: AdminOverviewProps) => {
  if (!stats) return null;

  // Render stats pipeline buttons
  const showReviewButton = stats.pendingApprovals > 0;
  const reviewTargetTab: Tab = stats.phase1Pending > 0 ? 'phase1' : 'phase2';

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Active Doctors"
          value={stats.activeDoctors}
          icon={<UserCheck size={20} />}
          colorClass="text-green-600 bg-green-50/70"
          trend={{ direction: 'up', value: 8, label: 'vs last week' }}
          onClick={() => onTabChange('doctors')}
        />
        <StatsCard
          label="Phase 1 Pending"
          value={stats.phase1Pending}
          icon={<ShieldCheck size={20} />}
          colorClass="text-amber-600 bg-amber-50/70"
          alert={stats.phase1Pending > 0}
          trend={stats.phase1Pending > 0 ? { direction: 'up', value: stats.phase1Pending, label: 'requires action' } : undefined}
          onClick={() => onTabChange('phase1')}
        />
        <StatsCard
          label="Phase 2 Pending"
          value={stats.phase2Pending}
          icon={<FileText size={20} />}
          colorClass="text-orange-600 bg-orange-50/70"
          alert={stats.phase2Pending > 0}
          trend={stats.phase2Pending > 0 ? { direction: 'up', value: stats.phase2Pending, label: 'requires review' } : undefined}
          onClick={() => onTabChange('phase2')}
        />
        <StatsCard
          label="Total Patients"
          value={stats.totalPatients}
          icon={<Users size={20} />}
          colorClass="text-blue-600 bg-blue-50/70"
          trend={{ direction: 'up', value: 12, label: 'vs last month' }}
          onClick={() => onTabChange('patients')}
        />
        <StatsCard
          label="Revenue (INR)"
          value={`₹${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={<IndianRupee size={20} />}
          colorClass="text-amber-600 bg-orange-50/70"
          trend={{ direction: 'up', value: 15, label: 'vs last week' }}
          onClick={() => onTabChange('analytics')}
        />
        <StatsCard
          label="Confirmed Appts"
          value={stats.confirmedAppointments}
          icon={<CalendarDays size={20} />}
          colorClass="text-blue-600 bg-blue-50/70"
          trend={{ direction: 'down', value: 2, label: 'vs last week' }}
          onClick={() => onTabChange('appointments')}
        />
        <StatsCard
          label="Completed Appts"
          value={stats.completedAppointments}
          icon={<CheckCircle size={20} />}
          colorClass="text-green-600 bg-green-50/70"
          trend={{ direction: 'up', value: 18, label: 'vs last week' }}
          onClick={() => onTabChange('appointments')}
        />
        <StatsCard
          label="Cancelled Appts"
          value={stats.cancelledAppointments}
          icon={<XCircle size={20} />}
          colorClass="text-rose-600 bg-rose-50/70"
          alert={stats.cancelledAppointments > 10}
          trend={{ direction: 'down', value: 5, label: 'vs last week' }}
          onClick={() => onTabChange('appointments')}
        />
      </div>

      {/* Pipeline & Appointment overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Verification Pipeline Panel */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <h3 className="font-extrabold text-zinc-900 text-lg">Doctor Verification Pipeline</h3>
            <p className="text-zinc-500 text-xs mt-1">
              Active tracking of registrations, credential check, and active practitioners.
            </p>
          </div>
          <div className="space-y-2">
            {[
              {
                label: 'Phase 1 — Registration Review',
                value: stats.phase1Pending,
                color: stats.phase1Pending > 0 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-zinc-400 hover:bg-zinc-50',
                tab: 'phase1' as Tab,
              },
              {
                label: 'Phase 2 — Credential Verification',
                value: stats.phase2Pending,
                color: stats.phase2Pending > 0 ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-zinc-400 hover:bg-zinc-50',
                tab: 'phase2' as Tab,
              },
              {
                label: 'Phase 3 — Active & Accepting Bookings',
                value: stats.activeDoctors,
                color: 'text-green-600 bg-green-50 border-green-100',
                tab: 'doctors' as Tab,
              },
            ].map((row) => (
              <button
                key={row.label}
                onClick={() => onTabChange(row.tab)}
                className={`w-full flex items-center justify-between text-sm font-bold p-3 rounded-xl border border-transparent transition-all text-left ${row.color}`}
              >
                <span className="text-zinc-700">{row.label}</span>
                <span className="text-base font-extrabold">{row.value}</span>
              </button>
            ))}
          </div>

          {showReviewButton && (
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl h-11 transition-colors"
              onClick={() => onTabChange(reviewTargetTab)}
            >
              <AlertCircle size={16} className="mr-2" />
              Review {stats.pendingApprovals} Pending Approval{stats.pendingApprovals > 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {/* Appointment Overview Panel */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-extrabold text-zinc-900 text-lg">Appointment Overview</h3>
            <p className="text-zinc-500 text-xs mt-1">
              Summarized status of all scheduled and completed clinical sessions.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Confirmed', value: stats.confirmedAppointments, color: 'text-blue-600' },
              { label: 'Completed', value: stats.completedAppointments, color: 'text-green-600' },
              { label: 'Cancelled', value: stats.cancelledAppointments, color: 'text-red-600' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center text-sm font-bold">
                <span className="text-zinc-500">{row.label}</span>
                <span className={row.color}>{row.value}</span>
              </div>
            ))}
            <div className="border-t border-zinc-100 pt-3 flex justify-between items-center text-sm font-extrabold">
              <span className="text-zinc-800">Total Revenue Generated</span>
              <span className="text-primary text-base">
                ₹{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Phase Explainer Banner */}
      <div className="bg-gradient-to-br from-zinc-50 to-orange-50/30 rounded-2xl border border-zinc-200 p-6 shadow-sm">
        <h3 className="font-extrabold text-zinc-900 text-lg mb-4">Telemedicine Verification Cycle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              phase: 'Phase 1',
              title: 'Account Registration',
              desc: 'Review basic contact details, email verification, and name alignment.',
              icon: <ShieldCheck size={20} />,
              color: 'bg-amber-50/70 text-amber-700 border-amber-100',
            },
            {
              phase: 'Phase 2',
              title: 'License & Degrees',
              desc: 'Examine government license IDs, degrees, and professional certifications.',
              icon: <FileText size={20} />,
              color: 'bg-orange-50/70 text-orange-700 border-orange-100',
            },
            {
              phase: 'Phase 3',
              title: 'Activate Bookings',
              desc: 'Grant calendar permissions. Once activated, patients can book video appointments.',
              icon: <ToggleRight size={20} />,
              color: 'bg-emerald-50/70 text-emerald-700 border-emerald-100',
            },
          ].map((item) => (
            <div key={item.phase} className={`rounded-xl border p-4 space-y-2 bg-white ${item.color}`}>
              <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wide">
                {item.icon}
                {item.phase}
              </div>
              <p className="font-extrabold text-zinc-900 text-sm">{item.title}</p>
              <p className="text-zinc-500 text-xs font-semibold leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
