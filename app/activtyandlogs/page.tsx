import ActivityAndNotificationsPage from '@/src/activtyandlogs/page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications & Activity · DeployX',
  description: 'Chronological timeline of deployments, database provisioning, snapshots, restores, and budget alerts with verified delivery status.',
};

export default function Page() {
  return <ActivityAndNotificationsPage />;
}

