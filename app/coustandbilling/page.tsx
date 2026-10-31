import CostAndBudgetPage from '@/src/coustandbilling/page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cost & Budget · DeployX',
  description: 'Track project consumption against baseline budgets, review observed vs forecast spend, and manage billing warnings.',
};

export default function Page() {
  return <CostAndBudgetPage />;
}

