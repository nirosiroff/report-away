'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  PlusCircle 
} from 'lucide-react';
// import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'; // Can't import directly in client component usually without wrapper, or use API route.
// Using anchor tag for Kinde logout for simplicity in prototype, or could use a client component wrapper.

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Profile',
      icon: Settings,
      href: '/profile',
      active: pathname === '/profile',
    },
  ];

  return (
    <div className={cn("pb-12 h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ReportAway
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className={cn("w-full justify-start", route.active && "bg-secondary")}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Actions
          </h2>
          <div className="space-y-1">
             <Button className="w-full justify-start" variant="outline">
                <Link href="/dashboard/new" className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Case
                </Link>
            </Button>
          </div>
        </div>
         <div className="px-3 py-2 mt-auto">
           <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20" asChild>
              <Link href="/api/auth/logout">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Link>
           </Button>
         </div>
      </div>
    </div>
  );
}

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
                <Sidebar className="border-r-0" />
            </SheetContent>
        </Sheet>
    )
}
