import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  const user = kindeUser ? {
      name: `${kindeUser.given_name} ${kindeUser.family_name}`,
      email: kindeUser.email,
      picture: kindeUser.picture
  } : null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50">
        <Sidebar user={user} />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:pl-72 flex flex-col">
        {/* Mobile Header */}
        <header className="h-16 md:hidden border-b flex items-center px-4 bg-background/95 backdrop-blur sticky top-0 z-40">
             <MobileSidebar user={user} />
             <span className="ml-4 font-serif font-bold text-lg">ReportAway</span>
        </header>
        
        <main className="flex-1 p-6 md:p-10 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
