import Link from 'next/link';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { StatePanel } from '@/src/components/ui/StatePanel';

export default function NewProjectPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <Link className="text-sm font-medium text-blue-700 hover:text-blue-800" href="/projects">← Projects</Link>
        <PageHeader title="Import a repository" description="Choose a GitHub repository and branch before analysis begins." />
      </div>
      <StatePanel kind="unavailable" title="GitHub repository access is not connected">
        Repository authorization is not configured in this project yet. No repository or branch has been selected, and no analysis has run.
      </StatePanel>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">Repository selection</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Connect and authorize GitHub repository access to load repositories and branches. This step will keep your selected branch through analysis and deployment.</p>
        <button className="mt-4 min-h-11 cursor-not-allowed rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-500" disabled type="button" aria-describedby="github-not-ready">Connect GitHub</button>
        <p id="github-not-ready" className="mt-2 text-xs text-slate-500">Unavailable until the GitHub authorization service is configured.</p>
      </section>
    </main>
  );
}
