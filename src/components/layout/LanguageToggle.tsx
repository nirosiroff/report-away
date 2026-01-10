'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LanguageToggleProps {
  collapsed?: boolean;
}

export function LanguageToggle({ collapsed }: LanguageToggleProps) {
  const locale = useLocale();
  const pathname = usePathname();

  const getLocalizedPath = (newLocale: string) => {
    // Remove current locale prefix and add new one
    const pathWithoutLocale = pathname.replace(/^\/(en|he)/, '') || '/';
    return `/${newLocale}${pathWithoutLocale}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          className={cn(
            'text-slate-400 hover:text-white hover:bg-white/10',
            collapsed ? 'h-10 w-10 rounded-xl' : 'w-full justify-start h-8 px-4'
          )}
        >
          <Languages className={cn('h-4 w-4', !collapsed && 'mr-2')} />
          {!collapsed && (
            <span className="text-xs">
              {locale === 'en' ? 'English' : 'עברית'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem asChild className={cn(locale === 'en' && 'bg-accent')}>
          <Link href={getLocalizedPath('en')} locale="en">
            🇺🇸 English
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={cn(locale === 'he' && 'bg-accent')}>
          <Link href={getLocalizedPath('he')} locale="he">
            🇮🇱 עברית
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
