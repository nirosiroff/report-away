import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:pl-64 flex flex-col">
        {/* Mobile Header */}
        <header className="h-14 md:hidden border-b flex items-center px-4 bg-background/95 backdrop-blur">
             <MobileSidebar />
             <span className="ml-4 font-semibold text-lg">ReportAway</span>
        </header>
        
        <main className="flex-1 p-6 md:p-8 bg-slate-50 dark:bg-slate-950/50">
          {children}
        </main>
      </div>
    </div>
  );
}
