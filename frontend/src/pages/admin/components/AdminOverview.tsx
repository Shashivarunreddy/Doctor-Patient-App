import {
  Users,
  UserCheck,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Server,
  BellRing,
  ChevronDown
} from 'lucide-react';
import type { Stats, Tab } from '../types';

interface AdminOverviewProps {
  stats: Stats | null;
  onTabChange: (tab: Tab) => void;
}

export const AdminOverview = ({ stats, onTabChange }: AdminOverviewProps) => {
  if (!stats) return null;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Statistic Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1 */}
        <div 
          onClick={() => onTabChange('doctors')}
          className="bg-white rounded-sm border border-[#e1e1e1] p-4 flex flex-col hover:bg-[#fafafa] transition-colors group cursor-pointer relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Total Doctors</span>
            <div className="w-6 h-6 flex items-center justify-center text-black">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl text-black font-bold">{stats.activeDoctors.toLocaleString()}</span>
            <span className="text-[13px] text-[#555555] flex items-center bg-[#f0f0f0] px-1.5 py-0.5 rounded-sm">
              <TrendingUp size={12} className="mr-1" />+12%
            </span>
          </div>
          <p className="text-[13px] text-[#777777] mt-1">vs last month</p>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => onTabChange('patients')}
          className="bg-white rounded-sm border border-[#e1e1e1] p-4 flex flex-col hover:bg-[#fafafa] transition-colors group cursor-pointer relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Total Patients</span>
            <div className="w-6 h-6 flex items-center justify-center text-black">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl text-black font-bold">{stats.totalPatients.toLocaleString()}</span>
            <span className="text-[13px] text-[#555555] flex items-center bg-[#f0f0f0] px-1.5 py-0.5 rounded-sm">
              <TrendingUp size={12} className="mr-1" />+5.4%
            </span>
          </div>
          <p className="text-[13px] text-[#777777] mt-1">vs last month</p>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => onTabChange(stats.phase1Pending > 0 ? 'phase1' : 'phase2')}
          className="bg-white rounded-sm border border-[#e1e1e1] p-4 flex flex-col hover:bg-[#fafafa] transition-colors group cursor-pointer relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Pending Approvals</span>
            <div className="w-6 h-6 flex items-center justify-center text-black">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-auto relative z-10">
            <span className="text-2xl text-black font-bold">{stats.pendingApprovals}</span>
            {stats.pendingApprovals > 0 && (
              <span className="text-[13px] text-black border border-black flex items-center px-1.5 py-0.5 rounded-sm font-medium">
                Action Required
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#777777] mt-1 relative z-10">Across Phase 1 & Phase 2</p>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => onTabChange('appointments')}
          className="bg-white rounded-sm border border-[#e1e1e1] p-4 flex flex-col hover:bg-[#fafafa] transition-colors group cursor-pointer relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Appointments</span>
            <div className="w-6 h-6 flex items-center justify-center text-black">
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-2xl text-black font-bold">{stats.confirmedAppointments.toLocaleString()}</span>
            <span className="text-[13px] text-[#555555] bg-[#f0f0f0] px-1.5 py-0.5 rounded-sm">
              Confirmed
            </span>
          </div>
          <p className="text-[13px] text-[#777777] mt-1">Across all active clinics</p>
        </div>
      </div>

      {/* Main Body: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
        {/* Main Queue Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-sm border border-[#e1e1e1] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-[#e1e1e1] flex justify-between items-center bg-white">
            <h3 className="text-base text-black font-semibold flex items-center gap-2">
              <ShieldCheck size={18} className="text-black" />
              Doctor Verification Queue
            </h3>
            <button 
              onClick={() => onTabChange('phase1')}
              className="text-[13px] text-[#555555] hover:text-black hover:underline"
            >
              View All Queue
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#fafafa] text-[#555555] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e1e1e1]">
                  <th className="px-4 py-3">Practitioner</th>
                  <th className="px-4 py-3">Specialty</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-[#e1e1e1]">
                <tr className="hover:bg-[#fcfcfc] transition-colors group">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-sm border border-[#e1e1e1] bg-[#f5f5f5] flex-shrink-0 flex items-center justify-center text-black text-xs font-medium">AS</div>
                    <div>
                      <div className="font-medium text-black">Dr. Aisha Sharma</div>
                      <div className="font-mono text-[#777777] text-[11px]">ID: DOC-8821</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#555555]">Cardiology</td>
                  <td className="px-4 py-3 font-mono text-[#555555]">2h ago</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 border border-[#e1e1e1] rounded-sm text-[11px] font-medium bg-[#f5f5f5] text-black">Reviewing</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[13px] px-3 py-1 border border-[#e1e1e1] rounded-sm hover:bg-[#f0f0f0] transition-colors text-black font-medium cursor-pointer">Review</button>
                  </td>
                </tr>
                <tr className="hover:bg-[#fcfcfc] transition-colors group">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-sm border border-[#e1e1e1] bg-[#f5f5f5] flex-shrink-0 flex items-center justify-center text-black text-xs font-medium">MR</div>
                    <div>
                      <div className="font-medium text-black">Dr. Marcus Reynolds</div>
                      <div className="font-mono text-[#777777] text-[11px]">ID: DOC-8822</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#555555]">Neurology</td>
                  <td className="px-4 py-3 font-mono text-[#555555]">4h ago</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 border border-black rounded-sm text-[11px] font-medium bg-white text-black">Missing Docs</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[13px] px-3 py-1 border border-[#e1e1e1] rounded-sm hover:bg-[#f0f0f0] transition-colors text-black font-medium cursor-pointer">Review</button>
                  </td>
                </tr>
                <tr className="hover:bg-[#fcfcfc] transition-colors group">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-sm border border-[#e1e1e1] flex-shrink-0 overflow-hidden">
                      <img alt="Doctor" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8YNXKYb9wir6i5AmwsMtpLLDix5rTKIVVYbxdX-3BcUgySGOMkKJGo1cgMDTmzBoL9peJiCVl7e1ZSyVq5ole0U3VK8Rxo_ObK8C2HnfqzTPbcPFQ2_N9gEg5SoiMd3C58Wy2oY1L3a6p9f9AGl-bZEDgGrf3G8T05C13xeeoIOgl2RBavGXqj1-gdRsbJK1ZL80ZJ2T5_FXgarBOO8bPg5TMUjQpR_EeoKof7k0tkIBrORw5OjWO7sMQg3ysYSDvsFuoQK_ivXc" />
                    </div>
                    <div>
                      <div className="font-medium text-black">Dr. Elena Rostova</div>
                      <div className="font-mono text-[#777777] text-[11px]">ID: DOC-8819</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#555555]">Pediatrics</td>
                  <td className="px-4 py-3 font-mono text-[#555555]">1d ago</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 border border-[#e1e1e1] rounded-sm text-[11px] font-medium bg-[#f5f5f5] text-black">Pending Phase 1</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[13px] px-3 py-1 border border-[#e1e1e1] rounded-sm hover:bg-[#f0f0f0] transition-colors text-black font-medium cursor-pointer">Review</button>
                  </td>
                </tr>
                <tr className="hover:bg-[#fcfcfc] transition-colors group">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-sm border border-[#e1e1e1] bg-[#f5f5f5] flex-shrink-0 flex items-center justify-center text-black text-xs font-medium">JL</div>
                    <div>
                      <div className="font-medium text-black">Dr. James Lin</div>
                      <div className="font-mono text-[#777777] text-[11px]">ID: DOC-8815</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#555555]">Orthopedics</td>
                  <td className="px-4 py-3 font-mono text-[#555555]">1d ago</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 border border-[#e1e1e1] rounded-sm text-[11px] font-medium bg-[#f5f5f5] text-black">Pending Phase 1</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-[13px] px-3 py-1 border border-[#e1e1e1] rounded-sm hover:bg-[#f0f0f0] transition-colors text-black font-medium cursor-pointer">Review</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-2 border-t border-[#e1e1e1] bg-white flex justify-center">
            <button 
              onClick={() => onTabChange('phase1')}
              className="text-[#555555] text-[13px] hover:text-black hover:underline flex items-center gap-1 font-medium"
            >
              Load More <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Sidebar Alert/System Status (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* System Status Card */}
          <div className="bg-white rounded-sm border border-[#e1e1e1] p-4">
            <h3 className="text-base text-black font-semibold mb-3 flex items-center gap-2 border-b border-[#e1e1e1] pb-2">
              <Server size={18} className="text-black" />
              System Status
            </h3>
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-black"></div>
                  <span className="text-[13px] text-black font-medium">API Gateway</span>
                </div>
                <span className="font-mono text-[#555555] text-xs">99.9% Uptime</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded bg-black"></div>
                  <span className="text-[13px] text-black font-medium">Database (Primary)</span>
                </div>
                <span className="font-mono text-[#555555] text-xs">12ms Latency</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded border border-black bg-white"></div>
                  <span className="text-[13px] text-black font-medium">Video Consult Server</span>
                </div>
                <span className="font-mono text-black text-xs font-semibold">High Load (85%)</span>
              </div>
            </div>
          </div>

          {/* Recent Alerts/Log */}
          <div className="bg-white rounded-sm border border-[#e1e1e1] p-4 flex-1">
            <h3 className="text-base text-black font-semibold mb-3 flex items-center gap-2 border-b border-[#e1e1e1] pb-2">
              <BellRing size={18} className="text-black" />
              Recent Alerts
            </h3>
            <div className="relative pl-4 mt-4 border-l border-[#e1e1e1] space-y-6">
              {/* Alert Item */}
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded bg-black ring-4 ring-white border border-white"></div>
                <p className="text-[13px] text-black leading-snug">Failed payment sync reported by Clinic Gateway A.</p>
                <span className="font-mono text-[10px] text-[#777777] mt-1 block">10:42 AM</span>
              </div>
              {/* Alert Item */}
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded bg-white border border-black ring-4 ring-white"></div>
                <p className="text-[13px] text-black leading-snug">New Phase 2 verification batch ready for manual review.</p>
                <span className="font-mono text-[10px] text-[#777777] mt-1 block">09:15 AM</span>
              </div>
              {/* Alert Item */}
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded bg-[#e1e1e1] ring-4 ring-white"></div>
                <p className="text-[13px] text-[#555555] leading-snug">System backup completed successfully.</p>
                <span className="font-mono text-[10px] text-[#777777] mt-1 block">02:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
