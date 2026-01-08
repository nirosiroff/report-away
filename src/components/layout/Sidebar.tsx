'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  PlusCircle, 
  Scale,
  ChevronsLeft,
  ChevronsRight,
  FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    user?: {
        name?: string | null;
        email?: string | null;
        picture?: string | null;
    } | null;
}

export function Sidebar({ className, user }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      href: '/dashboard/profile',
      active: pathname === '/dashboard/profile',
    },
  ];

  const sidebarWidth = isCollapsed ? "w-[80px]" : "w-72";

  return (
    <div 
        className={cn(
            "relative flex flex-col h-full border-r bg-[#0b0c15] text-white transition-all duration-300 ease-in-out z-50 shadow-xl", 
            sidebarWidth,
            className
        )}
    >
      {/* Brand Header */}
      <div className={cn("h-20 flex items-center border-b border-white/10", isCollapsed ? "justify-center px-0" : "px-6")}>
        <div className="flex items-center gap-2 text-white font-bold">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <Scale className="h-6 w-6" />
            </div>
            {!isCollapsed && (
                <span className="font-display text-xl tracking-tight text-white">
                    ReportAway
                </span>
            )}
        </div>
      </div>

      {/* Collapse Toggle */}
      {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -right-3 top-24 h-6 w-6 rounded-full border bg-background shadow-md z-50 hover:bg-accent"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronsRight className="h-3 w-3" /> : <ChevronsLeft className="h-3 w-3" />}
          </Button>
      )}

      {/* Navigation */}
      <div className="flex-1 py-8 px-3 space-y-6">
        <div className="space-y-2">
            {!isCollapsed && (
                <h3 className="mb-2 px-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                    Menu
                </h3>
            )}
            {routes.map((route) => (
            <Button
                key={route.href}
                variant="ghost"
                className={cn(
                    "w-full font-medium transition-all duration-200 group relative hover:bg-white/10", 
                    isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto rounded-xl" : "justify-start px-4 h-11 rounded-lg",
                    route.active 
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/20" 
                        : "text-slate-400 hover:text-white"
                )}
                asChild
            >
                <Link href={route.href}>
                <route.icon className={cn("h-[18px] w-[18px]", !isCollapsed && "mr-3", route.active && "text-white")} />
                {!isCollapsed && route.label}
                {isCollapsed && route.active && (
                    <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-indigo-400 -mr-1 -mt-1" />
                )}
                </Link>
            </Button>
            ))}
        </div>
        
        <div className="pt-4 border-t border-border/40">
           <Button 
                className={cn(
                    "w-full shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-violet-600 hover:opacity-90 transition-all",
                    isCollapsed ? "h-10 w-10 p-0 rounded-xl" : "justify-start px-4"
                )} 
                asChild
            >
                <Link href="/dashboard" className="flex items-center justify-center">
                    <PlusCircle className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                    {!isCollapsed && "New Assessment"}
                </Link>
            </Button>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className={cn("flex items-center gap-3 p-2 rounded-xl transition-colors", !isCollapsed && "hover:bg-white/5 cursor-pointer")}>
             <Avatar className="h-9 w-9 border-2 border-white/10 shadow-sm">
                <AvatarImage src={user?.picture || ''} />
                <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                    {user?.name?.[0] || 'U'}
                </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-none truncate text-slate-100">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-slate-400 truncate font-medium mt-1">{user?.email || ''}</p>
                </div>
            )}
        </div>
        {!isCollapsed && (
            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 h-8 text-xs mt-2" asChild>
                <Link href="/api/auth/logout">
                <LogOut className="mr-2 h-3 w-3" />
                Sign Out
                </Link>
            </Button>
        )}
      </div>
    </div>
  );
}

export function MobileSidebar({ user }: { user: SidebarProps['user'] }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden sticky top-4 left-4 z-40 bg-background/80 backdrop-blur-lg border shadow-sm">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] border-r-0 bg-transparent shadow-none">
                <Sidebar className="h-full w-full rounded-r-2xl border-r shadow-2xl" user={user} />
            </SheetContent>
        </Sheet>
    )
}
