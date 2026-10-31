'use client';

import React from 'react';
import { useDashboard } from '@/src/context/DashboardContext';
import {
  IconSidebarToggle,
  IconSearch,
  IconBell,
  IconSun,
} from '@/src/icons';

export interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenCommandPalette?: () => void;
  showToast?: (msg: string) => void;
  notificationsOpen?: boolean;
  onToggleNotifications?: () => void;
  userMenuOpen?: boolean;
  onToggleUserMenu?: () => void;
  onOpenDiagnosis?: () => void;
}

export default function Navbar(props: NavbarProps) {
  const context = useDashboard();

  const onToggleSidebar = props.onToggleSidebar ?? context.toggleSidebar;
  const onOpenCommandPalette = props.onOpenCommandPalette ?? context.openCmdPalette;
  const showToast = props.showToast ?? context.showToast;
  const notificationsOpen = props.notificationsOpen ?? context.notificationsOpen;
  const onToggleNotifications = props.onToggleNotifications ?? context.toggleNotifications;
  const userMenuOpen = props.userMenuOpen ?? context.userMenuOpen;
  const onToggleUserMenu = props.onToggleUserMenu ?? context.toggleUserMenu;
  const onOpenDiagnosis = props.onOpenDiagnosis ?? context.openDiagnosis;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3">
        <button
          aria-label="Toggle sidebar"
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 group cursor-pointer"
          id="toggle-sidebar-btn"
          onClick={onToggleSidebar}
          title="Toggle sidebar (⌘B or [)"
          type="button"
        >
          <IconSidebarToggle />
        </button>
        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
        <span className="text-sm font-medium text-slate-700">DeployX workspace</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger */}
        <div
          aria-label="Search projects (⌘K)"
          className="relative sm:w-64 cursor-pointer w-36"
          id="search-bar-trigger"
          onClick={onOpenCommandPalette}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenCommandPalette();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <IconSearch />
          </span>
          <input
            className="w-full h-9 pl-9 pr-12 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-lg focus:outline-none focus-visible:outline-none placeholder-slate-400 text-slate-700 cursor-pointer pointer-events-none transition-colors"
            placeholder="Search projects (⌘K)"
            readOnly
            tabIndex={-1}
            type="text"
          />
          <span className=" absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none hidden sm:flex">
            <kbd className=" px-1.5 py-1 text-[10px] text-slate-400 bg-white border border-slate-200 rounded font-sans leading-none shadow-2xs">
              ⌘K
            </kbd>
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            aria-controls="notifications-dropdown"
            aria-expanded={notificationsOpen}
            aria-label="Notifications"
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            id="btn-notifications"
            onClick={onToggleNotifications}
            type="button"
          >
            <IconBell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          {notificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"
              id="notifications-dropdown"
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[10px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full border border-red-100">
                  1 New
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                <div
                  className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  id="notif-item-storefront"
                  onClick={() => {
                    onOpenDiagnosis();
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-semibold text-slate-800">Storefront deployment failed</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-4">
                    Diagnostic finding: missing @stripe/stripe-js in package.json
                  </p>
                  <span className="text-[10px] text-slate-500 pl-4 mt-1 block">18 min ago</span>
                </div>
                <div
                  className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => showToast('Team Wiki: Deployment is actively progressing (42% completed).')}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-800">Team Wiki deployment started</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-4">
                    Analysis in progress (42% completed)
                  </p>
                  <span className="text-[10px] text-slate-500 pl-4 mt-1 block">4 min ago</span>
                </div>
              </div>
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  className="text-xs font-medium text-[#1677ff] hover:text-[#0958d9] bg-transparent border-0 cursor-pointer"
                  onClick={() => showToast('All notifications marked as read.')}
                  type="button"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme mode */}
        <div className="relative group">
          <button
            aria-label="Theme mode"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
            id="theme-toggle-btn"
            onClick={() => showToast('Theme: Standard Light Mode (Dark mode scheduled for DeployX V2)')}
            type="button"
          >
            <IconSun />
          </button>
          <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded shadow-md whitespace-nowrap z-50 pointer-events-none">
            Theme: Light (Dark Mode in V2)
          </div>
        </div>

        {/* User avatar */}
        <div className="relative">
          <button
            aria-expanded={userMenuOpen}
            aria-label="User menu"
            className="w-8 h-8 rounded-full bg-[#1677ff] text-white font-medium text-xs flex items-center justify-center shrink-0 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            id="user-avatar-btn"
            onClick={onToggleUserMenu}
            type="button"
          >
            AA
          </button>
          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden py-1"
              id="user-dropdown"
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">Ahmed Ashraf</p>
                <p className="text-[11px] text-slate-500 truncate">ahmed@deployx.dev</p>
              </div>
              <button
                className="w-full text-left block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => showToast('Account Settings — Module under development')}
                type="button"
              >
                Account Settings
              </button>
              <button
                className="w-full text-left block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => showToast('API Keys configuration — Module under development')}
                type="button"
              >
                API Keys
              </button>
              <button
                className="w-full text-left block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => showToast('Audit Log — Module under development')}
                type="button"
              >
                Audit Log
              </button>
              <div className="border-t border-slate-100" />
              <button
                className="w-full text-left block px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                onClick={() => showToast('Signing out... Redirecting to login session.')}
                type="button"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export { Navbar };
