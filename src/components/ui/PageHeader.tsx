import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description, action }: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return <header className="flex flex-wrap items-start justify-between gap-4">
    <div>
      {eyebrow && <p className="text-sm font-medium text-blue-700">{eyebrow}</p>}
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
    </div>
    {action && <div className="w-full sm:w-auto">{action}</div>}
  </header>;
}
