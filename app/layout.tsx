import type { Metadata } from 'next';
import './globals.css';
import { DashboardProvider } from '@/src/context/DashboardContext';
import Navbar from '@/src/navebar/page';
import Sidebar from '@/src/sidebar/page';
import Footer from '@/src/footer/page';

export const metadata: Metadata = {
  title: 'DeployX - Dashboard',
  description:
    'DeployX – Intelligent deployment platform with real-time project monitoring, build diagnostics, and activity telemetry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body
        className="min-h-screen flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900 overflow-x-clip"
        suppressHydrationWarning
      >
        <DashboardProvider>
          <div className="flex flex-1 min-h-screen relative">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
              <Navbar />
              {children}
              <Footer />
            </div>
          </div>
        </DashboardProvider>
      </body>
    </html>
  );
}
