'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/src/context/DashboardContext';
import { PageHeader } from '@/src/components/ui/PageHeader';
import {
  IconCreditCard,
  IconAlertCircle,
  IconInfo,
  IconCheck,
  IconClock,
  IconChevronRight,
  IconX,
} from '@/src/icons';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ProjectCostSummary {
  projectId: string;
  projectName: string;
  monthlyBudget: number; // USD 50 per spec
  observedCostToDate: number;
  forecastCost: number;
  daysRemaining: number;
  status: 'within_budget' | 'forecast_warning' | 'observed_overrun';
  lastUpdated: string;
}

export interface ResourceCostItem {
  id: string;
  projectId: string;
  serviceName: string;
  category: 'Compute Runners' | 'Database Engine' | 'Storage & Snapshots' | 'Network & CDN';
  metric: string;
  unitRate: string;
  observedCost: number;
  forecastCost: number;
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_PROJECTS_COST: ProjectCostSummary[] = [
  {
    projectId: 'proj-storefront',
    projectName: 'Storefront',
    monthlyBudget: 50.0,
    observedCostToDate: 38.4,
    forecastCost: 58.2, // Forecast warning (> 50)
    daysRemaining: 11,
    status: 'forecast_warning',
    lastUpdated: '2026-10-31 03:00 UTC',
  },
  {
    projectId: 'proj-notes',
    projectName: 'Notes API',
    monthlyBudget: 50.0,
    observedCostToDate: 26.5,
    forecastCost: 41.2,
    daysRemaining: 11,
    status: 'within_budget',
    lastUpdated: '2026-10-31 03:00 UTC',
  },
  {
    projectId: 'proj-wiki',
    projectName: 'Team Wiki',
    monthlyBudget: 50.0,
    observedCostToDate: 12.8,
    forecastCost: 19.5,
    daysRemaining: 11,
    status: 'within_budget',
    lastUpdated: '2026-10-31 03:00 UTC',
  },
  {
    projectId: 'proj-portfolio',
    projectName: 'Portfolio',
    monthlyBudget: 50.0,
    observedCostToDate: 4.2,
    forecastCost: 6.8,
    daysRemaining: 11,
    status: 'within_budget',
    lastUpdated: '2026-10-31 03:00 UTC',
  },
  {
    projectId: 'proj-portal',
    projectName: 'Customer Portal',
    monthlyBudget: 50.0,
    observedCostToDate: 52.4, // Observed Overrun (> 50)
    forecastCost: 64.1,
    daysRemaining: 11,
    status: 'observed_overrun',
    lastUpdated: '2026-10-31 03:00 UTC',
  },
];

const INITIAL_RESOURCES: ResourceCostItem[] = [
  {
    id: 'res-1',
    projectId: 'proj-storefront',
    serviceName: 'Containerized Node.js Build Runners',
    category: 'Compute Runners',
    metric: '184 runner-minutes (12 build executions)',
    unitRate: '$0.045 / runner-min',
    observedCost: 8.28,
    forecastCost: 14.2,
  },
  {
    id: 'res-2',
    projectId: 'proj-storefront',
    serviceName: 'Managed PostgreSQL Instance (db-storefront-prod)',
    category: 'Database Engine',
    metric: '25 GB Provisioned Volume · 720 hrs',
    unitRate: '$0.026 / hr + storage',
    observedCost: 19.42,
    forecastCost: 28.5,
  },
  {
    id: 'res-3',
    projectId: 'proj-storefront',
    serviceName: 'Snapshot NVMe Cold Storage (3 snapshots)',
    category: 'Storage & Snapshots',
    metric: '2.49 GB total snapshot archives',
    unitRate: '$0.08 / GB-mo',
    observedCost: 2.1,
    forecastCost: 3.2,
  },
  {
    id: 'res-4',
    projectId: 'proj-storefront',
    serviceName: 'Edge CDN Data Egress & Routing',
    category: 'Network & CDN',
    metric: '412 GB egress across 3 edge regions',
    unitRate: '$0.021 / GB transfer',
    observedCost: 8.6,
    forecastCost: 12.3,
  },
  {
    id: 'res-5',
    projectId: 'proj-notes',
    serviceName: 'MySQL 8.0 Managed Database (db-mysql-notes)',
    category: 'Database Engine',
    metric: '15 GB Provisioned Volume',
    unitRate: '$0.022 / hr',
    observedCost: 15.8,
    forecastCost: 24.5,
  },
  {
    id: 'res-6',
    projectId: 'proj-notes',
    serviceName: 'API Microservice Container Runners',
    category: 'Compute Runners',
    metric: '92 runner-minutes',
    unitRate: '$0.045 / runner-min',
    observedCost: 4.14,
    forecastCost: 6.8,
  },
  {
    id: 'res-7',
    projectId: 'proj-portal',
    serviceName: 'Legacy MySQL Engine & Storage Volume',
    category: 'Database Engine',
    metric: '30 GB Provisioned Volume (22 GB used)',
    unitRate: '$0.038 / hr',
    observedCost: 29.8,
    forecastCost: 36.5,
  },
  {
    id: 'res-8',
    projectId: 'proj-portal',
    serviceName: 'High-frequency Automated Snapshot Chain',
    category: 'Storage & Snapshots',
    metric: '14 retained snapshot volumes (uncompressed)',
    unitRate: '$0.08 / GB-mo',
    observedCost: 14.2,
    forecastCost: 17.8,
  },
  {
    id: 'res-9',
    projectId: 'proj-portal',
    serviceName: 'Continuous Telemetry Egress',
    category: 'Network & CDN',
    metric: '395 GB transfer',
    unitRate: '$0.021 / GB',
    observedCost: 8.4,
    forecastCost: 9.8,
  },
];

// Daily billing chart points (Day 1 to 30)
const DAILY_CHART_DATA = [
  { day: 1, observed: 1.2, forecast: 1.2 },
  { day: 5, observed: 7.5, forecast: 7.5 },
  { day: 10, observed: 16.8, forecast: 16.8 },
  { day: 15, observed: 27.4, forecast: 27.4 },
  { day: 20, observed: 38.4, forecast: 38.4 },
  { day: 23, observed: null, forecast: 44.2 },
  { day: 26, observed: null, forecast: 50.5 },
  { day: 30, observed: null, forecast: 58.2 },
];

export default function CostAndBudgetPage() {
  const { showToast } = useDashboard();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-storefront');
  const [restrictionModalOpen, setRestrictionModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Selected Project Cost Summary
  const currentProject = useMemo(() => {
    return (
      INITIAL_PROJECTS_COST.find((p) => p.projectId === selectedProjectId) ||
      INITIAL_PROJECTS_COST[0]
    );
  }, [selectedProjectId]);

  // Percentage calculations
  const observedPct = Math.min(
    Math.round((currentProject.observedCostToDate / currentProject.monthlyBudget) * 100),
    100
  );
  const forecastPct = Math.round(
    (currentProject.forecastCost / currentProject.monthlyBudget) * 100
  );

  // Filtered resources for selected project
  const projectResources = useMemo(() => {
    return INITIAL_RESOURCES.filter((res) => {
      const matchProject = res.projectId === currentProject.projectId;
      const matchCat = filterCategory === 'all' || res.category === filterCategory;
      return matchProject && matchCat;
    });
  }, [currentProject.projectId, filterCategory]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* ─── Header ─── */}
      <PageHeader
        action={
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer"
              onClick={() => showToast('Exporting cost report as CSV...')}
              type="button"
            >
              Export CSV Report
            </button>
            <Link
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
              href={`/deployments`}
            >
              Related Deployments
            </Link>
          </div>
        }
        description="Monitor project consumption against baseline budgets, inspect telemetry by cloud resource, and manage spend warnings. Soft thresholds do not disrupt running workloads."
        eyebrow="Financial Operations"
        title="Cost, Budget &amp; Spend Analysis"
      />

      {/* ─── Mandatory Delay & Cloud Provider Disclaimers (Spec 3.9) ─── */}
      <section
        aria-label="Billing telemetry notice"
        className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-2xs space-y-2"
      >
        <div className="flex items-start gap-2.5">
          <IconInfo className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-900 text-xs">
                Billing Telemetry Notice &amp; Platform Limits (Specification 3.9)
              </span>
              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Data recorded as of: {currentProject.lastUpdated}
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900 block">Telemetry Latency Note:</span>
                Billing data may be delayed up to 24–48 hours from underlying cloud infrastructure providers.
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900 block">Soft Control Guarantee:</span>
                DeployX budget thresholds serve as internal governance checkpoints. They are never a guaranteed hard cap on external cloud or AWS charges.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Warning Banners: Forecast Warning vs. Observed Overrun Restriction ─── */}
      {currentProject.status === 'forecast_warning' && (
        <section
          aria-label="Forecast overrun warning"
          className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 text-amber-950 shadow-2xs text-xs space-y-1.5"
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <IconAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 block text-sm">
                  Forecast Warning: Projected Spend Exceeds Monthly Budget
                </span>
                <p className="mt-0.5 text-xs text-amber-900 leading-relaxed">
                  Based on current usage velocity, <strong>{currentProject.projectName}</strong> is projected to reach{' '}
                  <strong className="font-mono">${currentProject.forecastCost.toFixed(2)}</strong> by end-of-month,
                  exceeding the <strong>${currentProject.monthlyBudget.toFixed(2)}</strong> baseline.
                </p>
                <p className="text-[11px] text-amber-800 mt-1 italic">
                  * Specification Rule: A forecast overrun is a forward-looking warning only. It is not an actual overspend and imposes no operational restrictions.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {currentProject.status === 'observed_overrun' && (
        <section
          aria-label="Observed overrun restriction notice"
          className="rounded-xl border border-red-300 bg-red-50/90 p-4 text-red-950 shadow-2xs text-xs space-y-2"
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <IconAlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-950 block text-sm">
                  Observed Overrun Restriction Active
                </span>
                <p className="mt-0.5 text-xs text-red-900 leading-relaxed">
                  Recorded spend to date has exceeded the monthly budget threshold (<strong>${currentProject.observedCostToDate.toFixed(2)}</strong> recorded against <strong>${currentProject.monthlyBudget.toFixed(2)}</strong> budget).
                </p>
                <div className="mt-2 bg-white/80 p-2.5 rounded border border-red-200 text-[11px] space-y-1">
                  <span className="font-bold text-red-950 block">Boundary Guarantees:</span>
                  <ul className="list-disc pl-5 space-y-0.5 text-red-900">
                    <li>New deployment executions for this project are blocked until reconciled.</li>
                    <li><strong>Active running applications are NOT stopped</strong> and continue serving production traffic.</li>
                    <li><strong>Databases and backup archives are NOT deleted</strong> or impacted.</li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-red-300 text-red-700 hover:bg-red-100 rounded-lg shadow-2xs cursor-pointer shrink-0"
              onClick={() => setRestrictionModalOpen(true)}
              type="button"
            >
              View Restriction Details
            </button>
          </div>
        </section>
      )}

      {/* ─── Project Switcher & Monthly Budget Card ─── */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Project Budget &amp; Allocation</h2>
            <p className="text-xs text-slate-500">
              Each project is initialized with a monthly baseline budget of USD $50.00.
            </p>
          </div>

          {/* Project Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium" htmlFor="project-cost-select">
              Active Project:
            </label>
            <select
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              id="project-cost-select"
              onChange={(e) => setSelectedProjectId(e.target.value)}
              value={selectedProjectId}
            >
              {INITIAL_PROJECTS_COST.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectName} {p.status === 'observed_overrun' ? '(Overrun Block)' : p.status === 'forecast_warning' ? '(Warning)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Metric Summary Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tile 1: Monthly Budget */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Monthly Budget Baseline
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900">
                ${currentProject.monthlyBudget.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">USD / cycle</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Initial soft cap limit</p>
          </div>

          {/* Tile 2: Observed Cost To Date */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Observed Cost To Date
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  currentProject.status === 'observed_overrun'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {observedPct}% used
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-bold font-mono ${
                  currentProject.status === 'observed_overrun' ? 'text-red-600' : 'text-slate-900'
                }`}
              >
                ${currentProject.observedCostToDate.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">recorded</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              ${(currentProject.monthlyBudget - currentProject.observedCostToDate > 0
                ? currentProject.monthlyBudget - currentProject.observedCostToDate
                : 0
              ).toFixed(2)}{' '}
              remaining before cap
            </p>
          </div>

          {/* Tile 3: End-of-Month Forecast */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                End-of-Month Forecast
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  currentProject.forecastCost > currentProject.monthlyBudget
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {forecastPct}% projected
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-bold font-mono ${
                  currentProject.forecastCost > currentProject.monthlyBudget
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                ${currentProject.forecastCost.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">projected</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {currentProject.daysRemaining} days remaining in billing cycle
            </p>
          </div>
        </div>

        {/* Progress Bar Visualization */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>
              Observed Spend Progress: <strong className="text-slate-900">${currentProject.observedCostToDate.toFixed(2)}</strong>
            </span>
            <span>
              Budget Ceiling: <strong className="text-slate-900">${currentProject.monthlyBudget.toFixed(2)}</strong>
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
            <div
              className={`h-full transition-all duration-500 ${
                currentProject.status === 'observed_overrun'
                  ? 'bg-red-500'
                  : currentProject.status === 'forecast_warning'
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(observedPct, 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* ─── Comparative Chart: Observed Spend vs Forecast Spend ─── */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Observed Cost vs. Forward Forecast ({currentProject.projectName})
            </h3>
            <p className="text-xs text-slate-500">
              Solid blue indicates verified historical spend; dashed amber represents forward-looking statistical projection.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-600 rounded-xs" />
              <span className="text-slate-700 font-medium">Observed Spend (Recorded)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-amber-500 border-t border-dashed border-amber-600" />
              <span className="text-slate-700 font-medium">Projected Forecast (Estimated)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-red-500 border-t border-dashed border-red-600" />
              <span className="text-slate-700 font-medium">Budget Cap ($50.00)</span>
            </div>
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="w-full overflow-x-auto py-2">
          <div className="min-w-[600px] h-64 relative flex flex-col justify-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 650 200">
              {/* Horizontal Grid lines */}
              <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="640" y1="20" y2="20" />
              <text fill="#94a3b8" fontSize="10" x="5" y="24">$60</text>

              {/* $50 Budget Cap Line */}
              <line stroke="#ef4444" strokeDasharray="4 4" strokeWidth="1.8" x1="40" x2="640" y1="50" y2="50" />
              <text fill="#ef4444" fontSize="10" fontWeight="bold" x="5" y="54">$50</text>

              <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="640" y1="80" y2="80" />
              <text fill="#94a3b8" fontSize="10" x="5" y="84">$40</text>

              <line stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" x1="40" x2="640" y1="120" y2="120" />
              <text fill="#94a3b8" fontSize="10" x="5" y="124">$20</text>

              <line stroke="#cbd5e1" strokeWidth="1.5" x1="40" x2="640" y1="170" y2="170" />
              <text fill="#94a3b8" fontSize="10" x="5" y="174">$0</text>

              {/* Observed Area Fill (Solid Blue) */}
              <polygon
                fill="rgba(37, 99, 235, 0.08)"
                points="40,170 40,166 140,147 240,120 340,88 440,55 440,170"
              />

              {/* Forecast Area Fill (Amber Tint) */}
              <polygon
                fill="rgba(245, 158, 11, 0.08)"
                points="440,170 440,55 500,37 570,18 640,-5 640,170"
              />

              {/* Observed Spend Path (Solid Blue Line) */}
              <path
                d="M 40,166 L 140,147 L 240,120 L 340,88 L 440,55"
                fill="none"
                stroke="#2563eb"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />

              {/* Forecast Spend Path (Dashed Amber Line) */}
              <path
                d="M 440,55 L 500,37 L 570,18 L 640,-5"
                fill="none"
                stroke="#d97706"
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />

              {/* Observed Data Points */}
              <circle cx="40" cy="166" fill="#2563eb" r="4" stroke="#ffffff" strokeWidth="2" />
              <circle cx="140" cy="147" fill="#2563eb" r="4" stroke="#ffffff" strokeWidth="2" />
              <circle cx="240" cy="120" fill="#2563eb" r="4" stroke="#ffffff" strokeWidth="2" />
              <circle cx="340" cy="88" fill="#2563eb" r="4" stroke="#ffffff" strokeWidth="2" />
              <circle cx="440" cy="55" fill="#2563eb" r="5" stroke="#ffffff" strokeWidth="2" />

              {/* Forecast Data Points */}
              <circle cx="500" cy="37" fill="#d97706" r="4" stroke="#ffffff" strokeWidth="2" />
              <circle cx="570" cy="18" fill="#d97706" r="4" stroke="#ffffff" strokeWidth="2" />
              <circle cx="640" cy="-5" fill="#d97706" r="5" stroke="#ffffff" strokeWidth="2" />

              {/* X Axis Day Labels */}
              <text fill="#64748b" fontSize="10" textAnchor="middle" x="40" y="190">Day 1</text>
              <text fill="#64748b" fontSize="10" textAnchor="middle" x="140" y="190">Day 5</text>
              <text fill="#64748b" fontSize="10" textAnchor="middle" x="240" y="190">Day 10</text>
              <text fill="#64748b" fontSize="10" textAnchor="middle" x="340" y="190">Day 15</text>
              <text fill="#2563eb" fontSize="10" fontWeight="bold" textAnchor="middle" x="440" y="190">Day 20 (Today)</text>
              <text fill="#d97706" fontSize="10" textAnchor="middle" x="500" y="190">Day 23</text>
              <text fill="#d97706" fontSize="10" textAnchor="middle" x="570" y="190">Day 26</text>
              <text fill="#d97706" fontSize="10" fontWeight="bold" textAnchor="middle" x="630" y="190">Day 30 (End)</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ─── Cost Breakdown by Resource & Service ─── */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Resource Telemetry &amp; Line-Item Spend ({currentProject.projectName})
            </h3>
            <p className="text-xs text-slate-500">
              Detailed breakdown of compute runners, storage blocks, and edge network delivery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filter cost category"
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              onChange={(e) => setFilterCategory(e.target.value)}
              value={filterCategory}
            >
              <option value="all">All Service Categories</option>
              <option value="Compute Runners">Compute Runners</option>
              <option value="Database Engine">Database Engine</option>
              <option value="Storage & Snapshots">Storage &amp; Snapshots</option>
              <option value="Network & CDN">Network &amp; CDN</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Service &amp; Resource</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Usage Recorded</th>
                <th className="py-3 px-4">Unit Rate</th>
                <th className="py-3 px-4 font-mono">Observed Cost</th>
                <th className="py-3 px-4 font-mono">Forecast Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectResources.map((res) => (
                <tr className="hover:bg-slate-50/70 transition-colors" key={res.id}>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">{res.serviceName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">ID: {res.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {res.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{res.metric}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{res.unitRate}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    ${res.observedCost.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-700 font-medium">
                    ${res.forecastCost.toFixed(2)}
                  </td>
                </tr>
              ))}
              {projectResources.length === 0 && (
                <tr>
                  <td className="py-8 text-center text-slate-500 text-xs" colSpan={6}>
                    No line-item records found for this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── RESTRICTION DETAILS MODAL ─── */}
      {restrictionModalOpen && (
        <div
          aria-labelledby="restriction-modal-title"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
          role="dialog"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900" id="restriction-modal-title">
                Observed Overrun Restriction Scope
              </h3>
              <button
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-600 rounded p-1 cursor-pointer"
                onClick={() => setRestrictionModalOpen(false)}
                type="button"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
              <p>
                Project <strong>{currentProject.projectName}</strong> has accumulated{' '}
                <strong className="text-red-600">${currentProject.observedCostToDate.toFixed(2)}</strong> in verified spend,
                exceeding the baseline allocation of <strong>$50.00</strong>.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-900 block">Enforcement Boundary:</span>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li className="flex items-center gap-1.5 text-red-700 font-medium">
                    <span>✕</span> New deployment builds are blocked until the billing cycle resets or budget is adjusted.
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <span>✓</span> Running production applications remain active and uninterrupted.
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <span>✓</span> Managed databases and storage volumes are never shut down or deleted.
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <span>✓</span> Automated and protected backup archives are preserved.
                  </li>
                </ul>
              </div>

              <p className="text-[11px] text-slate-500">
                To resume build deployments, contact your workspace administrator or request a budget baseline increase.
              </p>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
                onClick={() => setRestrictionModalOpen(false)}
                type="button"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export { CostAndBudgetPage };

