import React from 'react';

export const IconDashboard = ({ className = 'w-5 h-5 shrink-0' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <rect height="7" rx="1.5" width="7" x="3" y="3" />
    <rect height="7" rx="1.5" width="7" x="14" y="3" />
    <rect height="7" rx="1.5" width="7" x="14" y="14" />
    <rect height="7" rx="1.5" width="7" x="3" y="14" />
  </svg>
);

export const IconFolder = ({ className = 'w-5 h-5 shrink-0' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconRocket = ({ className = 'w-5 h-5 shrink-0' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

export const IconDatabase = ({ className = 'w-5 h-5 shrink-0' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export const IconArchive = ({ className = 'w-5 h-5 shrink-0' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 8v13H3V8" />
    <path d="M1 3h22v5H1z" />
    <path d="M10 12h4" />
  </svg>
);

export const IconTerminal = ({ className = 'w-5 h-5 shrink-0' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" x2="20" y1="19" y2="19" />
  </svg>
);

export const IconCreditCard = ({ className = 'w-5 h-5 shrink-0' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <rect height="16" rx="2" width="22" x="1" y="4" />
    <line x1="1" x2="23" y1="10" y2="10" />
  </svg>
);

export const IconBell = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const IconSun = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" x2="12" y1="1" y2="3" />
    <line x1="12" x2="12" y1="21" y2="23" />
    <line x1="4.22" x2="5.64" y1="4.22" y2="5.64" />
    <line x1="18.36" x2="19.78" y1="18.36" y2="19.78" />
    <line x1="1" x2="3" y1="12" y2="12" />
    <line x1="21" x2="23" y1="12" y2="12" />
    <line x1="4.22" x2="5.64" y1="19.78" y2="18.36" />
    <line x1="18.36" x2="19.78" y1="5.64" y2="4.22" />
  </svg>
);

export const IconSearch = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" x2="16.65" y1="21" y2="16.65" />
  </svg>
);

export const IconX = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

export const IconChevronRight = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const IconCheck = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconSpinner = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={`${className} animate-spin`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const IconWarning = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

export const IconInfo = ({ className = 'w-4 h-4 text-[#1677ff] shrink-0' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="16" y2="12" />
    <line x1="12" x2="12.01" y1="8" y2="8" />
  </svg>
);

export const IconDots = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

export const IconSidebarToggle = ({ className = 'w-[18px] h-[18px]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect height="18" rx="2" ry="2" width="18" x="3" y="3" />
    <path d="M9 3v18" />
  </svg>
);

export const IconPlus = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </svg>
);

export const IconMonitor = ({ className = 'w-[18px] h-[18px]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <rect height="14" rx="2" width="20" x="2" y="3" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

export const IconSuccessCircle = ({ className = 'w-[18px] h-[18px]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const IconCircleX = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" x2="9" y1="9" y2="15" />
    <line x1="9" x2="15" y1="9" y2="15" />
  </svg>
);

export const IconClock = ({ className = 'w-3 h-3 text-[#1677ff]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const IconAlertCircle = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

