'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/src/context/DashboardContext';
import { PageHeader } from '@/src/components/ui/PageHeader';
import { StatusBadge, type OperationStatus } from '@/src/components/ui/StatusBadge';
import {
  IconDatabase,
  IconArchive,
  IconCheck,
  IconCircleX,
  IconSpinner,
  IconAlertCircle,
  IconInfo,
  IconPlus,
  IconX,
  IconClock,
  IconSearch,
} from '@/src/icons';

// ─── Interfaces & Models ───────────────────────────────────────────────────────

export type DatabaseEngine = 'postgresql' | 'mysql';
export type DatabaseState = 'available' | 'provisioning' | 'backup_running' | 'restore_running' | 'failed' | 'unresolved';
export type ConnectivityState = 'verified' | 'unverified' | 'failed';

export interface DatabaseRecord {
  id: string;
  name: string;
  engine: DatabaseEngine;
  engineVersion: string;
  state: DatabaseState;
  connectivity: ConnectivityState;
  connectivityCheckedAt?: string;
  linkedProject: string;
  linkedBranch: string;
  host: string;
  port: number;
  dbName: string;
  username: string;
  allocatedStorageGb: number;
  usedStorageGb: number;
  maxConnections: number;
  activeConnections: number;
  createdAt: string;
}

export interface BackupRecord {
  id: string;
  dbId: string;
  dbName: string;
  engine: DatabaseEngine;
  type: 'automated' | 'manual';
  status: 'completed' | 'running' | 'failed';
  createdAt: string;
  sizeMb: number;
  isProtected: boolean;
  unprotectedAt?: string;
  retentionEndDate: string;
  label?: string;
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_DATABASES: DatabaseRecord[] = [
  {
    id: 'db-postgres-prod',
    name: 'storefront_production',
    engine: 'postgresql',
    engineVersion: 'PostgreSQL 15.6',
    state: 'available',
    connectivity: 'verified',
    connectivityCheckedAt: '12 min ago (TLS TCP handshake succeeded)',
    linkedProject: 'Storefront',
    linkedBranch: 'release/v2.1',
    host: 'pg-storefront-prod.c7x.internal.deployx.net',
    port: 5432,
    dbName: 'storefront_production',
    username: 'storefront_app_user',
    allocatedStorageGb: 25,
    usedStorageGb: 9.4,
    maxConnections: 100,
    activeConnections: 18,
    createdAt: '2026-09-12 14:30:00 UTC',
  },
  {
    id: 'db-mysql-notes',
    name: 'notes_api_master',
    engine: 'mysql',
    engineVersion: 'MySQL 8.0.36',
    state: 'available',
    connectivity: 'unverified',
    connectivityCheckedAt: 'Database provisioned; awaiting app verification',
    linkedProject: 'Notes API',
    linkedBranch: 'main',
    host: 'mysql-notes-prod.c7x.internal.deployx.net',
    port: 3306,
    dbName: 'notes_api_master',
    username: 'notes_admin',
    allocatedStorageGb: 15,
    usedStorageGb: 3.8,
    maxConnections: 80,
    activeConnections: 6,
    createdAt: '2026-10-01 09:15:00 UTC',
  },
  {
    id: 'db-postgres-analytics',
    name: 'analytics_staging',
    engine: 'postgresql',
    engineVersion: 'PostgreSQL 15.6',
    state: 'provisioning',
    connectivity: 'unverified',
    linkedProject: 'Analytics Worker',
    linkedBranch: 'staging',
    host: 'pg-analytics-stg.c7x.internal.deployx.net',
    port: 5432,
    dbName: 'analytics_staging',
    username: 'analytics_svc',
    allocatedStorageGb: 20,
    usedStorageGb: 0.1,
    maxConnections: 50,
    activeConnections: 0,
    createdAt: 'Just now (Allocating volume blocks)',
  },
  {
    id: 'db-mysql-legacy',
    name: 'customer_portal_archive',
    engine: 'mysql',
    engineVersion: 'MySQL 8.0.36',
    state: 'unresolved',
    connectivity: 'failed',
    connectivityCheckedAt: 'Connection timeout: storage partition heartbeat lost',
    linkedProject: 'Customer Portal',
    linkedBranch: 'hotfix/session-fix',
    host: 'mysql-portal-arch.c7x.internal.deployx.net',
    port: 3306,
    dbName: 'customer_portal_archive',
    username: 'portal_user',
    allocatedStorageGb: 30,
    usedStorageGb: 22.1,
    maxConnections: 60,
    activeConnections: 0,
    createdAt: '2026-08-20 11:00:00 UTC',
  },
];

const INITIAL_BACKUPS: BackupRecord[] = [
  {
    id: 'bak-pg-auto-01',
    dbId: 'db-postgres-prod',
    dbName: 'storefront_production',
    engine: 'postgresql',
    type: 'automated',
    status: 'completed',
    createdAt: 'Today at 02:00 UTC',
    sizeMb: 840,
    isProtected: false,
    retentionEndDate: '14 days from creation (2026-11-14 02:00 UTC)',
    label: 'Daily automated snapshot',
  },
  {
    id: 'bak-pg-manual-01',
    dbId: 'db-postgres-prod',
    dbName: 'storefront_production',
    engine: 'postgresql',
    type: 'manual',
    status: 'completed',
    createdAt: '2 days ago (2026-10-29 16:45 UTC)',
    sizeMb: 835,
    isProtected: true,
    retentionEndDate: 'Never (Protected manual backup is retained indefinitely)',
    label: 'Pre-checkout redesign schema snapshot',
  },
  {
    id: 'bak-pg-manual-02',
    dbId: 'db-postgres-prod',
    dbName: 'storefront_production',
    engine: 'postgresql',
    type: 'manual',
    status: 'completed',
    createdAt: '5 days ago (2026-10-26 10:20 UTC)',
    sizeMb: 820,
    isProtected: false,
    retentionEndDate: '30 days from creation (2026-11-25 10:20 UTC)',
    label: 'Ad-hoc developer snapshot',
  },
  {
    id: 'bak-my-auto-01',
    dbId: 'db-mysql-notes',
    dbName: 'notes_api_master',
    engine: 'mysql',
    type: 'automated',
    status: 'completed',
    createdAt: 'Today at 03:30 UTC',
    sizeMb: 310,
    isProtected: false,
    retentionEndDate: '14 days from creation (2026-11-14 03:30 UTC)',
    label: 'Daily automated snapshot',
  },
  {
    id: 'bak-my-manual-01',
    dbId: 'db-mysql-notes',
    dbName: 'notes_api_master',
    engine: 'mysql',
    type: 'manual',
    status: 'completed',
    createdAt: '12 days ago (2026-10-19 14:00 UTC)',
    sizeMb: 295,
    isProtected: true,
    retentionEndDate: 'Never (Protected manual backup is retained indefinitely)',
    label: 'Milestone migration baseline',
  },
];

export default function DatabaseManagementPage() {
  const { showToast } = useDashboard();
  const [databases, setDatabases] = useState<DatabaseRecord[]>(INITIAL_DATABASES);
  const [backups, setBackups] = useState<BackupRecord[]>(INITIAL_BACKUPS);
  const [selectedDbId, setSelectedDbId] = useState<string>('db-postgres-prod');
  const [revealedPasswords, setRevealedPasswords] = useState<{ [dbId: string]: boolean }>({});

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [engineFilter, setEngineFilter] = useState<string>('all');
  const [backupTypeFilter, setBackupTypeFilter] = useState<string>('all');

  // Manual Backup Modal
  const [manualBackupModalOpen, setManualBackupModalOpen] = useState(false);
  const [newBackupLabel, setNewBackupLabel] = useState('');
  const [newBackupProtected, setNewBackupProtected] = useState(false);

  // Restore Wizard State
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<BackupRecord | null>(null);
  const [restoreTargetName, setRestoreTargetName] = useState('');
  const [restoreStep, setRestoreStep] = useState<'configure' | 'progress' | 'complete'>('configure');
  const [restoreProgressStage, setRestoreProgressStage] = useState(1);
  const [acknowledgedSeparateDb, setAcknowledgedSeparateDb] = useState(false);
  const [acknowledgedAppUntouched, setAcknowledgedAppUntouched] = useState(false);

  // Delete Backup Modal
  const [deleteBackupModalOpen, setDeleteBackupModalOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<BackupRecord | null>(null);

  // Selected Database
  const selectedDb = useMemo(() => {
    return databases.find((d) => d.id === selectedDbId) || databases[0];
  }, [databases, selectedDbId]);

  // Filtered Databases
  const filteredDatabases = useMemo(() => {
    return databases.filter((db) => {
      const matchSearch =
        !searchQuery ||
        db.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        db.linkedProject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        db.engine.toLowerCase().includes(searchQuery.toLowerCase());
      const matchEngine = engineFilter === 'all' || db.engine === engineFilter;
      return matchSearch && matchEngine;
    });
  }, [databases, searchQuery, engineFilter]);

  // Backups for Selected DB
  const selectedDbBackups = useMemo(() => {
    return backups.filter((b) => {
      const matchDb = b.dbId === selectedDb.id;
      const matchType = backupTypeFilter === 'all' || b.type === backupTypeFilter;
      return matchDb && matchType;
    });
  }, [backups, selectedDb.id, backupTypeFilter]);

  // Actions
  const handleVerifyConnectivity = (dbId: string) => {
    showToast(`Verifying TCP network handshake and credentials for ${dbId}...`);
    setTimeout(() => {
      setDatabases((prev) =>
        prev.map((d) =>
          d.id === dbId
            ? {
                ...d,
                connectivity: 'verified',
                connectivityCheckedAt: 'Verified just now (TLS handshake passed, latency 12ms)',
              }
            : d
        )
      );
      showToast('Connectivity verified: Application network route and credentials confirmed.');
    }, 900);
  };

  const handleReconcile = (dbId: string) => {
    showToast(`Reconciling cluster node state for ${dbId}...`);
    setTimeout(() => {
      setDatabases((prev) =>
        prev.map((d) =>
          d.id === dbId
            ? {
                ...d,
                state: 'available' as DatabaseState,
                connectivity: 'unverified' as ConnectivityState,
                connectivityCheckedAt: 'Cluster synced. Run verification to test app access.',
              }
            : d
        )
      );
      showToast('Reconciliation complete: Database is now Available.');
    }, 1000);
  };

  const handleToggleProtection = (backupId: string) => {
    setBackups((prev) =>
      prev.map((b) => {
        if (b.id !== backupId) return b;
        const willBeProtected = !b.isProtected;
        return {
          ...b,
          isProtected: willBeProtected,
          retentionEndDate: willBeProtected
            ? 'Never (Protected manual backup is retained indefinitely)'
            : '30 days from unprotection (Starts 30-day countdown)',
        };
      })
    );
    showToast(
      'Backup protection updated. Removing protection begins the standard 30-day retention window.'
    );
  };

  const handleCreateManualBackup = (e: React.FormEvent) => {
    e.preventDefault();
    const backupId = `bak-${selectedDb.engine === 'postgresql' ? 'pg' : 'my'}-man-${Date.now().toString(36)}`;
    const newRecord: BackupRecord = {
      id: backupId,
      dbId: selectedDb.id,
      dbName: selectedDb.name,
      engine: selectedDb.engine,
      type: 'manual',
      status: 'completed',
      createdAt: 'Just now (Triggered manually)',
      sizeMb: Math.round(selectedDb.usedStorageGb * 100) + 120,
      isProtected: newBackupProtected,
      retentionEndDate: newBackupProtected
        ? 'Never (Protected manual backup is retained indefinitely)'
        : '30 days from creation',
      label: newBackupLabel.trim() || 'Manual database snapshot',
    };

    // Temporarily set db state to backup_running
    setDatabases((prev) =>
      prev.map((d) => (d.id === selectedDb.id ? { ...d, state: 'backup_running' as DatabaseState } : d))
    );

    setTimeout(() => {
      setBackups((prev) => [newRecord, ...prev]);
      setDatabases((prev) =>
        prev.map((d) => (d.id === selectedDb.id ? { ...d, state: 'available' as DatabaseState } : d))
      );
      showToast(`Snapshot ${backupId} completed and cataloged.`);
    }, 1200);

    setManualBackupModalOpen(false);
    setNewBackupLabel('');
    setNewBackupProtected(false);
  };

  const handleDeleteBackup = () => {
    if (!backupToDelete) return;
    if (backupToDelete.isProtected) {
      showToast('Cannot delete a protected backup. Remove protection first.');
      return;
    }
    setBackups((prev) => prev.filter((b) => b.id !== backupToDelete.id));
    showToast(`Backup ${backupToDelete.id} permanently deleted.`);
    setDeleteBackupModalOpen(false);
    setBackupToDelete(null);
  };

  const startRestoreWizard = (backup: BackupRecord) => {
    setSelectedBackupForRestore(backup);
    setRestoreTargetName(`${backup.dbName}_restored_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`);
    setAcknowledgedSeparateDb(false);
    setAcknowledgedAppUntouched(false);
    setRestoreStep('configure');
    setRestoreProgressStage(1);
    setRestoreModalOpen(true);
  };

  const executeRestore = () => {
    if (!acknowledgedSeparateDb || !acknowledgedAppUntouched) {
      showToast('You must acknowledge all operation boundaries before continuing.');
      return;
    }

    setRestoreStep('progress');
    setDatabases((prev) =>
      prev.map((d) => (d.id === selectedDb.id ? { ...d, state: 'restore_running' as DatabaseState } : d))
    );

    // Progressive stage simulation
    setTimeout(() => setRestoreProgressStage(2), 600);
    setTimeout(() => setRestoreProgressStage(3), 1200);
    setTimeout(() => setRestoreProgressStage(4), 1800);
    setTimeout(() => {
      const newRestoredId = `db-${selectedDb.engine === 'postgresql' ? 'pg' : 'my'}-restored-${Math.random().toString(36).substring(2, 6)}`;
      const newRestoredDb: DatabaseRecord = {
        id: newRestoredId,
        name: restoreTargetName,
        engine: selectedDb.engine,
        engineVersion: selectedDb.engineVersion,
        state: 'available' as DatabaseState,
        connectivity: 'unverified' as ConnectivityState,
        connectivityCheckedAt: 'Restored instance; run verification to link app credentials',
        linkedProject: `${selectedDb.linkedProject} (Standalone Restored)`,
        linkedBranch: selectedDb.linkedBranch,
        host: `${restoreTargetName}.c7x.internal.deployx.net`,
        port: selectedDb.port,
        dbName: restoreTargetName,
        username: `${selectedDb.username}_restored`,
        allocatedStorageGb: selectedDb.allocatedStorageGb,
        usedStorageGb: selectedDb.usedStorageGb,
        maxConnections: selectedDb.maxConnections,
        activeConnections: 0,
        createdAt: 'Just now (Restored from snapshot)',
      };

      setDatabases((prev) => [
        newRestoredDb,
        ...prev.map((d) => (d.id === selectedDb.id ? { ...d, state: 'available' as DatabaseState } : d)),
      ]);
      setSelectedDbId(newRestoredId);
      setRestoreStep('complete');
      showToast(`Restore complete: Standalone database ${restoreTargetName} is available.`);
    }, 2400);
  };

  const dbStateBadge = (state: DatabaseState) => {
    switch (state) {
      case 'available':
        return <StatusBadge label="Available" status="successful" />;
      case 'provisioning':
        return <StatusBadge label="Provisioning" status="running" />;
      case 'backup_running':
        return <StatusBadge label="Backup Running" status="running" />;
      case 'restore_running':
        return <StatusBadge label="Restore Running" status="running" />;
      case 'failed':
        return <StatusBadge label="Failed" status="failed" />;
      case 'unresolved':
        return <StatusBadge label="Unresolved" status="unresolved" />;
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* ─── Page Header ─── */}
      <PageHeader
        action={
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
              onClick={() => setManualBackupModalOpen(true)}
              type="button"
            >
              <IconArchive className="w-4 h-4" />
              Create Manual Backup
            </button>
          </div>
        }
        description="Provision, monitor, and restore managed PostgreSQL and MySQL database instances. Restores always provision dedicated instances without impacting active workloads."
        eyebrow="Data Infrastructure"
        title="Databases, Backups &amp; Recovery"
      />

      {/* ─── Important Architectural Rule Notice Banner ─── */}
      <section
        aria-label="Database isolation rules"
        className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-blue-950 shadow-2xs text-xs space-y-2"
      >
        <div className="flex items-start gap-2.5">
          <IconInfo className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-blue-900 block text-xs">
              Platform Isolation &amp; Recovery Guarantees (Specification 3.8):
            </span>
            <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700">
              <div className="bg-white/80 p-2 rounded border border-blue-100">
                <span className="font-semibold text-blue-950 block">1. Non-Destructive Restore:</span>
                Restore operations always create a distinct, isolated database. They never overwrite the source database, switch app routes, or run migrations.
              </div>
              <div className="bg-white/80 p-2 rounded border border-blue-100">
                <span className="font-semibold text-blue-950 block">2. Status Independence:</span>
                Database engine status is strictly separate from application status. &ldquo;Provisioned&rdquo; does not imply the application is able to connect.
              </div>
              <div className="bg-white/80 p-2 rounded border border-blue-100">
                <span className="font-semibold text-blue-950 block">3. Retention Policies:</span>
                Automated backups expire after 14 days; unprotected manual backups expire in 30 days; protected manual backups are retained indefinitely.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Database Instances Overview Grid (SCR-12) ─── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Database Instances</h2>
            <p className="text-xs text-slate-500">
              Select an instance to inspect connection configurations, credentials, and snapshot catalogs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-56">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <IconSearch className="w-3.5 h-3.5" />
              </span>
              <input
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter instances or projects..."
                type="text"
                value={searchQuery}
              />
            </div>
            <select
              aria-label="Filter by engine"
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onChange={(e) => setEngineFilter(e.target.value)}
              value={engineFilter}
            >
              <option value="all">All Engines</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
            </select>
          </div>
        </div>

        {/* Database Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDatabases.map((db) => {
            const isSelected = db.id === selectedDb.id;
            const isPostgres = db.engine === 'postgresql';

            return (
              <div
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-blue-500 bg-white shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                key={db.id}
                onClick={() => setSelectedDbId(db.id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isPostgres ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}
                    >
                      {isPostgres ? 'PG' : 'MY'}
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 truncate max-w-[130px]" title={db.name}>
                        {db.name}
                      </h3>
                      <span className="text-[10px] text-slate-500 block">{db.engineVersion}</span>
                    </div>
                  </div>
                  {dbStateBadge(db.state)}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Linked Project:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[120px]">{db.linkedProject}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Connectivity:</span>
                    <span
                      className={`font-semibold text-[10px] px-1.5 py-0.2 rounded ${
                        db.connectivity === 'verified'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : db.connectivity === 'unverified'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {db.connectivity === 'verified' ? '✓ Verified' : db.connectivity === 'unverified' ? 'Unverified' : '! Failed'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Storage Used:</span>
                    <span className="font-mono text-slate-700">{db.usedStorageGb} / {db.allocatedStorageGb} GB</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Selected Database Details & Configuration Summary ─── */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  selectedDb.engine === 'postgresql'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-orange-50 text-orange-700 border border-orange-200'
                }`}
              >
                {selectedDb.engine === 'postgresql' ? 'PG' : 'MY'}
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedDb.name}</h3>
                <span className="text-xs text-slate-500">Instance ID: {selectedDb.id} · {selectedDb.engineVersion}</span>
              </div>
              <div className="ml-2">{dbStateBadge(selectedDb.state)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedDb.state === 'unresolved' && (
              <button
                className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg cursor-pointer"
                onClick={() => handleReconcile(selectedDb.id)}
                type="button"
              >
                Reconcile Node State
              </button>
            )}
            <button
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              onClick={() => handleVerifyConnectivity(selectedDb.id)}
              type="button"
            >
              Verify Connectivity
            </button>
          </div>
        </div>

        {/* Connectivity Status Callout */}
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-start justify-between gap-3 ${
            selectedDb.connectivity === 'verified'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : selectedDb.connectivity === 'unverified'
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-red-50/70 border-red-200 text-red-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {selectedDb.connectivity === 'verified' ? (
              <IconCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : selectedDb.connectivity === 'unverified' ? (
              <IconAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <IconCircleX className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block text-xs">
                Connectivity Status: {selectedDb.connectivity.toUpperCase()}
              </span>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                {selectedDb.connectivityCheckedAt}
              </p>
            </div>
          </div>
          {selectedDb.connectivity !== 'verified' && (
            <button
              className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-current/20 rounded shadow-2xs hover:bg-white/80 cursor-pointer shrink-0"
              onClick={() => handleVerifyConnectivity(selectedDb.id)}
              type="button"
            >
              Run Test Handshake
            </button>
          )}
        </div>

        {/* Connection Configuration Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Connection Parameters &amp; Credentials
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Host / Endpoint:</span>
              <span className="font-mono font-medium text-slate-900 block truncate" title={selectedDb.host}>
                {selectedDb.host}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Port &amp; SSL:</span>
              <span className="font-mono font-medium text-slate-900 block">
                {selectedDb.port} · TLS Enforced
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Database Name:</span>
              <span className="font-mono font-medium text-slate-900 block">
                {selectedDb.dbName}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Authorized User:</span>
              <span className="font-mono font-medium text-slate-900 block">
                {selectedDb.username}
              </span>
            </div>
          </div>

          {/* Connection URI with Masked Secret Handling */}
          <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">DATABASE_URL (Application Connection URI)</span>
              <div className="flex items-center gap-2">
                <button
                  className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                  onClick={() =>
                    setRevealedPasswords((prev) => ({ ...prev, [selectedDb.id]: !prev[selectedDb.id] }))
                  }
                  type="button"
                >
                  {revealedPasswords[selectedDb.id] ? 'Mask Secret' : 'Reveal Secret (Authorized)'}
                </button>
                <button
                  className="text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-slate-200 border border-slate-700 cursor-pointer"
                  onClick={() => {
                    const uri = `${selectedDb.engine === 'postgresql' ? 'postgres' : 'mysql'}://${selectedDb.username}:${
                      revealedPasswords[selectedDb.id] ? 'p@ssw0rdSecr3t2026' : '••••••••••••'
                    }@${selectedDb.host}:${selectedDb.port}/${selectedDb.dbName}?sslmode=require`;
                    navigator.clipboard?.writeText(uri);
                    showToast('Connection URI copied to clipboard.');
                  }}
                  type="button"
                >
                  Copy URI
                </button>
              </div>
            </div>
            <div className="font-mono text-xs text-slate-300 break-all select-all">
              {selectedDb.engine === 'postgresql' ? 'postgres' : 'mysql'}://
              {selectedDb.username}:
              {revealedPasswords[selectedDb.id] ? (
                <span className="text-amber-400 font-bold">p@ssw0rdSecr3t2026</span>
              ) : (
                <span className="text-slate-500 font-bold">••••••••••••</span>
              )}
              @{selectedDb.host}:{selectedDb.port}/{selectedDb.dbName}?sslmode=require
            </div>
            <p className="text-[10px] text-slate-500">
              * Sensitive values are concealed by default per specification security requirements.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Backups Catalog Table (SCR-13) ─── */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Backups &amp; Snapshot Catalog ({selectedDb.name})
            </h3>
            <p className="text-xs text-slate-500">
              Automated daily backups retain for 14 days; unprotected manual backups retain for 30 days; protected backups are never auto-deleted.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filter backups by type"
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              onChange={(e) => setBackupTypeFilter(e.target.value)}
              value={backupTypeFilter}
            >
              <option value="all">All Backup Types</option>
              <option value="automated">Automated (14-day window)</option>
              <option value="manual">Manual (30-day / Protected)</option>
            </select>
            <button
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              onClick={() => setManualBackupModalOpen(true)}
              type="button"
            >
              <IconPlus className="w-3.5 h-3.5" />
              New Snapshot
            </button>
          </div>
        </div>

        {/* Backups Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Backup ID &amp; Label</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Protection Status</th>
                <th className="py-3 px-4">Retention End Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedDbBackups.map((bak) => (
                <tr className="hover:bg-slate-50/80 transition-colors" key={bak.id}>
                  <td className="py-3 px-4">
                    <span className="font-mono font-medium text-slate-900 block">{bak.id}</span>
                    <span className="text-[11px] text-slate-500 block">{bak.label || 'Snapshot'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                        bak.type === 'automated'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {bak.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                      <span>✓</span> {bak.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{bak.createdAt}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{bak.sizeMb} MB</td>
                  <td className="py-3 px-4">
                    <button
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer transition-colors ${
                        bak.isProtected
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                      onClick={() => handleToggleProtection(bak.id)}
                      title={
                        bak.isProtected
                          ? 'Protected: Click to remove protection and initiate 30-day retention'
                          : 'Unprotected: Click to lock and prevent automated deletion'
                      }
                      type="button"
                    >
                      <span>{bak.isProtected ? '🔒' : '🔓'}</span>
                      <span>{bak.isProtected ? 'Protected' : 'Unprotected'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    {bak.retentionEndDate}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer"
                        onClick={() => startRestoreWizard(bak)}
                        type="button"
                      >
                        Restore
                      </button>
                      <button
                        className={`px-2 py-1 text-xs font-semibold rounded cursor-pointer ${
                          bak.isProtected
                            ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
                            : 'text-red-700 bg-red-50 hover:bg-red-100'
                        }`}
                        disabled={bak.isProtected}
                        onClick={() => {
                          setBackupToDelete(bak);
                          setDeleteBackupModalOpen(true);
                        }}
                        title={bak.isProtected ? 'Remove protection before deleting' : 'Delete snapshot'}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {selectedDbBackups.length === 0 && (
                <tr>
                  <td className="py-8 text-center text-slate-500 text-xs" colSpan={8}>
                    No backups found matching the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── RESTORE WIZARD MODAL (SCR-14) ─── */}
      {restoreModalOpen && selectedBackupForRestore && (
        <div
          aria-labelledby="restore-wizard-title"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
          role="dialog"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900" id="restore-wizard-title">
                  Restore Database Wizard
                </h3>
                <span className="text-xs text-slate-500">
                  Source: {selectedBackupForRestore.id} ({selectedBackupForRestore.dbName})
                </span>
              </div>
              <button
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-600 rounded p-1 cursor-pointer"
                onClick={() => setRestoreModalOpen(false)}
                type="button"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: STEP 1: CONFIGURE */}
            {restoreStep === 'configure' && (
              <div className="p-6 space-y-4 text-xs">
                {/* Mandatory Specification Boundary Callout */}
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                    <IconAlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    Crucial Operation Guarantees (Specification 3.8):
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-900 leading-relaxed">
                    <li>
                      <strong>Restore always creates a separate database instance.</strong> It NEVER overwrites your existing database.
                    </li>
                    <li>
                      It <strong>NEVER switches the application&apos;s connection string</strong> automatically.
                    </li>
                    <li>
                      It <strong>NEVER automatically executes pending migrations</strong>.
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="restored-db-name">
                      New Standalone Database Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      id="restored-db-name"
                      onChange={(e) => setRestoreTargetName(e.target.value)}
                      type="text"
                      value={restoreTargetName}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      A fresh instance identifier will be provisioned using this identifier.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Snapshot Timestamp:</span>
                      <span className="font-mono text-slate-800">{selectedBackupForRestore.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Uncompressed Storage:</span>
                      <span className="font-mono text-slate-800">{selectedBackupForRestore.sizeMb} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Engine Compatibility:</span>
                      <span className="font-mono text-slate-800 uppercase">{selectedBackupForRestore.engine} 15.x</span>
                    </div>
                  </div>

                  {/* Explicit Mandatory Acknowledgement Checkboxes */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        checked={acknowledgedSeparateDb}
                        className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                        onChange={(e) => setAcknowledgedSeparateDb(e.target.checked)}
                        type="checkbox"
                      />
                      <span className="text-[11px] text-slate-700 leading-tight">
                        I acknowledge that this action will provision a <strong>new, separate database</strong> and will not overwrite the original.
                      </span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        checked={acknowledgedAppUntouched}
                        className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                        onChange={(e) => setAcknowledgedAppUntouched(e.target.checked)}
                        type="checkbox"
                      />
                      <span className="text-[11px] text-slate-700 leading-tight">
                        I understand that active production traffic and application connection strings remain unchanged.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                    onClick={() => setRestoreModalOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors ${
                      acknowledgedSeparateDb && acknowledgedAppUntouched && restoreTargetName.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    disabled={!acknowledgedSeparateDb || !acknowledgedAppUntouched || !restoreTargetName.trim()}
                    onClick={executeRestore}
                    type="button"
                  >
                    Proceed with Restore
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: STEP 2: PROGRESS STEPPER */}
            {restoreStep === 'progress' && (
              <div className="p-8 space-y-6 text-center">
                <div className="flex justify-center">
                  <IconSpinner className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Restoring Database to New Instance</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Applying snapshot blocks into standalone volume &ldquo;{restoreTargetName}&rdquo;
                  </p>
                </div>

                {/* Progressive Stepper */}
                <div className="space-y-2 text-left text-xs bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-[11px]">
                  <div className={`flex items-center gap-2 ${restoreProgressStage >= 1 ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
                    <span>{restoreProgressStage > 1 ? '✓' : '◷'}</span> Allocating dedicated NVMe storage volume...
                  </div>
                  <div className={`flex items-center gap-2 ${restoreProgressStage >= 2 ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
                    <span>{restoreProgressStage > 2 ? '✓' : restoreProgressStage === 2 ? '◷' : '○'}</span> Streaming snapshot payload ({selectedBackupForRestore.sizeMb} MB)...
                  </div>
                  <div className={`flex items-center gap-2 ${restoreProgressStage >= 3 ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
                    <span>{restoreProgressStage > 3 ? '✓' : restoreProgressStage === 3 ? '◷' : '○'}</span> Initializing database engine and WAL recovery...
                  </div>
                  <div className={`flex items-center gap-2 ${restoreProgressStage >= 4 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                    <span>{restoreProgressStage === 4 ? '✓' : '○'}</span> Finalizing secure networking and TLS certificates...
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: STEP 3: RESULT COMPLETE */}
            {restoreStep === 'complete' && (
              <div className="p-6 space-y-4 text-xs">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 flex items-start gap-2.5">
                  <IconCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">Standalone Database Provisioned</span>
                    <p className="mt-0.5 text-[11px] leading-relaxed">
                      Snapshot restored successfully into new instance <strong>{restoreTargetName}</strong>.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Restored Host:</span>
                    <span className="text-slate-900 font-bold">{restoreTargetName}.c7x.internal.deployx.net</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Connection URI:</span>
                    <span className="text-slate-800 break-all">
                      {selectedDb.engine === 'postgresql' ? 'postgres' : 'mysql'}://{selectedDb.username}_restored:••••••••@{restoreTargetName}.c7x.internal.deployx.net:{selectedDb.port}/{restoreTargetName}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-950">Next Step:</span> To route application traffic to this restored copy, update the <code className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-blue-200">DATABASE_URL</code> in your project environment variables and trigger a redeployment.
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                    onClick={() => setRestoreModalOpen(false)}
                    type="button"
                  >
                    View Restored Instance
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MANUAL BACKUP CREATION MODAL ─── */}
      {manualBackupModalOpen && (
        <div
          aria-labelledby="manual-backup-title"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
          role="dialog"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900" id="manual-backup-title">
                Create Manual Snapshot · {selectedDb.name}
              </h3>
              <button
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-600 rounded p-1 cursor-pointer"
                onClick={() => setManualBackupModalOpen(false)}
                type="button"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <form className="p-6 space-y-4 text-xs" onSubmit={handleCreateManualBackup}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-backup-label">
                  Snapshot Label / Description (Optional)
                </label>
                <input
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  id="input-backup-label"
                  onChange={(e) => setNewBackupLabel(e.target.value)}
                  placeholder="e.g. Pre-v2.1 migration snapshot"
                  type="text"
                  value={newBackupLabel}
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    checked={newBackupProtected}
                    className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    onChange={(e) => setNewBackupProtected(e.target.checked)}
                    type="checkbox"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block text-xs">
                      Protect from automated deletion
                    </span>
                    <span className="text-[11px] text-slate-500 leading-normal block mt-0.5">
                      Protected manual snapshots are never auto-deleted. Unprotected manual snapshots expire after 30 days.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                  onClick={() => setManualBackupModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                  type="submit"
                >
                  Create Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE BACKUP CONFIRMATION MODAL ─── */}
      {deleteBackupModalOpen && backupToDelete && (
        <div
          aria-labelledby="delete-backup-title"
          aria-modal="true"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
          role="dialog"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900" id="delete-backup-title">
                Confirm Snapshot Deletion
              </h3>
              <button
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-600 rounded p-1 cursor-pointer"
                onClick={() => setDeleteBackupModalOpen(false)}
                type="button"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-xs leading-relaxed text-slate-700">
              <p>
                Are you sure you want to permanently delete snapshot{' '}
                <span className="font-mono font-bold text-slate-900">{backupToDelete.id}</span> ({backupToDelete.sizeMb} MB)?
              </p>
              <p className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                This action is irreversible. The snapshot data block will be permanently expunged from cold storage.
              </p>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
                onClick={() => setDeleteBackupModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer"
                onClick={handleDeleteBackup}
                type="button"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export { DatabaseManagementPage };
