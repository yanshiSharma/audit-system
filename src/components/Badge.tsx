import React from 'react';
import { cn } from '../lib/utils';
import { Status, RiskLevel } from '../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Status | RiskLevel | 'Active' | 'Mitigated' | 'Repeat' | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant, className }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'Closed':
      case 'Mitigated':
      case 'Completed':
      case 'Low':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'In Progress':
      case 'Medium':
      case 'Repeat':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Overdue':
      case 'High':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Open':
      case 'Planned':
      case 'Active':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <span className={cn(
      'px-2.5 py-0.5 rounded-full text-xs font-medium border',
      getVariantClasses(),
      className
    )}>
      {children}
    </span>
  );
};
