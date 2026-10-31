import Link from 'next/link';
import type { ReactNode } from 'react';

const metrics = [
  ['Total projects', '—'],
  ['Active deployments', '—'],
  ['Failures', '—'],
  ['Managed databases', '—'],
  ['Recent backups', '—'],
  ['Budget status', '—'],
];

function EmptySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{children}</p>
    </section>
  );
}

export default function Dashboard() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-700">Workspace overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Deployment and project information will appear here when a data source is connected.</p>
        </div>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" href="/projects/new">
          Import a repository
        </Link>
      </header>

      <section aria-label="Workspace metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value]) => (
          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={label}>
            <h2 className="text-sm font-medium text-slate-600">{label}</h2>
            <p className="mt-2 text-2xl font-semibold text-slate-400" aria-label={`${label}: unavailable`}>{value}</p>
            <p className="mt-1 text-xs text-slate-500">Waiting for connected account data</p>
          </article>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <EmptySection title="Projects">No project records are available yet. Connect a GitHub account and choose a repository to get started.</EmptySection>
        <EmptySection title="Recent deployments">Deployment history is not connected, so no deployment status is shown.</EmptySection>
        <EmptySection title="Needs attention">Alerts will appear here when recorded by the platform.</EmptySection>
        <EmptySection title="Recent activity">No activity records are available.</EmptySection>
      </div>
      <p className="text-xs text-slate-500">Dashboard values are unavailable until DeployX is connected to its backend. No deployment state or cost estimate is inferred.</p>
    </main>
  );
}

export interface DashboardProps {}
export { Dashboard };
