'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Menu, 
  PlusCircle, 
  Scale
} from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    user?: {
        name?: string | null;
        email?: string | null;
        picture?: string | null;
    } | null;
}

export function Sidebar({ className, user }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: 'Case Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'My Profile',
      icon: Settings,
      href: '/dashboard/profile', // Fixed Href to match folder structure
      active: pathname === '/dashboard/profile',
    },
  ];

  return (
    <div className={cn("flex flex-col h-full border-r bg-card text-card-foreground shadow-sm", className)}>
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b">
        <Scale className="h-6 w-6 text-primary mr-2" />
        <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            ReportAway
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-6">
        <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Practice Management
            </h3>
            <div className="space-y-1">
                {routes.map((route) => (
                <Button
                    key={route.href}
                    variant={route.active ? "secondary" : "ghost"}
                    className={cn(
                        "w-full justify-start font-medium", 
                        route.active ? "text-primary bg-secondary/50" : "text-muted-foreground hover:text-foreground"
                    )}
                    asChild
                >
                    <Link href={route.href}>
                    <route.icon className="mr-3 h-4 w-4" />
                    {route.label}
                    </Link>
                </Button>
                ))}
            </div>
        </div>
        
        <div>
           <Button className="w-full justify-start shadow-md bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/dashboard" className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Assessment
                </Link>
            </Button>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group">
             <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={user?.picture || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground">{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate text-foreground font-serif">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 text-xs" asChild>
            <Link href="/api/auth/logout">
            <LogOut className="mr-2 h-3 w-3" />
            Sign Out
            </Link>
        </Button>
      </div>
    </div>
  );
}

export function MobileSidebar({ user }: { user: SidebarProps['user'] }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                <Sidebar className="border-r-0 h-full" user={user} />
            </SheetContent>
        </Sheet>
    )
}
