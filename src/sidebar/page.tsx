'use client';

import Link from 'next/link';
import { useDashboard } from '@/src/context/DashboardContext';
import { IconDashboard, IconFolder, IconX } from '@/src/icons';

export default function Sidebar() {
  const { sidebarCollapsed, sidebarMobileOpen, closeMobileSidebar } = useDashboard();
  const classes = [
    'bg-white border-r border-slate-200 flex flex-col shrink-0 select-none z-30 relative',
    sidebarCollapsed ? 'collapsed' : '',
    sidebarMobileOpen ? 'mobile-open' : '',
  ].join(' ');

  return <>
    {sidebarMobileOpen && <button aria-label="Close navigation" className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden" onClick={closeMobileSidebar} type="button" />}
    <aside aria-label="Main navigation" className={classes} id="sidebar">
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 logo-wrapper">
        <Link className="flex items-center gap-2 font-bold text-xl text-slate-900" href="/dashboard" onClick={closeMobileSidebar}>
          <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm text-white">D</span>
          <span className="sidebar-header-title">Deploy<span className="text-blue-600">X</span></span>
        </Link>
        <button aria-label="Close navigation" className="rounded p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={closeMobileSidebar} type="button"><IconX /></button>
      </div>
      <nav aria-label="Workspace" className="space-y-1 px-3 py-4">
        <Link className="nav-item-btn flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600" href="/dashboard" onClick={closeMobileSidebar}>
          <IconDashboard /><span className="sidebar-text">Dashboard</span>
        </Link>
        <Link className="nav-item-btn flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600" href="/projects" onClick={closeMobileSidebar}>
          <IconFolder /><span className="sidebar-text">Projects</span>
        </Link>
      </nav>
      <div className="mt-auto border-t border-slate-200 px-4 py-3 text-xs text-slate-500">Account not connected</div>
    </aside>
  </>;
}
