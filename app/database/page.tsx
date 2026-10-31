import DatabaseManagementPage from '@/src/database/page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Databases & Backups · DeployX',
  description: 'Manage MySQL and PostgreSQL database instances, automated snapshots, retention policies, and non-destructive recovery.',
};

export default function Page() {
  return <DatabaseManagementPage />;
}

