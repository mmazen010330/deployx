import type { ReactNode } from 'react';

export type OperationStatus = 'pending' | 'running' | 'successful' | 'failed' | 'blocked' | 'warning' | 'unresolved';

const statusStyles: Record<OperationStatus, { label: string; icon: string; className: string }> = {
  pending: { label: 'Pending', icon: '○', className: 'border-slate-300 bg-slate-50 text-slate-700' },
  running: { label: 'Running', icon: '◷', className: 'border-blue-200 bg-blue-50 text-blue-800' },
  successful: { label: 'Successful', icon: '✓', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  failed: { label: 'Failed', icon: '!', className: 'border-red-200 bg-red-50 text-red-800' },
  blocked: { label: 'Blocked', icon: '⊘', className: 'border-orange-200 bg-orange-50 text-orange-900' },
  warning: { label: 'Warning', icon: '△', className: 'border-amber-200 bg-amber-50 text-amber-900' },
  unresolved: { label: 'Unresolved', icon: '?', className: 'border-violet-200 bg-violet-50 text-violet-900' },
};

export function StatusBadge({ status, label }: { status: OperationStatus; label?: string }) {
  const config = statusStyles[status];
  return <span className={`inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}>
    <span aria-hidden="true" className="text-sm leading-none">{config.icon}</span>{label ?? config.label}
  </span>;
}

export function StatusLegend({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
