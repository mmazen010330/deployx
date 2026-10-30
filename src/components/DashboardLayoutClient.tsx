'use client';

import React from 'react';
import { DashboardProvider } from '@/src/context/DashboardContext';
import Sidebar from '@/src/sidebar/page';
import Navbar from '@/src/navebar/page';
import Footer from '@/src/footer/page';
import Dashboard from '@/src/dashbord/page';

export default function DashboardLayoutClient({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex flex-1 min-h-screen relative overflow-x-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <Navbar />
          {children || <Dashboard />}
          <Footer />
        </div>
      </div>
    </DashboardProvider>
  );
}

