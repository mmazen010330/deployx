import type { ReactNode } from 'react';

type StateKind = 'empty' | 'loading' | 'error' | 'unavailable' | 'info';

const stateStyles: Record<StateKind, { icon: string; className: string; role?: 'alert' | 'status' }> = {
  empty: { icon: '○', className: 'border-dashed border-slate-300 bg-white', role: 'status' },
  loading: { icon: '◷', className: 'border-blue-200 bg-blue-50', role: 'status' },
  error: { icon: '!', className: 'border-red-200 bg-red-50', role: 'alert' },
  unavailable: { icon: 'i', className: 'border-blue-200 bg-blue-50', role: 'status' },
  info: { icon: 'i', className: 'border-slate-200 bg-white', role: 'status' },
};

export function StatePanel({ kind, title, children, action, className = '' }: {
  kind: StateKind;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const config = stateStyles[kind];
  return <section aria-live={kind === 'loading' ? 'polite' : undefined} className={`rounded-xl border p-5 ${config.className} ${className}`} role={config.role}>
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current/20 text-sm font-semibold">{config.icon}</span>
      <div className="min-w-0">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <div className="mt-1 text-sm leading-6 text-slate-600">{children}</div>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  </section>;
}
