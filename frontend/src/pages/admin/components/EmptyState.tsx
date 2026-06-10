import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

export const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => (
  <div className="bg-white rounded-2xl border border-zinc-200 p-14 text-center space-y-3">
    <div className="mx-auto w-14 h-14 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100">
      {icon}
    </div>
    <p className="font-bold text-zinc-600">{title}</p>
    <p className="text-zinc-400 text-sm">{subtitle}</p>
  </div>
);
