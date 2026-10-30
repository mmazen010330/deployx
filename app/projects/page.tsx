import Link from 'next/link';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { StatePanel } from '@/src/components/ui/StatePanel';

export default function ProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader title="Projects" description="Repositories become projects after you select them and analysis is recorded." action={<Link className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700" href="/projects/new">Import repository</Link>} />
      <StatePanel kind="empty" title="No projects yet" action={<Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/projects/new">Choose a repository</Link>}>
        Import a repository to begin. You will choose the repository and branch explicitly before analysis.
      </StatePanel>
    </main>
  );
}
