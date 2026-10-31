import BackupsPage from '@/src/backups/page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backups & Recovery · DeployX',
  description: 'Manage database snapshots, retention schedules, and isolated non-destructive restore workflows.',
};

export default function Page() {
  return <BackupsPage />;
}

