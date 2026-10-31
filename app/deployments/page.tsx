import DeploymentsPage from '@/src/deployments/page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deployments · DeployX',
  description: 'DeployX deployment pipeline management, real-time stage progression, log viewer, and build diagnostics.',
};

export default function Page() {
  return <DeploymentsPage />;
}

