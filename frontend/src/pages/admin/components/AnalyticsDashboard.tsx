import { Activity, Users, TrendingUp, Sparkles, BarChart3, LineChart } from 'lucide-react';
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
            <div className="flex items-center gap-2">
              <div className="flex bg-[#fafafa] p-1 rounded-sm border border-[#e1e1e1]">
                {periods.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => onPeriodChange(p.value)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
                      period === p.value
                        ? 'bg-black text-white shadow-sm border border-black'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
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
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 bg-[#fafafa] rounded-sm border border-[#e1e1e1] text-black">
            <LineChart size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900">Analytics Hub</h2>
            <p className="text-zinc-500 text-xs font-semibold">
              Historical performance stats, trends, revenue figures, and practitioner leaderboards.
            </p>
          </div>
        </div>
        <div className="flex bg-[#fafafa] p-1 rounded-sm border border-[#e1e1e1]">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPeriodChange(p.value)}
              className={`h-8 px-3 text-xs font-bold rounded-sm transition-all ${
                period === p.value
                  ? 'bg-black text-white shadow-sm'
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
        <div className="bg-white p-5 rounded-sm border border-[#e1e1e1] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-sm bg-[#fafafa] border border-[#e1e1e1] text-black">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Completion Rate</p>
            <p className="text-2xl font-extrabold text-zinc-950 mt-0.5">
              {analytics.completionRate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-sm border border-[#e1e1e1] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-sm bg-[#fafafa] border border-[#e1e1e1] text-black">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Avg Consult Revenue</p>
            <p className="text-2xl font-extrabold text-zinc-950 mt-0.5">
              ₹{analytics.avgRevenuePerAppointment.toFixed(0)}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-sm border border-[#e1e1e1] shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-sm bg-[#fafafa] border border-[#e1e1e1] text-black">
            <Users size={20} />
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

      {/* Charts / Complex metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="bg-white rounded-sm border border-[#e1e1e1] p-5 flex flex-col space-y-4">
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
                  <div
                    style={{ height: `${Math.max(heightPct, 3)}%` }}
                    className="w-full bg-black/80 hover:bg-black transition-all duration-300"
                  />
                  <span className="text-[9px] text-zinc-400 font-bold mt-1.5 transform rotate-45 origin-left whitespace-nowrap hidden sm:block">
                    {pt.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Registration Chart */}
        <div className="bg-white rounded-sm border border-[#e1e1e1] p-5 shadow-sm space-y-4 lg:col-span-2">
          <div>
            <h3 className="font-extrabold text-zinc-900 text-sm uppercase tracking-wider">
              Account Registrations
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">Doctors and patients onboarding trend</p>
          </div>
          <div className="h-56 relative pt-4">
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#000000"
                strokeWidth="3"
                points={analytics.registrationsByDay.map((pt, idx) => {
                  const x = (idx / (analytics.registrationsByDay.length - 1)) * 400;
                  const y = 200 - (pt.doctors / maxRegs) * 180;
                  return `${x},${y}`;
                }).join(' ')}
              />
              <polyline
                fill="none"
                stroke="#888888"
                strokeWidth="3"
                points={analytics.registrationsByDay.map((pt, idx) => {
                  const x = (idx / (analytics.registrationsByDay.length - 1)) * 400;
                  const y = 200 - (pt.patients / maxRegs) * 180;
                  return `${x},${y}`;
                }).join(' ')}
              />
            </svg>
            <div className="flex gap-4 items-center justify-end mt-4">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#000000]" />
                  <span className="text-zinc-600">Doctors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#888888]" />
                  <span className="text-zinc-600">Patients</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specialization Distribution */}
        <div className="bg-white rounded-sm border border-[#e1e1e1] p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-zinc-900 text-sm uppercase tracking-wider">Specialization</h3>
          <div className="space-y-3.5">
            {analytics.specializationDistribution.map((spec, idx) => {
              const maxSpecCount = Math.max(...analytics.specializationDistribution.map(s => s.count), 1);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-zinc-700">
                    <span>{spec.specialization}</span>
                    <span>{spec.count}</span>
                  </div>
                  <Progress value={(spec.count / maxSpecCount) * 100} className="h-1.5 rounded-none" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-sm border border-[#e1e1e1] p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-zinc-900 text-sm uppercase tracking-wider">Top Practitioners</h3>
          </div>
          <div className="divide-y divide-zinc-100">
            {analytics.topDoctors.map((doc, idx) => (
              <div key={doc.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 flex items-center justify-center bg-[#fafafa] border border-[#e1e1e1] text-black font-extrabold text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-zinc-950">Dr. {doc.name}</p>
                    <p className="text-[10px] text-zinc-400 font-bold">{(doc.specializations || []).join(', ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-zinc-950">₹{doc.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
