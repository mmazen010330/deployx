'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/src/context/DashboardContext';
import { StatusBadge, type OperationStatus } from '@/src/components/ui/StatusBadge';
import { PageHeader } from '@/src/components/ui/PageHeader';
import {
  IconRocket,
  IconSearch,
  IconCheck,
  IconCircleX,
  IconSpinner,
  IconAlertCircle,
  IconClock,
  IconDatabase,
  IconTerminal,
  IconPlus,
  IconX,
  IconInfo,
  IconChevronRight,
} from '@/src/icons';

// ─── Types & Data Models ───────────────────────────────────────────────────────

export type StageName = 'accepted' | 'building' | 'provisioning' | 'deploying' | 'health_check';
export type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface StageInfo {
  name: StageName;
  label: string;
  status: StageStatus;
  startedAt?: string;
  duration?: string;
  details?: string;
}

export interface LogLine {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';
  message: string;
}

export interface DiagnosticsFinding {
  category: 'Build' | 'Infrastructure' | 'Application runtime';
  title: string;
  evidence: string;
  details: string;
  recommendedAction?: string;
}

export interface HealthCheckResult {
  status: 'Online' | 'Degraded' | 'Offline';
  endpoint: string;
  httpStatus: number | null;
  latencyMs: number | null;
  tlsValid: boolean;
  checkedAt: string;
}

export interface DeploymentRecord {
  id: string;
  project: string;
  branch: string;
  commitHash: string;
  commitMessage: string;
  appType: 'node' | 'react' | 'static' | 'php';
  status: OperationStatus;
  environment: 'Production' | 'Staging' | 'Preview';
  startedAt: string;
  duration: string;
  stages: StageInfo[];
  diagnostics?: DiagnosticsFinding;
  healthCheck?: HealthCheckResult;
  buildLogs: LogLine[];
  runtimeLogs: LogLine[];
  logsState?: 'normal' | 'missing' | 'expired' | 'incomplete';
  databaseConnected?: string;
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_DEPLOYMENTS: DeploymentRecord[] = [
  {
    id: 'dep-9f82c1',
    project: 'Storefront',
    branch: 'release/v2.1',
    commitHash: '#a91f3c2',
    commitMessage: 'Update storefront checkout layout',
    appType: 'node',
    status: 'failed',
    environment: 'Production',
    startedAt: '18 min ago (02:50:12 UTC)',
    duration: '1m 42s',
    databaseConnected: 'PostgreSQL (db-storefront-prod)',
    stages: [
      { name: 'accepted', label: 'Accepted', status: 'completed', startedAt: '02:50:12 UTC', duration: '6s', details: 'Payload validated and runner queued' },
      { name: 'building', label: 'Building', status: 'failed', startedAt: '02:50:18 UTC', duration: '1m 36s', details: 'Build exit code 1: missing npm package' },
      { name: 'provisioning', label: 'Provisioning', status: 'skipped', details: 'Skipped because building stage failed' },
      { name: 'deploying', label: 'Deploying', status: 'skipped', details: 'Skipped because building stage failed' },
      { name: 'health_check', label: 'Health Check', status: 'skipped', details: 'Skipped because building stage failed' },
    ],
    diagnostics: {
      category: 'Build',
      title: 'Missing Package Dependency',
      evidence: "Cannot resolve dependency '@stripe/stripe-js' in ./app/checkout/page.tsx",
      details: 'Build worker detected an unresolvable import. The package is referenced in the application code but not declared in package.json.',
      recommendedAction: "Add '@stripe/stripe-js' to package.json dependencies and commit changes to branch 'release/v2.1' (tag v2.1.0).",
    },
    healthCheck: {
      status: 'Degraded',
      endpoint: 'https://storefront.deployx.app/healthz',
      httpStatus: 200,
      latencyMs: 38,
      tlsValid: true,
      checkedAt: '02:51:55 UTC (Serving prior healthy build v2.0.9)',
    },
    buildLogs: [
      { id: 'b1', timestamp: '02:50:12 UTC', severity: 'SYSTEM', message: 'Runner node-20-runner-04 provisioned. Node.js v20.11.0, pnpm v8.15.1.' },
      { id: 'b2', timestamp: '02:50:15 UTC', severity: 'INFO', message: 'Cloning repository git@github.com:deployx/storefront.git...' },
      { id: 'b3', timestamp: '02:50:18 UTC', severity: 'INFO', message: 'Checked out branch release/v2.1 at commit a91f3c2.' },
      { id: 'b4', timestamp: '02:50:20 UTC', severity: 'INFO', message: 'Running: pnpm install --frozen-lockfile' },
      { id: 'b5', timestamp: '02:50:45 UTC', severity: 'INFO', message: 'Packages installed successfully (142 packages in 25s).' },
      { id: 'b6', timestamp: '02:50:46 UTC', severity: 'INFO', message: 'Executing build command: pnpm run build' },
      { id: 'b7', timestamp: '02:51:14 UTC', severity: 'INFO', message: 'Compiling client and server bundles...' },
      { id: 'b8', timestamp: '02:51:48 UTC', severity: 'ERROR', message: "Module not found: Can't resolve '@stripe/stripe-js' in '/workspace/app/checkout/page.tsx'" },
      { id: 'b9', timestamp: '02:51:54 UTC', severity: 'ERROR', message: 'Process exited with non-zero exit code (1). Halting pipeline.' },
    ],
    runtimeLogs: [],
    logsState: 'normal',
  },
  {
    id: 'dep-84b119',
    project: 'Team Wiki',
    branch: 'main',
    commitHash: '#4d71e80',
    commitMessage: 'Add developer onboarding guide',
    appType: 'react',
    status: 'running',
    environment: 'Production',
    startedAt: '4 min ago (03:04:22 UTC)',
    duration: '4m 12s',
    stages: [
      { name: 'accepted', label: 'Accepted', status: 'completed', startedAt: '03:04:22 UTC', duration: '4s', details: 'Webhook confirmed' },
      { name: 'building', label: 'Building', status: 'completed', startedAt: '03:04:26 UTC', duration: '2m 14s', details: 'Static assets bundled to /dist' },
      { name: 'provisioning', label: 'Provisioning', status: 'running', startedAt: '03:06:40 UTC', duration: '1m 54s', details: 'Allocating edge CDN distribution & DNS propagation' },
      { name: 'deploying', label: 'Deploying', status: 'pending', details: 'Waiting for edge provisioning' },
      { name: 'health_check', label: 'Health Check', status: 'pending', details: 'Waiting for deployment' },
    ],
    buildLogs: [
      { id: 'w1', timestamp: '03:04:22 UTC', severity: 'SYSTEM', message: 'Worker assigned: static-builder-02' },
      { id: 'w2', timestamp: '03:04:26 UTC', severity: 'INFO', message: 'Fetched branch main (commit 4d71e80)' },
      { id: 'w3', timestamp: '03:05:10 UTC', severity: 'INFO', message: 'Vite build completed: 34 files emitted' },
      { id: 'w4', timestamp: '03:06:40 UTC', severity: 'SYSTEM', message: 'Dispatching payload to edge storage network...' },
    ],
    runtimeLogs: [],
    logsState: 'incomplete',
  },
  {
    id: 'dep-7102fa',
    project: 'Notes API',
    branch: 'main',
    commitHash: '#8f20cb4',
    commitMessage: 'Optimize query indexing for note search',
    appType: 'node',
    status: 'running',
    environment: 'Production',
    startedAt: '2 min ago (03:06:10 UTC)',
    duration: '2m 05s',
    stages: [
      { name: 'accepted', label: 'Accepted', status: 'completed', startedAt: '03:06:10 UTC', duration: '3s' },
      { name: 'building', label: 'Building', status: 'running', startedAt: '03:06:13 UTC', duration: '2m 02s', details: 'Compiling TypeScript definitions' },
      { name: 'provisioning', label: 'Provisioning', status: 'pending' },
      { name: 'deploying', label: 'Deploying', status: 'pending' },
      { name: 'health_check', label: 'Health Check', status: 'pending' },
    ],
    buildLogs: [
      { id: 'n1', timestamp: '03:06:10 UTC', severity: 'SYSTEM', message: 'Node build job triggered' },
      { id: 'n2', timestamp: '03:06:18 UTC', severity: 'INFO', message: 'tsc -p tsconfig.json executing...' },
    ],
    runtimeLogs: [],
    logsState: 'incomplete',
  },
  {
    id: 'dep-63c8a1',
    project: 'Analytics Worker',
    branch: 'staging',
    commitHash: '#11ab56e',
    commitMessage: 'Update aggregation schedule',
    appType: 'node',
    status: 'running',
    environment: 'Staging',
    startedAt: '1 min ago (03:07:30 UTC)',
    duration: '1m 15s',
    stages: [
      { name: 'accepted', label: 'Accepted', status: 'running', startedAt: '03:07:30 UTC', duration: '1m 15s', details: 'Container sandbox spin-up in progress' },
      { name: 'building', label: 'Building', status: 'pending' },
      { name: 'provisioning', label: 'Provisioning', status: 'pending' },
      { name: 'deploying', label: 'Deploying', status: 'pending' },
      { name: 'health_check', label: 'Health Check', status: 'pending' },
    ],
    buildLogs: [
      { id: 'a1', timestamp: '03:07:30 UTC', severity: 'SYSTEM', message: 'Queued for staging cluster runner' },
    ],
    runtimeLogs: [],
    logsState: 'incomplete',
  },
  {
    id: 'dep-501b8a',
    project: 'Portfolio',
    branch: 'main',
    commitHash: '#3c90e21',
    commitMessage: 'Refresh project showcase items',
    appType: 'static',
    status: 'successful',
    environment: 'Production',
    startedAt: '3 hours ago (00:15:00 UTC)',
    duration: '48s',
    stages: [
      { name: 'accepted', label: 'Accepted', status: 'completed', startedAt: '00:15:00 UTC', duration: '3s' },
      { name: 'building', label: 'Building', status: 'completed', startedAt: '00:15:03 UTC', duration: '20s' },
      { name: 'provisioning', label: 'Provisioning', status: 'completed', startedAt: '00:15:23 UTC', duration: '12s' },
      { name: 'deploying', label: 'Deploying', status: 'completed', startedAt: '00:15:35 UTC', duration: '8s' },
      { name: 'health_check', label: 'Health Check', status: 'completed', startedAt: '00:15:43 UTC', duration: '5s' },
    ],
    healthCheck: {
      status: 'Online',
      endpoint: 'https://portfolio.deployx.app/healthz',
      httpStatus: 200,
      latencyMs: 22,
      tlsValid: true,
      checkedAt: '00:15:48 UTC',
    },
    buildLogs: [
      { id: 'p1', timestamp: '00:15:00 UTC', severity: 'SYSTEM', message: 'Build started' },
      { id: 'p2', timestamp: '00:15:20 UTC', severity: 'INFO', message: 'HTML and CSS minification completed' },
      { id: 'p3', timestamp: '00:15:48 UTC', severity: 'SYSTEM', message: 'Deployment online' },
    ],
    runtimeLogs: [
      { id: 'pr1', timestamp: '00:16:02 UTC', severity: 'INFO', message: 'HTTP 200 GET / 24ms' },
      { id: 'pr2', timestamp: '00:18:14 UTC', severity: 'INFO', message: 'HTTP 200 GET /about 18ms' },
    ],
    logsState: 'normal',
  },
  {
    id: 'dep-41e97d',
    project: 'Customer Portal',
    branch: 'hotfix/session-fix',
    commitHash: '#b842cd1',
    commitMessage: 'Reconcile auth session cache',
    appType: 'node',
    status: 'unresolved',
    environment: 'Production',
    startedAt: 'Yesterday (18:22:10 UTC)',
    duration: 'Indeterminate',
    stages: [
      { name: 'accepted', label: 'Accepted', status: 'completed', startedAt: '18:22:10 UTC', duration: '5s' },
      { name: 'building', label: 'Building', status: 'completed', startedAt: '18:22:15 UTC', duration: '1m 20s' },
      { name: 'provisioning', label: 'Provisioning', status: 'running', startedAt: '18:23:35 UTC', details: 'Heartbeat signal lost during node maintenance' },
      { name: 'deploying', label: 'Deploying', status: 'pending' },
      { name: 'health_check', label: 'Health Check', status: 'pending' },
    ],
    diagnostics: {
      category: 'Infrastructure',
      title: 'Runner Heartbeat Signal Lost',
      evidence: 'No telemetry packet received from runner worker-infra-09 for > 3600 seconds.',
      details: 'The infrastructure runner stopped emitting state pulses before completing provisioning. DeployX cannot determine whether the container image was committed without reconciling with the orchestration plane.',
      recommendedAction: 'Trigger "Reconcile Status" to verify cluster state, then retry or redeploy once reconciled.',
    },
    buildLogs: [
      { id: 'u1', timestamp: '18:22:10 UTC', severity: 'SYSTEM', message: 'Accepted by scheduler' },
      { id: 'u2', timestamp: '18:23:35 UTC', severity: 'WARN', message: 'Runner heartbeat delayed (30s threshold)' },
      { id: 'u3', timestamp: '18:28:00 UTC', severity: 'ERROR', message: 'Runner node-infra-09 declared unreachable. Status marked Unresolved.' },
    ],
    runtimeLogs: [],
    logsState: 'expired',
  },
];

// Supported application runtime descriptors
const SUPPORTED_APP_TYPES = [
  { id: 'node', name: 'Node.js', desc: 'Containerized Node.js application (v18, v20, v22)', supported: true },
  { id: 'react', name: 'React Static Build', desc: 'Single-page React or Vite application static bundle', supported: true },
  { id: 'static', name: 'Static Web Application', desc: 'Pure HTML, CSS, JavaScript web assets', supported: true },
  { id: 'php', name: 'Containerized PHP', desc: 'PHP 8.2+ container runtime with web server', supported: true },
  { id: 'python', name: 'Python (Django/FastAPI)', desc: 'Scheduled for DeployX V2 runtime engine', supported: false },
  { id: 'ruby', name: 'Ruby on Rails', desc: 'Scheduled for DeployX V2 runtime engine', supported: false },
];

export default function DeploymentsPage() {
  const { showToast } = useDashboard();
  const [deployments, setDeployments] = useState<DeploymentRecord[]>(INITIAL_DEPLOYMENTS);
  const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');
  const [selectedId, setSelectedId] = useState<string>('dep-9f82c1');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Log viewer state
  const [logType, setLogType] = useState<'build' | 'runtime'>('build');
  const [logSeverity, setLogSeverity] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO'>('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deploymentToDelete, setDeploymentToDelete] = useState<DeploymentRecord | null>(null);

  // New Deployment Form state
  const [formProject, setFormProject] = useState('Storefront');
  const [formBranch, setFormBranch] = useState('main');
  const [formCommit, setFormCommit] = useState('HEAD');
  const [formAppType, setFormAppType] = useState('node');
  const [formBuildCmd, setFormBuildCmd] = useState('pnpm run build');
  const [formOutputDir, setFormOutputDir] = useState('.next');
  const [formDb, setFormDb] = useState<'none' | 'mysql' | 'postgres'>('none');
  const [formDbName, setFormDbName] = useState('deployx_db');
  const [envVars, setEnvVars] = useState<Array<{ id: string; key: string; value: string; isSensitive: boolean; showPlain: boolean }>>([
    { id: 'e1', key: 'NODE_ENV', value: 'production', isSensitive: false, showPlain: true },
    { id: 'e2', key: 'STRIPE_SECRET_KEY', value: 'sk_live_51M00deployxsecr3tKEY', isSensitive: true, showPlain: false },
  ]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Active running deployments calculation
  const runningCount = useMemo(() => {
    return deployments.filter((d) => d.status === 'running').length;
  }, [deployments]);

  const isBlocked = runningCount >= 3;

  // Selected deployment record
  const selectedDeployment = useMemo(() => {
    return deployments.find((d) => d.id === selectedId) || deployments[0];
  }, [deployments, selectedId]);

  // Filtered deployment list
  const filteredDeployments = useMemo(() => {
    return deployments.filter((d) => {
      const matchSearch =
        !searchQuery ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.commitHash.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchProject = projectFilter === 'all' || d.project === projectFilter;

      return matchSearch && matchStatus && matchProject;
    });
  }, [deployments, searchQuery, statusFilter, projectFilter]);

  // Filtered logs
  const visibleLogs = useMemo(() => {
    if (!selectedDeployment) return [];
    const sourceLogs = logType === 'build' ? selectedDeployment.buildLogs : selectedDeployment.runtimeLogs;

    return sourceLogs.filter((log) => {
      const matchSeverity = logSeverity === 'ALL' || log.severity === logSeverity;
      const matchText = !logSearch || log.message.toLowerCase().includes(logSearch.toLowerCase());
      return matchSeverity && matchText;
    });
  }, [selectedDeployment, logType, logSeverity, logSearch]);

  // Handlers
  const handleCopyLogs = () => {
    if (!visibleLogs.length) {
      showToast('No log lines to copy.');
      return;
    }
    const text = visibleLogs.map((l) => `[${l.timestamp}] [${l.severity}] ${l.message}`).join('\n');
    navigator.clipboard?.writeText(text);
    showToast('Logs copied to clipboard.');
  };

  const handleRetry = (dep: DeploymentRecord) => {
    if (dep.status === 'unresolved') {
      showToast('Cannot retry an unresolved deployment until status is reconciled.');
      return;
    }
    showToast(`Retrying ${dep.project} (${dep.id}) build stage...`);
    setDeployments((prev) =>
      prev.map((d) =>
        d.id === dep.id
          ? {
              ...d,
              status: 'running',
              stages: d.stages.map((s, idx) => (idx === 1 ? { ...s, status: 'running', details: 'Re-running build step' } : s)),
            }
          : d
      )
    );
  };

  const handleRedeploy = (dep: DeploymentRecord) => {
    if (dep.status === 'unresolved') {
      showToast('Cannot redeploy an unresolved deployment until status is reconciled.');
      return;
    }
    if (isBlocked) {
      showToast('Blocked: Maximum 3 concurrent deployments active. Wait for one to finish.');
      return;
    }
    showToast(`Triggered full redeployment for ${dep.project} (${dep.branch}).`);
  };

  const handleReconcile = (depId: string) => {
    showToast('Reconciling deployment status with cluster orchestration...');
    setTimeout(() => {
      setDeployments((prev) =>
        prev.map((d) =>
          d.id === depId
            ? {
                ...d,
                status: 'failed',
                stages: d.stages.map((s) => (s.status === 'running' ? { ...s, status: 'failed', details: 'Confirmed timed out during runner partition' } : s)),
                diagnostics: {
                  category: 'Infrastructure',
                  title: 'Runner Host Failure Confirmed',
                  evidence: 'Worker node terminated unexpectedly during provisioning stage.',
                  details: 'Cluster status confirmed host dropped connection. Deployment has been cleanly marked Failed.',
                  recommendedAction: 'Retry deployment with a fresh runner.',
                },
              }
            : d
        )
      );
      showToast('Status reconciled: Deployment marked Failed. You may now retry or delete.');
    }, 800);
  };

  const confirmDeleteDeployment = () => {
    if (!deploymentToDelete) return;
    setDeployments((prev) => prev.filter((d) => d.id !== deploymentToDelete.id));
    showToast(`Deployment ${deploymentToDelete.id} removed. Databases and backups remain intact.`);
    setDeleteModalOpen(false);
    setDeploymentToDelete(null);
  };

  const handleStartDeployment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      showToast('Blocked: Concurrent deployment limit (3) reached.');
      return;
    }

    const errors: { [key: string]: string } = {};
    if (!formProject.trim()) errors.project = 'Project name is required';
    if (!formBranch.trim()) errors.branch = 'Branch is required (e.g. main, release/v2.1)';
    if (!formBuildCmd.trim()) errors.buildCmd = 'Build command is required';
    if (!formOutputDir.trim()) errors.outputDir = 'Output directory is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please resolve validation errors before starting deployment.');
      return;
    }

    setFormErrors({});

    const newDepId = `dep-${Math.random().toString(36).substring(2, 8)}`;
    const newRecord: DeploymentRecord = {
      id: newDepId,
      project: formProject,
      branch: formBranch,
      commitHash: formCommit === 'HEAD' ? '#7a81b2e' : formCommit,
      commitMessage: 'Manual deployment triggered from DeployX console',
      appType: formAppType as any,
      status: 'running',
      environment: 'Production',
      startedAt: 'Just now',
      duration: '0s',
      databaseConnected: formDb !== 'none' ? `${formDb === 'mysql' ? 'MySQL' : 'PostgreSQL'} (${formDbName})` : undefined,
      stages: [
        { name: 'accepted', label: 'Accepted', status: 'completed', startedAt: 'Just now', duration: '2s' },
        { name: 'building', label: 'Building', status: 'running', startedAt: 'Just now', details: 'Installing packages' },
        { name: 'provisioning', label: 'Provisioning', status: 'pending' },
        { name: 'deploying', label: 'Deploying', status: 'pending' },
        { name: 'health_check', label: 'Health Check', status: 'pending' },
      ],
      buildLogs: [
        { id: 'init-1', timestamp: 'Just now', severity: 'SYSTEM', message: `Deployment ${newDepId} accepted by queue runner` },
        { id: 'init-2', timestamp: 'Just now', severity: 'INFO', message: `Executing build command: ${formBuildCmd}` },
      ],
      runtimeLogs: [],
      logsState: 'incomplete',
    };

    setDeployments((prev) => [newRecord, ...prev]);
    setSelectedId(newDepId);
    setActiveTab('history');
    showToast(`Deployment ${newDepId} started.`);
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* ─── Top Header ─── */}
      <PageHeader
        eyebrow="Release Engineering"
        title="Deployments"
        description="Monitor real-time deployment pipelines, inspect multi-stage telemetry, review build/runtime logs, and resolve diagnostic findings."
        action={
          <div className="flex items-center gap-2">
            <button
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setActiveTab('history')}
              type="button"
            >
              <IconRocket className="w-4 h-4" />
              History &amp; Diagnostics
            </button>
            <button
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setActiveTab('new')}
              type="button"
            >
              <IconPlus className="w-4 h-4" />
              New Deployment
              {isBlocked && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded-full font-bold">
                  Limit 3
                </span>
              )}
            </button>
          </div>
        }
      />

      {/* ─── Running Deployments Limit Notification ─── */}
      {isBlocked && (
        <section
          aria-label="Runner capacity notice"
          className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-amber-900 shadow-2xs"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <IconAlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold text-amber-950 block text-sm">
                Concurrent Runner Capacity Reached (3 / 3 Active Deployments)
              </span>
              <p className="mt-1">
                DeployX limits concurrent builds to 3 to prevent runner contention and rate-limiting.
                Starting new deployments is blocked until at least one currently running job finishes or is reconciled.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {deployments
                  .filter((d) => d.status === 'running')
                  .map((d) => (
                    <button
                      className="px-2 py-1 bg-white border border-amber-300 rounded text-[11px] font-mono text-amber-900 hover:bg-amber-100 cursor-pointer"
                      key={d.id}
                      onClick={() => {
                        setSelectedId(d.id);
                        setActiveTab('history');
                      }}
                      type="button"
                    >
                      {d.project} ({d.id})
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── VIEW 1: NEW DEPLOYMENT CONFIGURATION FORM (Section 3.5) ─── */}
      {activeTab === 'new' && (
        <div className="space-y-6">
          <form className="space-y-6" onSubmit={handleStartDeployment}>
            {/* Blocked Alert Banner if blocked */}
            {isBlocked && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-red-950">
                  <IconCircleX className="w-4 h-4 text-red-600" />
                  Cannot Start New Deployment: Limit Reached
                </div>
                <p>
                  You already have 3 running deployments. You must wait for one to complete before triggering a new run.
                </p>
              </div>
            )}

            {/* Supported Application Types Card */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Supported Runtime Environments</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Only supported options appear as working controls. Unsupported platforms are disabled per system specification.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                  4 Supported Runtimes
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUPPORTED_APP_TYPES.map((type) => {
                  const isSelected = formAppType === type.id;
                  return (
                    <div
                      className={`p-3.5 rounded-lg border text-left transition-all ${
                        !type.supported
                          ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500 cursor-pointer'
                          : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                      }`}
                      key={type.id}
                      onClick={() => {
                        if (type.supported) setFormAppType(type.id);
                      }}
                      role="button"
                      tabIndex={type.supported ? 0 : -1}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{type.name}</span>
                        {type.supported ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                            Supported
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.2 rounded">
                            Not Supported
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{type.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Grouped Settings 1: Project & Source */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Project &amp; Git Source</h3>
                <p className="text-xs text-slate-500">Configure target repository and branch parameters.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dep-proj-name">
                    Target Project <span className="text-red-500 font-bold">*</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Required)</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    id="dep-proj-name"
                    onChange={(e) => setFormProject(e.target.value)}
                    value={formProject}
                  >
                    <option value="Storefront">Storefront (Node.js)</option>
                    <option value="Team Wiki">Team Wiki (React Static)</option>
                    <option value="Notes API">Notes API (Node.js)</option>
                    <option value="Portfolio">Portfolio (Static Web)</option>
                    <option value="Customer Portal">Customer Portal (PHP/Node)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dep-proj-branch">
                    Git Branch <span className="text-red-500 font-bold">*</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Required)</span>
                  </label>
                  <input
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      formErrors.branch ? 'border-red-500' : 'border-slate-200'
                    }`}
                    id="dep-proj-branch"
                    onChange={(e) => setFormBranch(e.target.value)}
                    placeholder="main or release/v2.1"
                    type="text"
                    value={formBranch}
                  />
                  {formErrors.branch ? (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.branch}</p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">Branch will remain linked across all build logs.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dep-proj-commit">
                    Commit Ref or Tag <span className="text-[10px] text-slate-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    id="dep-proj-commit"
                    onChange={(e) => setFormCommit(e.target.value)}
                    placeholder="HEAD"
                    type="text"
                    value={formCommit}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Defaults to latest HEAD commit on branch.</p>
                </div>
              </div>
            </section>

            {/* Grouped Settings 2: Build & Output */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Build Commands &amp; Output Directory</h3>
                <p className="text-xs text-slate-500">Pipeline compilation and asset collection rules.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dep-build-cmd">
                    Build Command <span className="text-red-500 font-bold">*</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Required)</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    id="dep-build-cmd"
                    onChange={(e) => setFormBuildCmd(e.target.value)}
                    type="text"
                    value={formBuildCmd}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">e.g. pnpm run build, npm run build, or vite build</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dep-output-dir">
                    Output Directory <span className="text-red-500 font-bold">*</span>
                    <span className="text-[10px] text-slate-400 font-normal ml-1">(Required)</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    id="dep-output-dir"
                    onChange={(e) => setFormOutputDir(e.target.value)}
                    type="text"
                    value={formOutputDir}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">e.g. .next, dist, public, or build</p>
                </div>
              </div>
            </section>

            {/* Grouped Settings 3: Sensitive Settings & Environment Variables */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Environment Variables &amp; Secrets</h3>
                  <p className="text-xs text-slate-500">
                    Sensitive values are masked by default and never printed in plain text.
                  </p>
                </div>
                <button
                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1 cursor-pointer"
                  onClick={() =>
                    setEnvVars((prev) => [
                      ...prev,
                      { id: `e-${Date.now()}`, key: '', value: '', isSensitive: false, showPlain: true },
                    ])
                  }
                  type="button"
                >
                  <IconPlus className="w-3.5 h-3.5" />
                  Add Variable
                </button>
              </div>

              <div className="space-y-3">
                {envVars.map((env, idx) => (
                  <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/50" key={env.id}>
                    <div className="w-full sm:w-48">
                      <label className="sr-only" htmlFor={`env-key-${idx}`}>Environment variable name</label>
                      <input
                        className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                        id={`env-key-${idx}`}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEnvVars((prev) => prev.map((item, i) => (i === idx ? { ...item, key: val } : item)));
                        }}
                        placeholder="KEY_NAME"
                        type="text"
                        value={env.key}
                      />
                    </div>
                    <div className="w-full sm:flex-1 relative">
                      <label className="sr-only" htmlFor={`env-val-${idx}`}>Environment variable value</label>
                      <input
                        className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 pr-16"
                        id={`env-val-${idx}`}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEnvVars((prev) => prev.map((item, i) => (i === idx ? { ...item, value: val } : item)));
                        }}
                        placeholder="Value"
                        type={env.isSensitive && !env.showPlain ? 'password' : 'text'}
                        value={env.value}
                      />
                      {env.isSensitive && (
                        <button
                          className="absolute right-2 top-1.5 text-[10px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                          onClick={() => {
                            setEnvVars((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, showPlain: !item.showPlain } : item))
                            );
                          }}
                          type="button"
                        >
                          {env.showPlain ? 'Mask' : 'Reveal'}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 select-none cursor-pointer">
                        <input
                          checked={env.isSensitive}
                          className="rounded text-blue-600 focus:ring-blue-500"
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setEnvVars((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, isSensitive: checked, showPlain: !checked } : item
                              )
                            );
                          }}
                          type="checkbox"
                        />
                        <span className="text-[11px] font-medium">Sensitive Secret</span>
                      </label>
                      <button
                        aria-label="Remove variable"
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        onClick={() => setEnvVars((prev) => prev.filter((_, i) => i !== idx))}
                        type="button"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Grouped Settings 4: Optional Database Configuration */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Optional Database Configuration</h3>
                    <p className="text-xs text-slate-500">
                      Link managed MySQL or PostgreSQL storage. Deleting a deployment does not delete database resources.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    Optional
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dep-db-engine">
                    Database Engine
                  </label>
                  <select
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    id="dep-db-engine"
                    onChange={(e) => setFormDb(e.target.value as any)}
                    value={formDb}
                  >
                    <option value="none">None (No database attached)</option>
                    <option value="postgres">PostgreSQL Database (Managed v15)</option>
                    <option value="mysql">MySQL Database (Managed v8.0)</option>
                  </select>
                </div>
                {formDb !== 'none' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dep-db-name">
                      Database Instance Name
                    </label>
                    <input
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      id="dep-db-name"
                      onChange={(e) => setFormDbName(e.target.value)}
                      type="text"
                      value={formDbName}
                    />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                <span className="font-semibold text-blue-900">Isolation Guarantee:</span> Database credentials are bound to application container secrets via TLS sockets. Deleting the deployment will not affect database data or automatic snapshots.
              </p>
            </section>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                onClick={() => setActiveTab('history')}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer"
                onClick={() => showToast('Configuration saved as pipeline default.')}
                type="button"
              >
                Save Configuration
              </button>
              <button
                className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                  isBlocked
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                }`}
                disabled={isBlocked}
                type="submit"
              >
                <IconRocket className="w-4 h-4" />
                Start Deployment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── VIEW 2: DEPLOYMENTS HISTORY & DETAILS (Section 3.6 - SCR-09, SCR-10) ─── */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* ─── History Table (SCR-09) ─── */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Deployment History</h2>
                <p className="text-xs text-slate-500">
                  Showing {filteredDeployments.length} of {deployments.length} recorded deployments across all projects.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-44 sm:w-52">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <IconSearch className="w-3.5 h-3.5" />
                  </span>
                  <input
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ID, project, branch..."
                    type="text"
                    value={searchQuery}
                  />
                </div>

                <select
                  aria-label="Filter deployments by status"
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  value={statusFilter}
                >
                  <option value="all">All Statuses</option>
                  <option value="running">Running</option>
                  <option value="successful">Successful</option>
                  <option value="failed">Failed</option>
                  <option value="unresolved">Unresolved</option>
                </select>

                <select
                  aria-label="Filter deployments by project"
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setProjectFilter(e.target.value)}
                  value={projectFilter}
                >
                  <option value="all">All Projects</option>
                  <option value="Storefront">Storefront</option>
                  <option value="Team Wiki">Team Wiki</option>
                  <option value="Notes API">Notes API</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Customer Portal">Customer Portal</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Deployment ID</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Branch &amp; Commit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Started</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDeployments.map((dep) => {
                    const isSelected = dep.id === selectedId;
                    return (
                      <tr
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/50 hover:bg-blue-50/70' : 'hover:bg-slate-50/80'
                        }`}
                        key={dep.id}
                        onClick={() => setSelectedId(dep.id)}
                      >
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">
                          <div className="flex items-center gap-1.5">
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                            <span>{dep.id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {dep.project}
                          <span className="block text-[11px] font-normal text-slate-500">{dep.environment}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                            {dep.branch}
                          </span>
                          <span className="block text-[11px] font-mono text-slate-400 mt-0.5">{dep.commitHash}</span>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={dep.status} />
                        </td>
                        <td className="py-3 px-4 text-slate-600">{dep.startedAt}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{dep.duration}</td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              className="px-2 py-1 text-[11px] font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer"
                              onClick={() => setSelectedId(dep.id)}
                              type="button"
                            >
                              Details
                            </button>
                            {dep.status === 'failed' && (
                              <button
                                className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                                onClick={() => handleRetry(dep)}
                                type="button"
                              >
                                Retry
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredDeployments.length === 0 && (
                    <tr>
                      <td className="py-8 text-center text-slate-500 text-xs" colSpan={7}>
                        No deployments match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ─── Details View (SCR-10) ─── */}
          {selectedDeployment && (
            <div className="space-y-6">
              {/* Identity & Main Status Card */}
              <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedDeployment.project}
                      </h3>
                      <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
                        {selectedDeployment.id}
                      </span>
                      <StatusBadge status={selectedDeployment.status} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Commit {selectedDeployment.commitHash}: &ldquo;{selectedDeployment.commitMessage}&rdquo; on branch{' '}
                      <span className="font-mono text-slate-800 font-semibold">{selectedDeployment.branch}</span>
                    </p>
                  </div>

                  {/* Actions & Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedDeployment.status === 'unresolved' && (
                      <button
                        className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg cursor-pointer"
                        onClick={() => handleReconcile(selectedDeployment.id)}
                        type="button"
                      >
                        Reconcile Status
                      </button>
                    )}
                    <button
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        selectedDeployment.status === 'unresolved' || selectedDeployment.status === 'running'
                          ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
                      }`}
                      disabled={selectedDeployment.status === 'unresolved' || selectedDeployment.status === 'running'}
                      onClick={() => handleRetry(selectedDeployment)}
                      title={selectedDeployment.status === 'unresolved' ? 'Disabled until reconciled' : undefined}
                      type="button"
                    >
                      Retry Stage
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        selectedDeployment.status === 'unresolved' || isBlocked
                          ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                          : 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer'
                      }`}
                      disabled={selectedDeployment.status === 'unresolved' || isBlocked}
                      onClick={() => handleRedeploy(selectedDeployment)}
                      type="button"
                    >
                      Redeploy Commit
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        selectedDeployment.status === 'unresolved' || selectedDeployment.status === 'running'
                          ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                          : 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer'
                      }`}
                      disabled={selectedDeployment.status === 'unresolved' || selectedDeployment.status === 'running'}
                      onClick={() => {
                        setDeploymentToDelete(selectedDeployment);
                        setDeleteModalOpen(true);
                      }}
                      type="button"
                    >
                      Delete Deployment
                    </button>
                  </div>
                </div>

                {/* Identity Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Environment:</span>
                    <span className="font-semibold text-slate-800">{selectedDeployment.environment}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Runtime Type:</span>
                    <span className="font-semibold text-slate-800 uppercase">{selectedDeployment.appType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Started Timestamp:</span>
                    <span className="font-mono text-slate-800">{selectedDeployment.startedAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Pipeline Duration:</span>
                    <span className="font-mono text-slate-800">{selectedDeployment.duration}</span>
                  </div>
                </div>
              </section>

              {/* ─── Stage Stepper ─── */}
              <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Execution Stage Stepper</h4>
                    <p className="text-xs text-slate-500">
                      Sequential lifecycle pipeline: accepted → building → provisioning → deploying → health check.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Partial completion tracking active
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {selectedDeployment.stages.map((stage, idx) => {
                    let borderClass = 'border-slate-200 bg-white';
                    let icon = <span className="text-slate-400 text-xs font-mono">{idx + 1}</span>;

                    if (stage.status === 'completed') {
                      borderClass = 'border-emerald-300 bg-emerald-50/50 text-emerald-950';
                      icon = <IconCheck className="w-4 h-4 text-emerald-600" />;
                    } else if (stage.status === 'running') {
                      borderClass = 'border-blue-300 bg-blue-50/50 text-blue-950 animate-pulse';
                      icon = <IconSpinner className="w-4 h-4 text-blue-600" />;
                    } else if (stage.status === 'failed') {
                      borderClass = 'border-red-300 bg-red-50/50 text-red-950';
                      icon = <IconCircleX className="w-4 h-4 text-red-600" />;
                    } else if (stage.status === 'skipped') {
                      borderClass = 'border-slate-200 bg-slate-50/60 text-slate-400 opacity-60';
                      icon = <span className="text-[10px] text-slate-400">SKIP</span>;
                    }

                    return (
                      <div className={`p-3.5 rounded-lg border relative ${borderClass}`} key={stage.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold">{stage.label}</span>
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-current/20">
                            {icon}
                          </span>
                        </div>
                        <div className="text-[11px] space-y-1">
                          <div className="font-semibold capitalize text-[10px]">
                            Status: {stage.status}
                          </div>
                          {stage.duration && (
                            <div className="font-mono text-slate-500 text-[10px]">
                              Duration: {stage.duration}
                            </div>
                          )}
                          {stage.details && (
                            <p className="text-[10px] leading-tight text-slate-600 mt-1">
                              {stage.details}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ─── Diagnostics Panel (Displayed on Failure / Warning) ─── */}
              {selectedDeployment.diagnostics && (
                <section className="bg-red-50/70 border border-red-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-red-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <IconAlertCircle className="w-5 h-5 text-red-700" />
                      <h4 className="text-base font-bold text-red-950">
                        Pipeline Diagnostics · Stage Failure Analysis
                      </h4>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 rounded">
                      Category: {selectedDeployment.diagnostics.category}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-red-900 block">Recorded Finding:</span>
                      <div className="mt-1 font-mono text-xs bg-white border border-red-200 text-red-800 p-2.5 rounded-lg leading-relaxed">
                        {selectedDeployment.diagnostics.evidence}
                      </div>
                    </div>

                    <p className="text-slate-700 leading-relaxed">
                      {selectedDeployment.diagnostics.details}
                    </p>

                    {selectedDeployment.diagnostics.recommendedAction && (
                      <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                        <span className="font-bold text-slate-900 block text-xs">
                          Recommended Corrective Action:
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed font-mono text-[11px]">
                          {selectedDeployment.diagnostics.recommendedAction}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ─── Health Check Results & Application Status ─── */}
              {selectedDeployment.healthCheck && (
                <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedDeployment.healthCheck.status === 'Online'
                            ? 'bg-emerald-500'
                            : selectedDeployment.healthCheck.status === 'Degraded'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <h4 className="text-base font-bold text-slate-900">
                        Application Status &amp; Endpoint Health Check
                      </h4>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        selectedDeployment.healthCheck.status === 'Online'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {selectedDeployment.healthCheck.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Probed Endpoint:</span>
                      <a
                        className="font-mono text-blue-700 hover:underline truncate block"
                        href={selectedDeployment.healthCheck.endpoint}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {selectedDeployment.healthCheck.endpoint}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 block">HTTP Response Code:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {selectedDeployment.healthCheck.httpStatus ?? 'No Response'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Edge Latency:</span>
                      <span className="font-mono text-slate-800">
                        {selectedDeployment.healthCheck.latencyMs ? `${selectedDeployment.healthCheck.latencyMs} ms` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">TLS &amp; Certificate:</span>
                      <span className="font-semibold text-emerald-700">Valid (256-bit TLS)</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Last probe: {selectedDeployment.healthCheck.checkedAt}
                  </p>
                </section>
              )}

              {/* ─── Log Viewer ─── */}
              <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg text-slate-200">
                {/* Log Header & Controls */}
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        logType === 'build' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
                      }`}
                      onClick={() => setLogType('build')}
                      type="button"
                    >
                      Build Logs ({selectedDeployment.buildLogs.length})
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        logType === 'runtime' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
                      }`}
                      onClick={() => setLogType('runtime')}
                      type="button"
                    >
                      Runtime Logs ({selectedDeployment.runtimeLogs.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-36 sm:w-48"
                      onChange={(e) => setLogSearch(e.target.value)}
                      placeholder="Search in logs..."
                      type="text"
                      value={logSearch}
                    />
                    <select
                      aria-label="Filter logs by severity"
                      className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-100 focus:outline-none"
                      onChange={(e) => setLogSeverity(e.target.value as any)}
                      value={logSeverity}
                    >
                      <option value="ALL">All Severities</option>
                      <option value="INFO">INFO only</option>
                      <option value="WARN">WARN only</option>
                      <option value="ERROR">ERROR only</option>
                    </select>
                    <button
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded font-medium cursor-pointer"
                      onClick={handleCopyLogs}
                      type="button"
                    >
                      Copy Logs
                    </button>
                  </div>
                </div>

                {/* Log Stream Output */}
                <div className="p-4 font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto space-y-1 select-text">
                  {selectedDeployment.logsState === 'missing' && (
                    <div className="py-8 text-center text-slate-500">
                      No logs were emitted for this stage.
                    </div>
                  )}
                  {selectedDeployment.logsState === 'expired' && (
                    <div className="py-8 text-center text-amber-400">
                      Logs for this deployment have expired according to the 7-day retention policy.
                    </div>
                  )}
                  {selectedDeployment.logsState !== 'missing' &&
                    selectedDeployment.logsState !== 'expired' &&
                    visibleLogs.map((log) => {
                      let badgeColor = 'text-blue-400';
                      if (log.severity === 'ERROR') badgeColor = 'text-red-400 font-bold';
                      if (log.severity === 'WARN') badgeColor = 'text-amber-400';
                      if (log.severity === 'SYSTEM') badgeColor = 'text-purple-400';

                      return (
                        <div className="flex items-start gap-2.5 hover:bg-slate-800/50 px-1.5 py-0.5 rounded" key={log.id}>
                          <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                          <span className={`shrink-0 w-14 ${badgeColor}`}>[{log.severity}]</span>
                          <span className="text-slate-200 break-all">{log.message}</span>
                        </div>
                      );
                    })}

                  {visibleLogs.length === 0 &&
                    selectedDeployment.logsState !== 'missing' &&
                    selectedDeployment.logsState !== 'expired' && (
                      <div className="py-6 text-center text-slate-500">
                        No log entries matching the selected criteria.
                      </div>
                    )}
                </div>

                <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Secret Redaction Filter: Active (no raw credentials logged)</span>
                  <span>Log Stream Buffer: UTF-8</span>
                </div>
              </section>
            </div>
          )}
        </div>
      )}

      {/* ─── Delete Deployment Confirmation Modal ─── */}
      {deleteModalOpen && deploymentToDelete && (
        <div
          aria-labelledby="delete-modal-title"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
          role="dialog"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900" id="delete-modal-title">
                Confirm Deployment Deletion
              </h3>
              <button
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-600 rounded p-1 cursor-pointer"
                onClick={() => setDeleteModalOpen(false)}
                type="button"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-700">
              <p>
                Are you sure you want to delete deployment{' '}
                <span className="font-mono font-bold text-slate-900">{deploymentToDelete.id}</span> ({deploymentToDelete.project})?
              </p>

              {/* Exact scope explanation per spec rule */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                <span className="font-bold text-slate-900 block">Scope of Deletion:</span>
                <ul className="space-y-1 text-slate-600">
                  <li className="flex items-center gap-1.5 text-red-700 font-medium">
                    <span>✓</span> Runner container and compiled build artifacts (~142 MB) will be deleted.
                  </li>
                  <li className="flex items-center gap-1.5 text-red-700 font-medium">
                    <span>✓</span> Deployment routing identifier will be removed from DNS table.
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <span>✕</span> <strong>Databases are NOT deleted:</strong> All managed DB tables and data remain preserved.
                  </li>
                  <li className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <span>✕</span> <strong>Backups are NOT deleted:</strong> Automated snapshot archives remain in cold storage.
                  </li>
                </ul>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                onClick={() => setDeleteModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer"
                onClick={confirmDeleteDeployment}
                type="button"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export { DeploymentsPage };

