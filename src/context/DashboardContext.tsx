'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  IconSearch,
  IconX,
  IconInfo,
  IconSpinner,
} from '@/src/icons';

// ─── Toast System Types ────────────────────────────────────────────────────────

export interface ToastItem {
  id: number;
  message: string;
  visible: boolean;
}

let toastCounter = 0;

// ─── Context Interface ────────────────────────────────────────────────────────

export interface DashboardContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarMobileOpen: boolean;
  setSidebarMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  closeMobileSidebar: () => void;

  notificationsOpen: boolean;
  setNotificationsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleNotifications: () => void;

  userMenuOpen: boolean;
  setUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleUserMenu: () => void;

  cmdPaletteOpen: boolean;
  setCmdPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openCmdPalette: () => void;
  closeCmdPalette: () => void;

  newProjectOpen: boolean;
  setNewProjectOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openNewProject: () => void;
  closeNewProject: () => void;

  diagnosisOpen: boolean;
  setDiagnosisOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openDiagnosis: () => void;
  closeDiagnosis: () => void;

  toasts: ToastItem[];
  showToast: (message: string) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (!context) {
    // Return fallback state if used outside DashboardProvider
    return {
      sidebarCollapsed: false,
      setSidebarCollapsed: () => {},
      sidebarMobileOpen: false,
      setSidebarMobileOpen: () => {},
      toggleSidebar: () => {},
      closeMobileSidebar: () => {},
      notificationsOpen: false,
      setNotificationsOpen: () => {},
      toggleNotifications: () => {},
      userMenuOpen: false,
      setUserMenuOpen: () => {},
      toggleUserMenu: () => {},
      cmdPaletteOpen: false,
      setCmdPaletteOpen: () => {},
      openCmdPalette: () => {},
      closeCmdPalette: () => {},
      newProjectOpen: false,
      setNewProjectOpen: () => {},
      openNewProject: () => {},
      closeNewProject: () => {},
      diagnosisOpen: false,
      setDiagnosisOpen: () => {},
      openDiagnosis: () => {},
      closeDiagnosis: () => {},
      toasts: [],
      showToast: () => {},
    };
  }
  return context;
}

// ─── Command Palette Modal ────────────────────────────────────────────────────

const CMD_ITEMS = [
  { id: 'cmd-opt-0', action: 'diagnosis', name: 'Storefront', sub: 'Node.js · release/v2.1', status: 'Failed at Build', statusClass: 'text-red-700' },
  { id: 'cmd-opt-1', action: 'toast-wiki', name: 'Team Wiki', sub: 'React Static · main', status: 'Deploying (42%)', statusClass: 'text-blue-700' },
  { id: 'cmd-opt-2', action: 'toast-portfolio', name: 'Portfolio', sub: 'Static Web · main', status: 'Healthy', statusClass: 'text-emerald-700' },
  { id: 'cmd-opt-3', action: 'toast-notes', name: 'Notes API', sub: 'Node.js · main', status: 'Ready', statusClass: 'text-emerald-700' },
  { id: 'cmd-opt-4', action: 'new-project', name: 'Create New Project...', sub: 'Configure repository & launch analysis', status: 'Command', statusClass: 'text-[#1677ff]' },
];

function CommandPalette({
  isOpen,
  onClose,
  showToast,
  onOpenDiagnosis,
  onOpenNewProject,
}: {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  onOpenDiagnosis: () => void;
  onOpenNewProject: () => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = CMD_ITEMS.filter((item) => {
    const q = query.toLowerCase();
    return !q || item.name.toLowerCase().includes(q) || item.status.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q);
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleSelect = (action: string) => {
    onClose();
    if (action === 'diagnosis') setTimeout(() => onOpenDiagnosis(), 10);
    else if (action === 'new-project') setTimeout(() => onOpenNewProject(), 10);
    else if (action === 'toast-wiki') showToast('Team Wiki: Deploying (42% complete)');
    else if (action === 'toast-portfolio') showToast('Portfolio: Healthy active deployment');
    else if (action === 'toast-notes') showToast('Notes API: Ready active deployment');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && filtered[selectedIdx]) {
      handleSelect(filtered[selectedIdx].action);
    }
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[70] flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4"
      id="modal-command-palette"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'modal-command-palette') onClose();
      }}
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <h2 className="sr-only">Quick Command and Project Palette</h2>
        <div className="flex items-center px-4 border-b border-slate-200">
          <span className="text-slate-500 shrink-0"><IconSearch /></span>
          <input
            aria-autocomplete="list"
            className="min-w-0 flex-1 px-4 py-4 text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus-visible:outline-none bg-transparent"
            id="cmd-input"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, deployments, commands..."
            ref={inputRef}
            type="text"
            value={query}
          />
          <button aria-label="Close dialog" className="text-slate-500 hover:text-slate-700 p-1 mr-1 cursor-pointer" onClick={onClose} type="button">
            <kbd className="px-1.5 py-0.5 text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded font-sans leading-none">ESC</kbd>
          </button>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto" id="cmd-palette-list" role="listbox">
          {filtered.length > 0 && (
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Projects &amp; Actions</div>
          )}
          {filtered.map((item, idx) => (
            <div
              aria-selected={idx === selectedIdx}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-slate-700 cursor-pointer ${idx === selectedIdx ? 'bg-slate-100' : ''}`}
              id={item.id}
              key={item.id}
              onClick={() => handleSelect(item.action)}
              role="option"
              tabIndex={-1}
            >
              <div>
                <span className="font-medium text-slate-900 block">{item.name}</span>
                <span className="text-[11px] text-slate-500">{item.sub}</span>
              </div>
              <span className={`text-[11px] font-mono font-medium ${item.statusClass}`}>{item.status}</span>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-8 text-center text-xs text-slate-500">No matching projects or commands found</div>}
        </div>
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <span>Navigate with <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded">↑</kbd><kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded ml-0.5">↓</kbd></span>
          <span>Press <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded">↵</kbd> to select · <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}

// ─── New Project Modal ────────────────────────────────────────────────────────

function NewProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [repo, setRepo] = useState('');
  const [appType, setAppType] = useState('static');
  const [db, setDb] = useState('none');
  const [nameError, setNameError] = useState('');
  const [repoError, setRepoError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setRepo('');
      setAppType('static');
      setDb('none');
      setNameError('');
      setRepoError('');
      setSubmitted(false);
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
      setNameError('Project name required (lowercase letters, numbers, hyphens).');
      valid = false;
    } else {
      setNameError('');
    }
    if (!repo || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
      setRepoError('Valid repository path required in owner/repo format.');
      valid = false;
    } else {
      setRepoError('');
    }
    if (valid) setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div
      aria-labelledby="modal-new-project-title"
      aria-modal="true"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
      id="modal-new-project"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'modal-new-project') onClose();
      }}
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900" id="modal-new-project-title">Create New Project</h3>
          <button aria-label="Close dialog" className="text-slate-400 hover:text-slate-600 rounded p-1 cursor-pointer" onClick={onClose} type="button"><IconX /></button>
        </div>
        <form className="p-6 space-y-4" noValidate onSubmit={handleSubmit}>
          {submitted && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-2">
              <div className="flex items-start gap-2">
                <IconInfo />
                <div>
                  <span className="font-bold block text-blue-950">Configuration Validated (Simulation Notice):</span>
                  <p className="mt-0.5 leading-relaxed">Project parameters passed all requirements. This is a frontend demonstration — no actual Git connection or infrastructure provisioning has occurred.</p>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button className="bg-[#1677ff] hover:bg-[#0958d9] text-white font-medium text-[11px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer" onClick={onClose} type="button">Acknowledge &amp; Close</button>
              </div>
            </div>
          )}
          <div className={submitted ? 'opacity-40 pointer-events-none space-y-4' : 'space-y-4'}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-proj-name">Project Name <span className="text-red-500">*</span></label>
              <input className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${nameError ? 'border-red-500' : 'border-slate-200'}`} id="input-proj-name" onChange={(e) => { setName(e.target.value); setNameError(''); }} placeholder="my-awesome-app" ref={nameRef} type="text" value={name} />
              {nameError && <p className="text-[11px] text-red-600 mt-1" role="alert">{nameError}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-proj-repo">Git Repository <span className="text-red-500">*</span></label>
              <input className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${repoError ? 'border-red-500' : 'border-slate-200'}`} id="input-proj-repo" onChange={(e) => { setRepo(e.target.value); setRepoError(''); }} placeholder="org/repo-name" type="text" value={repo} />
              {repoError && <p className="text-[11px] text-red-600 mt-1" role="alert">{repoError}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-proj-type">Application Type <span className="text-red-500">*</span></label>
              <select className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800" id="input-proj-type" onChange={(e) => setAppType(e.target.value)} value={appType}>
                <option value="static">Static Web Application (HTML/CSS/JS)</option>
                <option value="react">React Static Build</option>
                <option value="node">Containerized Node.js Application</option>
                <option value="php">Containerized PHP Application</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="input-proj-db">Managed Database (Optional)</label>
              <select className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800" id="input-proj-db" onChange={(e) => setDb(e.target.value)} value={db}>
                <option value="none">None</option>
                <option value="postgres">PostgreSQL Database</option>
                <option value="mysql">MySQL Database</option>
              </select>
            </div>
          </div>
          {!submitted && (
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer" onClick={onClose} type="button">Cancel</button>
              <button className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1677ff] hover:bg-[#0958d9] rounded-lg shadow-xs cursor-pointer" type="submit">Start Application Analysis</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ─── Diagnosis Modal ──────────────────────────────────────────────────────────

function DiagnosisModal({
  isOpen,
  onClose,
  showToast,
}: {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
}) {
  const [retryShown, setRetryShown] = useState(false);
  const retryBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRetryShown(false);
      setTimeout(() => retryBtnRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      aria-labelledby="modal-diagnosis-title"
      aria-modal="true"
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4"
      id="modal-deployment-details"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'modal-deployment-details') onClose();
      }}
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <h3 className="text-base font-bold text-slate-900" id="modal-diagnosis-title">Diagnosis &amp; Resolution · Storefront</h3>
          </div>
          <button aria-label="Close dialog" className="text-slate-400 hover:text-slate-600 rounded p-1 cursor-pointer" onClick={onClose} type="button"><IconX /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-900 uppercase tracking-wide">Failure Stage: Build Stage Failure</span>
              <span className="text-[10px] font-semibold text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded">Diagnostic Finding</span>
            </div>
            <div className="font-mono text-[11px] text-red-800 mt-2 leading-relaxed bg-white/80 p-2.5 rounded border border-red-100">
              Cannot resolve dependency &apos;@stripe/stripe-js&apos; in ./app/checkout<br />
              <span className="text-[10px] text-red-600">Error: Package missing from package.json dependencies</span>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <h4 className="text-xs font-semibold text-slate-900">Recommended Resolution:</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add <code className="font-mono text-slate-800 bg-slate-200/80 px-1.5 py-0.5 rounded text-[11px]">@stripe/stripe-js</code> to{' '}
              <code className="font-mono text-slate-800 bg-slate-200/80 px-1.5 py-0.5 rounded text-[11px]">package.json</code> dependencies and commit changes to branch{' '}
              <code className="font-mono text-slate-700 text-[11px]">release/v2.1</code> (tag <code className="font-mono text-slate-700 text-[11px]">v2.1.0</code>).
            </p>
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Resolution Applied: Pending developer action</span>
            </div>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
            <div><span className="text-slate-400">Target Commit:</span> <span className="font-mono text-slate-700">#a91f3c2</span> (Update storefront checkout layout)</div>
            <div><span className="text-slate-400">Branch:</span> <span className="font-mono text-slate-700">release/v2.1</span></div>
            <div><span className="text-slate-400">Release Tag / Version:</span> <span className="font-mono text-slate-700">v2.1.0</span></div>
            <div><span className="text-slate-400">Production Traffic Status:</span> <span className="text-emerald-700 font-medium">Online (healthy previous release v2.0.9 active while v2.1.0 build failed)</span></div>
          </div>
          {retryShown && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
              <div className="flex items-center gap-2"><IconSpinner className="w-4 h-4 text-[#1677ff]" /><span className="font-semibold">Simulated Action:</span></div>
              <p className="text-[11px] text-blue-800 mt-1 leading-normal">Deployment retry request registered. Real deployment pipelines require backend CI/CD runner integration in production.</p>
            </div>
          )}
        </div>
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer" onClick={() => showToast('Simulated Check: Dependency @stripe/stripe-js is still missing in storefront repository.')} type="button">Re-run Readiness Check</button>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer" onClick={onClose} type="button">Close</button>
            <button
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1677ff] hover:bg-[#0958d9] rounded-lg shadow-xs transition-colors cursor-pointer"
              id="btn-retry-deployment"
              onClick={() => {
                setRetryShown(true);
                showToast('Simulated Action: Deployment retry request registered.');
              }}
              ref={retryBtnRef}
              type="button"
            >
              Retry Deployment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Provider ───────────────────────────────────────────────────────

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [diagnosisOpen, setDiagnosisOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, visible: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: true } : t)));
    }, 10);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 250);
    }, 4000);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1023) {
      setSidebarMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setSidebarMobileOpen(false);
  }, []);

  const toggleNotifications = useCallback(() => {
    setNotificationsOpen((prev) => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen((prev) => !prev);
  }, []);

  const openCmdPalette = useCallback(() => setCmdPaletteOpen(true), []);
  const closeCmdPalette = useCallback(() => setCmdPaletteOpen(false), []);

  const openNewProject = useCallback(() => setNewProjectOpen(true), []);
  const closeNewProject = useCallback(() => setNewProjectOpen(false), []);

  const openDiagnosis = useCallback(() => setDiagnosisOpen(true), []);
  const closeDiagnosis = useCallback(() => setDiagnosisOpen(false), []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#btn-notifications') && !target.closest('#notifications-dropdown')) {
        setNotificationsOpen(false);
      }
      if (!target.closest('#user-avatar-btn') && !target.closest('#user-dropdown')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement;
      const isTyping = active && ((active.tagName === 'INPUT' && active.id !== 'cmd-input') || active.tagName === 'TEXTAREA' || active.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(true);
        return;
      }
      if (!isTyping && !cmdPaletteOpen && !newProjectOpen && !diagnosisOpen) {
        if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') || e.key === '[') {
          e.preventDefault();
          toggleSidebar();
        }
      }
      if (e.key === 'Escape') {
        if (diagnosisOpen) { setDiagnosisOpen(false); return; }
        if (newProjectOpen) { setNewProjectOpen(false); return; }
        if (cmdPaletteOpen) { setCmdPaletteOpen(false); return; }
        setNotificationsOpen(false);
        setUserMenuOpen(false);
        if (sidebarMobileOpen) setSidebarMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cmdPaletteOpen, newProjectOpen, diagnosisOpen, sidebarMobileOpen, toggleSidebar]);

  const value: DashboardContextType = {
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    toggleSidebar,
    closeMobileSidebar,
    notificationsOpen,
    setNotificationsOpen,
    toggleNotifications,
    userMenuOpen,
    setUserMenuOpen,
    toggleUserMenu,
    cmdPaletteOpen,
    setCmdPaletteOpen,
    openCmdPalette,
    closeCmdPalette,
    newProjectOpen,
    setNewProjectOpen,
    openNewProject,
    closeNewProject,
    diagnosisOpen,
    setDiagnosisOpen,
    openDiagnosis,
    closeDiagnosis,
    toasts,
    showToast,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}

      {/* Global Modals */}
      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={closeCmdPalette}
        onOpenDiagnosis={openDiagnosis}
        onOpenNewProject={openNewProject}
        showToast={showToast}
      />
      <NewProjectModal isOpen={newProjectOpen} onClose={closeNewProject} />
      <DiagnosisModal isOpen={diagnosisOpen} onClose={closeDiagnosis} showToast={showToast} />

      {/* Global Toast Container */}
      <div aria-live="polite" className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none" id="toast-container" role="status">
        {toasts.map((toast) => (
          <div
            className={`pointer-events-auto bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 transition-all transform duration-200 ${
              toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            key={toast.id}
          >
            <IconInfo />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </DashboardContext.Provider>
  );
}
