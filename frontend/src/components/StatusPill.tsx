import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { JobStatus, SectionStatus } from '../types';

interface StatusPillProps {
  status: JobStatus | SectionStatus;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md' }) => {
  const styles = {
    idle: 'bg-slate-100 text-slate-600 border-slate-200',
    queued: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-slate-100 text-slate-500 border-slate-200',
    running: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed_with_errors: 'bg-amber-50 text-amber-800 border-amber-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const icons = {
    idle: <Clock size={12} />,
    queued: <Clock size={12} />,
    pending: <Clock size={12} />,
    running: <Loader2 size={12} className="animate-spin" />,
    completed: <CheckCircle2 size={12} />,
    completed_with_errors: <AlertCircle size={12} />,
    failed: <AlertCircle size={12} />,
    cancelled: <AlertCircle size={12} />,
  };

  const labels = {
    idle: 'Queued',
    queued: 'Queued',
    pending: 'Pending',
    running: 'Processing',
    completed: 'Complete',
    completed_with_errors: 'Complete w/ Errors',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${styles[status]} ${sizeClass}`}>
      {icons[status]}
      {labels[status]}
    </span>
  );
};
