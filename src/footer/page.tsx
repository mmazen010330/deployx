import React from 'react';

export interface FooterProps {
  className?: string;
  message?: string;
}

export default function Footer({
  className = 'py-4 text-center border-t border-slate-200/80 bg-white/70',
  message = 'Prototype / UI Demonstration — Project data, deployment telemetry, and logs shown are sample simulation data.',
}: FooterProps) {
  return (
    <footer className={className}>
      <p className="text-xs text-slate-500 px-4">{message}</p>
    </footer>
  );
}

export { Footer };

