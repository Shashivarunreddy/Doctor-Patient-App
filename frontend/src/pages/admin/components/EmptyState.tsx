import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

export const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => (
  <div className="bg-white rounded-sm border border-[#e1e1e1] p-14 text-center space-y-3">
    <div className="mx-auto w-14 h-14 rounded-sm bg-[#fafafa] flex items-center justify-center text-[#555555] border border-[#e1e1e1]">
      {icon}
    </div>
    <p className="font-bold text-black">{title}</p>
    <p className="text-[#555555] text-sm">{subtitle}</p>
  </div>
);
