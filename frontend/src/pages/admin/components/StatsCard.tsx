import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  colorClass?: string;
  alert?: boolean;
  trend?: { direction: 'up' | 'down'; value: number; label?: string };
  onClick?: () => void;
}

export const StatsCard = ({
  label,
  value,
  icon,
  colorClass = 'text-primary bg-primary/10',
  alert = false,
  trend,
  onClick,
}: StatsCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`bg-white border rounded-lg p-5 hover:shadow-sm transition-shadow duration-300 relative overflow-hidden group text-left w-full ${
      alert ? 'border-[#ba1a1a] ring-1 ring-[#ba1a1a]/20' : 'border-[#d8c3ad]'
    } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
  >
    {/* Decorative scale bubble */}
    <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#f59e0b]/5 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />

    <div className="flex items-start justify-between mb-2 relative z-10">
      <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass} shrink-0`}>
        {icon}
      </div>
    </div>

    <div className="font-serif text-2xl text-zinc-950 font-bold relative z-10 mt-1">
      {value}
    </div>

    {trend ? (
      <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1 relative z-10 font-semibold">
        {trend.direction === 'up' ? (
          <span className="text-[#855300] flex items-center gap-0.5">
            <TrendingUp size={12} strokeWidth={2.5} />
            +{trend.value}%
          </span>
        ) : (
          <span className="text-[#ba1a1a] flex items-center gap-0.5">
            <TrendingDown size={12} strokeWidth={2.5} />
            -{trend.value}%
          </span>
        )}
        {trend.label && <span className="text-zinc-400 font-medium ml-0.5">{trend.label}</span>}
      </div>
    ) : (
      <div className="mt-2 text-xs text-zinc-400 font-medium relative z-10">
        Requires document review
      </div>
    )}
  </button>
);
