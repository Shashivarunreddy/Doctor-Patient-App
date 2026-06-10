import { BarChart3, TrendingUp,Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { AnalyticsData, AnalyticsPeriod } from '../types';

interface AnalyticsDashboardProps {
  analytics: AnalyticsData | null;
  loading: boolean;
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
}

export const AnalyticsDashboard = ({
  analytics,
  loading,
  period,
  onPeriodChange,
}: AnalyticsDashboardProps) => {
  const periods: { value: AnalyticsPeriod; label: string }[] = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '12m', label: 'Last 12 Months' },
  ];

  // If loading and no data, show skeletons
  if (loading && !analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="h-8 w-48 bg-zinc-200 rounded-lg" />
          <div className="h-10 w-64 bg-zinc-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-zinc-100 rounded-2xl border border-zinc-200" />
          <div className="h-64 bg-zinc-100 rounded-2xl border border-zinc-200" />
          <div className="h-64 bg-zinc-100 rounded-2xl border border-zinc-200" />
          <div className="h-64 bg-zinc-100 rounded-2xl border border-zinc-200" />
        </div>
      </div>
    );
  }

  // Graceful empty state/fallback if backend analytics is not active
  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900">Analytics Hub</h2>
              <p className="text-zinc-500 text-xs font-semibold">
                Historical performance stats, trends, revenue figures, and practitioner leaderboards.
              </p>
            </div>
          </div>
          <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 shrink-0">
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPeriodChange(p.value)}
                className={`h-8 px-3 text-xs font-bold rounded-lg transition-all ${
                  period === p.value
                    ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                    : 'text-zinc-500 hover:text-zinc-950'
                }`}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Informative Help Banner for Backend Integration */}
        <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/20 border border-amber-200/70 rounded-2xl p-6 sm:p-8 text-center max-w-3xl mx-auto space-y-6 shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100/70 flex items-center justify-center text-amber-600 border border-amber-200/50">
            <Sparkles size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-zinc-900">Analytics Database Schema Pending</h3>
            <p className="text-zinc-500 text-sm max-w-xl mx-auto leading-relaxed">
              We've created a beautiful Analytics Hub dashboard ready for display. To enable, you just need to implement the backend analytics endpoint in your API server.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-4 text-left font-mono text-xs overflow-x-auto max-w-full text-zinc-700 space-y-3">
            <p className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">
              API Endpoint Specification:
            </p>
            <div>
              <span className="font-extrabold text-blue-600">GET</span> /admin/analytics?period={period}
            </div>
            <div>
              <span className="font-bold text-zinc-900">Response Object:</span>
              <pre className="mt-1 font-mono text-[10px] text-zinc-500 bg-zinc-50 p-2.5 rounded border border-zinc-100 max-h-48 overflow-y-auto">
{`{
  "success": true,
  "data": {
    "revenueByDay": [
      { "date": "2026-06-01", "amount": 4500 },
      { "date": "2026-06-02", "amount": 3200 }
    ],
    "registrationsByDay": [
      { "date": "2026-06-01", "doctors": 2, "patients": 5 },
      { "date": "2026-06-02", "doctors": 1, "patients": 3 }
    ],
    "appointmentsByDay": [
      { "date": "2026-06-01", "confirmed": 8, "completed": 5, "cancelled": 1 }
    ],
    "topDoctors": [
      { "id": "1", "name": "Dr. Shashi Kumar", "revenue": 15000, "appointments": 45, "specializations": ["Cardiology"] }
    ],
    "specializationDistribution": [
      { "specialization": "Dermatology", "count": 12 }
    ],
    "completionRate": 85.5,
    "avgRevenuePerAppointment": 750
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate maximums for chart scales
  const maxRevenue = Math.max(...analytics.revenueByDay.map((r) => r.amount), 1);
  const maxRegs = Math.max(
    ...analytics.registrationsByDay.map((r) => Math.max(r.doctors, r.patients)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900">Analytics Hub</h2>
            <p className="text-zinc-500 text-xs font-semibold">
              Historical performance stats, trends, revenue figures, and practitioner leaderboards.
            </p>
          </div>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 shrink-0">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPeriodChange(p.value)}
              className={`h-8 px-3 text-xs font-bold rounded-lg transition-all ${
                period === p.value
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-950'
              }`}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview stats grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50 text-green-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Completion Rate</p>
            <p className="text-2xl font-extrabold text-zinc-950 mt-0.5">
              {analytics.completionRate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Avg Consult Revenue</p>
            <p className="text-2xl font-extrabold text-zinc-950 mt-0.5">
              ₹{analytics.avgRevenuePerAppointment.toFixed(0)}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Consultations</p>
            <p className="text-2xl font-extrabold text-zinc-950 mt-0.5">
              {analytics.appointmentsByDay.reduce(
                (sum, val) => sum + val.confirmed + val.completed,
                0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* SVG/CSS Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart (Pure CSS Bar Chart) */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-zinc-900 text-sm uppercase tracking-wider">
              Consultation Revenue
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">Daily billing breakdown in INR</p>
          </div>
          <div className="h-56 flex items-end justify-between gap-1 pt-6 border-b border-l border-zinc-100 px-2">
            {analytics.revenueByDay.map((pt, i) => {
              const heightPct = (pt.amount / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <span className="absolute -top-6 bg-zinc-900 text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    ₹{pt.amount.toLocaleString()}
                  </span>
                  {/* Bar */}
                  <div
                    style={{ height: `${Math.max(heightPct, 3)}%` }}
                    className="w-full bg-primary/80 hover:bg-primary rounded-t-sm transition-all duration-300"
                  />
                  {/* Label */}
                  <span className="text-[9px] text-zinc-400 font-bold mt-1.5 transform rotate-45 origin-left whitespace-nowrap hidden sm:block">
                    {pt.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Registration Chart (Pure SVG Line / Stacked area) */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-zinc-900 text-sm uppercase tracking-wider">
              Account Registrations
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">Doctors and patients onboarding trend</p>
          </div>

          <div className="h-56 relative pt-4">
            {/* SVG graph */}
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              {/* Doctor line */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                points={analytics.registrationsByDay
                  .map((pt, idx) => {
                    const x = (idx / (analytics.registrationsByDay.length - 1)) * 400;
                    const y = 200 - (pt.doctors / maxRegs) * 180;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
              {/* Patient line */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                points={analytics.registrationsByDay
                  .map((pt, idx) => {
                    const x = (idx / (analytics.registrationsByDay.length - 1)) * 400;
                    const y = 200 - (pt.patients / maxRegs) * 180;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            </svg>

            {/* Legend */}
            <div className="flex gap-4 items-center justify-end mt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
                <span className="h-2.5 w-2.5 bg-[#f59e0b] rounded-full" />
                Doctors
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
                <span className="h-2.5 w-2.5 bg-[#3b82f6] rounded-full" />
                Patients
              </div>
            </div>
          </div>
        </div>

        {/* Specialization Distribution (Horizontal bars) */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-zinc-900 text-sm uppercase tracking-wider">
              Specialization Distribution
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">Distribution count of active practitioners</p>
          </div>
          <div className="space-y-3.5">
            {analytics.specializationDistribution.map((spec, idx) => {
              const maxCount = Math.max(
                ...analytics.specializationDistribution.map((s) => s.count),
                1
              );
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-zinc-700">
                    <span>{spec.specialization}</span>
                    <span>{spec.count} doctors</span>
                  </div>
                  <Progress value={(spec.count / maxCount) * 100} className="h-2 bg-zinc-100" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard (Ranked List) */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-zinc-900 text-sm uppercase tracking-wider">
              Top Practitioners
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">Top performing doctors ranked by revenue</p>
          </div>
          <div className="divide-y divide-zinc-100">
            {analytics.topDoctors.map((doc, idx) => (
              <div key={doc.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 flex items-center justify-center bg-zinc-100 text-zinc-700 font-extrabold text-xs rounded-full">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-zinc-950">Dr. {doc.name}</p>
                    <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                      {doc.specializations.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-zinc-950">₹{doc.revenue.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                    {doc.appointments} sessions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
