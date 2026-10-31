'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/src/context/DashboardContext';
import { PageHeader } from '@/src/components/ui/PageHeader';
import {
  IconBell,
  IconClock,
  IconRocket,
  IconDatabase,
  IconArchive,
  IconCreditCard,
  IconAlertCircle,
  IconCheck,
  IconInfo,
  IconCircleX,
  IconSearch,
  IconX,
  IconChevronRight,
} from '@/src/icons';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export type NotificationSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  severity: NotificationSeverity;
  project: string;
  timestamp: string;
  read: boolean;
  deliveryStatus: 'delivered' | 'in_app_only' | 'pending';
  deliveryDestination?: string;
  deliveryRecordedAt?: string;
  relatedHref: string;
  relatedLabel: string;
}

export type ActivityCategory = 'deployment' | 'provisioning' | 'database' | 'backup' | 'restore' | 'budget';

export interface ActivityEvent {
  id: string;
  title: string;
  summary: string;
  category: ActivityCategory;
  project: string;
  actor: string;
  timestamp: string;
  dateGroup: 'Today' | 'Yesterday' | 'Earlier this week';
  relatedHref: string;
  relatedLabel: string;
  metaBadge?: string;
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Storefront Deployment Failed at Build Stage',
    description: 'Build failed due to unresolvable dependency @stripe/stripe-js in ./app/checkout. Recommended action: declare package in package.json.',
    severity: 'critical',
    project: 'Storefront',
    timestamp: '18 min ago (02:51 UTC)',
    read: false,
    deliveryStatus: 'delivered',
    deliveryDestination: 'ahmed@deployx.dev (SMTP Relay)',
    deliveryRecordedAt: '2026-10-31 02:51:56 UTC',
    relatedHref: '/deployments?id=dep-9f82c1',
    relatedLabel: 'Inspect Build Diagnostics',
  },
  {
    id: 'notif-2',
    title: 'Customer Portal Observed Budget Overrun Restriction',
    description: 'Observed expenditure reached $52.40 against the $50.00 baseline. New build runs are temporarily blocked; active apps and databases remain online.',
    severity: 'warning',
    project: 'Customer Portal',
    timestamp: '3 hours ago (23:40 UTC)',
    read: false,
    deliveryStatus: 'delivered',
    deliveryDestination: 'ahmed@deployx.dev',
    deliveryRecordedAt: '2026-10-30 23:41:02 UTC',
    relatedHref: '/coustandbilling',
    relatedLabel: 'Review Budget Restriction',
  },
  {
    id: 'notif-3',
    title: 'Storefront Forecast Spend Warning ($58.20 Projected)',
    description: 'Forward-looking forecast projects monthly spend to exceed the $50.00 baseline. This is an early notification and does not restrict deployments.',
    severity: 'warning',
    project: 'Storefront',
    timestamp: '5 hours ago (21:15 UTC)',
    read: true,
    deliveryStatus: 'in_app_only',
    relatedHref: '/coustandbilling',
    relatedLabel: 'Inspect Cost Forecast',
  },
  {
    id: 'notif-4',
    title: 'Daily Automated Snapshot Completed for storefront_production',
    description: 'Snapshot bak-pg-auto-01 (840 MB) successfully cataloged and verified in NVMe cold storage. Retained for 14 days.',
    severity: 'success',
    project: 'Storefront',
    timestamp: 'Today at 02:00 UTC',
    read: true,
    deliveryStatus: 'delivered',
    deliveryDestination: 'Telemetry Webhook -> Ops Log',
    deliveryRecordedAt: '2026-10-31 02:00:14 UTC',
    relatedHref: '/database',
    relatedLabel: 'View Database Snapshots',
  },
  {
    id: 'notif-5',
    title: 'Standalone Database Restored: storefront_restored_20261031',
    description: 'Snapshot successfully restored into a dedicated standalone PostgreSQL instance without touching production traffic.',
    severity: 'info',
    project: 'Storefront',
    timestamp: 'Yesterday at 16:20 UTC',
    read: true,
    deliveryStatus: 'in_app_only',
    relatedHref: '/database',
    relatedLabel: 'Open Restored Database',
  },
];

const INITIAL_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act-1',
    title: 'Deployment Failed: Storefront (release/v2.1)',
    summary: 'Build execution failed during pnpm run build (exit code 1: missing @stripe/stripe-js). Traffic served by healthy fallback v2.0.9.',
    category: 'deployment',
    project: 'Storefront',
    actor: 'GitHub Webhook (commit #a91f3c2)',
    timestamp: '18 min ago (02:51 UTC)',
    dateGroup: 'Today',
    relatedHref: '/deployments',
    relatedLabel: 'View Deployment dep-9f82c1',
    metaBadge: 'Build Exit Code 1',
  },
  {
    id: 'act-2',
    title: 'Deployment Progressing: Team Wiki (main)',
    summary: 'Vite build completed (34 bundles emitted). Edge CDN allocation and TLS certificate propagation actively running.',
    category: 'deployment',
    project: 'Team Wiki',
    actor: 'Ahmed Ashraf (Console Trigger)',
    timestamp: '4 min ago (03:04 UTC)',
    dateGroup: 'Today',
    relatedHref: '/deployments',
    relatedLabel: 'View Deployment dep-84b119',
    metaBadge: 'Provisioning Running',
  },
  {
    id: 'act-3',
    title: 'Automated Snapshot Created: storefront_production',
    summary: 'Daily cold storage snapshot bak-pg-auto-01 (840 MB) completed with 14-day retention cycle.',
    category: 'backup',
    project: 'Storefront',
    actor: 'DeployX Automated Scheduler',
    timestamp: 'Today at 02:00 UTC',
    dateGroup: 'Today',
    relatedHref: '/database',
    relatedLabel: 'Inspect Snapshot Catalog',
    metaBadge: '14-Day Retention',
  },
  {
    id: 'act-4',
    title: 'Database Connectivity Verified: notes_api_master',
    summary: 'Direct TCP socket verification test passed with 12ms latency over internal VPC network.',
    category: 'database',
    project: 'Notes API',
    actor: 'Ahmed Ashraf',
    timestamp: 'Yesterday at 18:45 UTC',
    dateGroup: 'Yesterday',
    relatedHref: '/database',
    relatedLabel: 'Inspect Database',
    metaBadge: 'TLS Verified',
  },
  {
    id: 'act-5',
    title: 'Manual Snapshot Protected: bak-pg-manual-01',
    summary: 'Protection flag enabled. Snapshot will be preserved indefinitely and excluded from automatic retention cleanup.',
    category: 'backup',
    project: 'Storefront',
    actor: 'Ahmed Ashraf',
    timestamp: 'Yesterday at 14:10 UTC',
    dateGroup: 'Yesterday',
    relatedHref: '/database',
    relatedLabel: 'View Protected Backups',
    metaBadge: 'Retained Indefinitely',
  },
  {
    id: 'act-6',
    title: 'Budget Restriction Enacted: Customer Portal',
    summary: 'Observed cloud spend reached $52.40 against $50.00 budget ceiling. Deployments blocked; active apps remain online.',
    category: 'budget',
    project: 'Customer Portal',
    actor: 'DeployX Budget Enforcer',
    timestamp: 'Yesterday at 11:30 UTC',
    dateGroup: 'Yesterday',
    relatedHref: '/coustandbilling',
    relatedLabel: 'Inspect Budget Policy',
    metaBadge: 'Deployments Blocked',
  },
  {
    id: 'act-7',
    title: 'Non-Destructive Database Restore Executed',
    summary: 'Snapshot bak-pg-manual-02 restored to fresh instance storefront_production_restored. Production traffic undisturbed.',
    category: 'restore',
    project: 'Storefront',
    actor: 'Ahmed Ashraf',
    timestamp: '2026-10-28 15:20 UTC',
    dateGroup: 'Earlier this week',
    relatedHref: '/database',
    relatedLabel: 'View Restored DB',
    metaBadge: 'Standalone Instance',
  },
];

export default function ActivityAndNotificationsPage() {
  const { showToast } = useDashboard();
  const [activeTab, setActiveTab] = useState<'notifications' | 'activity'>('notifications');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Counts
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchSearch =
        !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.project.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProject = filterProject === 'all' || n.project === filterProject;
      const matchSeverity = filterSeverity === 'all' || n.severity === filterSeverity;

      return matchSearch && matchProject && matchSeverity;
    });
  }, [notifications, searchQuery, filterProject, filterSeverity]);

  // Filtered Activity
  const filteredActivity = useMemo(() => {
    return INITIAL_ACTIVITY.filter((act) => {
      const matchSearch =
        !searchQuery ||
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.project.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProject = filterProject === 'all' || act.project === filterProject;
      const matchCat = filterCategory === 'all' || act.category === filterCategory;

      return matchSearch && matchProject && matchCat;
    });
  }, [searchQuery, filterProject, filterCategory]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const getSeverityBadge = (sev: NotificationSeverity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
            <IconAlertCircle className="w-3 h-3 text-red-600" /> CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <IconAlertCircle className="w-3 h-3 text-amber-600" /> WARNING
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <IconCheck className="w-3 h-3 text-emerald-600" /> SUCCESS
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <IconInfo className="w-3 h-3 text-blue-600" /> INFO
          </span>
        );
    }
  };

  const getCategoryIcon = (cat: ActivityCategory) => {
    switch (cat) {
      case 'deployment':
        return <IconRocket className="w-4 h-4 text-blue-600" />;
      case 'database':
        return <IconDatabase className="w-4 h-4 text-indigo-600" />;
      case 'backup':
      case 'restore':
        return <IconArchive className="w-4 h-4 text-emerald-600" />;
      case 'budget':
        return <IconCreditCard className="w-4 h-4 text-amber-600" />;
      case 'provisioning':
        return <IconClock className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* ─── Header ─── */}
      <PageHeader
        action={
          <div className="flex items-center gap-2">
            <button
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setActiveTab('notifications')}
              type="button"
            >
              <IconBell className="w-4 h-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setActiveTab('activity')}
              type="button"
            >
              <IconClock className="w-4 h-4" />
              Activity Audit Trail
            </button>
          </div>
        }
        description="Centralized timeline of operational events, build diagnostics, database recovery snapshots, and budget policy changes."
        eyebrow="Observability &amp; Audit"
        title="Notifications &amp; Activity Log"
      />

      {/* ─── Architectural Specification Guarantee Banner ─── */}
      <section
        aria-label="Audit record integrity guarantees"
        className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-2xs space-y-2"
      >
        <div className="flex items-start gap-2.5">
          <IconInfo className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-900 text-xs block">
              Audit Record Rules (Specification 3.10):
            </span>
            <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900 block">1. Historical Audit Record:</span>
                Activity events represent a chronological audit log, not the authoritative real-time status of underlying infrastructure.
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900 block">2. Delivery Verification:</span>
                Notifications do not claim delivery to external recipients unless an explicit delivery confirmation is verified.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TAB 1: NOTIFICATIONS LIST & DETAILS (SCR-16) ─── */}
      {activeTab === 'notifications' && (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Notifications Center</h2>
              <p className="text-xs text-slate-500">
                {unreadCount} unread notification{unreadCount === 1 ? '' : 's'} requiring attention.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-44 sm:w-52">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <IconSearch className="w-3.5 h-3.5" />
                </span>
                <input
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter notifications..."
                  type="text"
                  value={searchQuery}
                />
              </div>

              <select
                aria-label="Filter by project"
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                onChange={(e) => setFilterProject(e.target.value)}
                value={filterProject}
              >
                <option value="all">All Projects</option>
                <option value="Storefront">Storefront</option>
                <option value="Customer Portal">Customer Portal</option>
                <option value="Notes API">Notes API</option>
              </select>

              <select
                aria-label="Filter by severity"
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                onChange={(e) => setFilterSeverity(e.target.value)}
                value={filterSeverity}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>

              {unreadCount > 0 && (
                <button
                  className="px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                  onClick={handleMarkAllRead}
                  type="button"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <div
                className={`p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                  !notif.read ? 'bg-blue-50/20' : ''
                }`}
                key={notif.id}
                onClick={() => setSelectedNotif(notif)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      !notif.read ? 'bg-blue-600' : 'bg-transparent border border-slate-300'
                    }`}
                    title={!notif.read ? 'Unread' : 'Read'}
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityBadge(notif.severity)}
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {notif.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {notif.project}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                      {notif.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{notif.timestamp}</span>
                      <span>·</span>
                      <span className="text-slate-500">
                        {notif.deliveryStatus === 'delivered' ? (
                          <span className="text-emerald-700">✓ Delivered</span>
                        ) : notif.deliveryStatus === 'in_app_only' ? (
                          <span>In-app only</span>
                        ) : (
                          <span className="text-amber-700">Delivery Pending</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    className="text-[11px] text-slate-400 hover:text-slate-700 px-2 py-1 rounded cursor-pointer"
                    onClick={(e) => handleToggleRead(notif.id, e)}
                    type="button"
                  >
                    {notif.read ? 'Mark unread' : 'Mark read'}
                  </button>
                  <Link
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 cursor-pointer"
                    href={notif.relatedHref}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs">
                No notifications match your filter criteria.
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── TAB 2: ACTIVITY TIMELINE (SCR-17) ─── */}
      {activeTab === 'activity' && (
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Historical Activity Timeline</h2>
              <p className="text-xs text-slate-500">
                Chronological record of deployments, database lifecycle events, and budget triggers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-44 sm:w-52">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <IconSearch className="w-3.5 h-3.5" />
                </span>
                <input
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activity stream..."
                  type="text"
                  value={searchQuery}
                />
              </div>

              <select
                aria-label="Filter activity by category"
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                onChange={(e) => setFilterCategory(e.target.value)}
                value={filterCategory}
              >
                <option value="all">All Event Categories</option>
                <option value="deployment">Deployments</option>
                <option value="database">Database Operations</option>
                <option value="backup">Backup Snapshots</option>
                <option value="restore">Recovery Restores</option>
                <option value="budget">Budget Enforcements</option>
              </select>
            </div>
          </div>

          {/* Timeline List */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filteredActivity.map((event) => (
              <div className="relative group" key={event.id}>
                {/* Timeline node icon */}
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-blue-600 flex items-center justify-center transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-blue-600" />
                </div>

                <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl p-3.5 transition-all text-xs space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-white border border-slate-200">
                        {getCategoryIcon(event.category)}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">{event.title}</span>
                      {event.metaBadge && (
                        <span className="text-[10px] font-semibold bg-white px-2 py-0.2 rounded border border-slate-200 text-slate-700">
                          {event.metaBadge}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{event.timestamp}</span>
                  </div>

                  <p className="text-slate-600 leading-relaxed pl-7">{event.summary}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pl-7 text-[11px] text-slate-400">
                    <span>Triggered by: <strong className="text-slate-700">{event.actor}</strong></span>
                    <Link
                      className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                      href={event.relatedHref}
                    >
                      {event.relatedLabel} <IconChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {filteredActivity.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs">
                No activity events match your filter criteria.
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── NOTIFICATION DETAIL MODAL ─── */}
      {selectedNotif && (
        <div
          aria-labelledby="notif-detail-title"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
          role="dialog"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSeverityBadge(selectedNotif.severity)}
                <span className="text-xs font-mono text-slate-500">{selectedNotif.project}</span>
              </div>
              <button
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-600 rounded p-1 cursor-pointer"
                onClick={() => setSelectedNotif(null)}
                type="button"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs leading-relaxed text-slate-700">
              <h3 className="text-base font-bold text-slate-900" id="notif-detail-title">
                {selectedNotif.title}
              </h3>
              <p className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed">
                {selectedNotif.description}
              </p>

              {/* Delivery Telemetry per spec rule */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                <span className="font-bold text-slate-900 block">Recorded Delivery Telemetry:</span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel / Status:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {selectedNotif.deliveryStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                {selectedNotif.deliveryDestination && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recipient Destination:</span>
                    <span className="font-mono text-slate-800">{selectedNotif.deliveryDestination}</span>
                  </div>
                )}
                {selectedNotif.deliveryRecordedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Delivery Confirmation Timestamp:</span>
                    <span className="font-mono text-slate-800">{selectedNotif.deliveryRecordedAt}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === selectedNotif.id ? { ...n, read: !n.read } : n))
                  );
                  setSelectedNotif((prev) => (prev ? { ...prev, read: !prev.read } : null));
                }}
                type="button"
              >
                {selectedNotif.read ? 'Mark Unread' : 'Mark Read'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                  onClick={() => setSelectedNotif(null)}
                  type="button"
                >
                  Close
                </button>
                <Link
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                  href={selectedNotif.relatedHref}
                  onClick={() => setSelectedNotif(null)}
                >
                  {selectedNotif.relatedLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export { ActivityAndNotificationsPage };

