import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getLocale } from 'next-intl/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  const locale = await getLocale();
  const isRTL = locale === 'he';
  
  const user = kindeUser ? {
      name: `${kindeUser.given_name} ${kindeUser.family_name}`,
      email: kindeUser.email,
      picture: kindeUser.picture
  } : null;

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex w-72 flex-col fixed inset-y-0 z-50 ${isRTL ? 'right-0' : 'left-0'}`}>
        <Sidebar user={user} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isRTL ? 'md:pr-72' : 'md:pl-72'}`}>
        {/* Mobile Header */}
        <header className="h-16 md:hidden border-b flex items-center px-4 bg-background/95 backdrop-blur sticky top-0 z-40">
             <MobileSidebar user={user} />
             <span className={`font-serif font-bold text-lg ${isRTL ? 'mr-4' : 'ml-4'}`}>ReportAway</span>
        </header>
        
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
