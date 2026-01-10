'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import Link from 'next/link';

export function HeaderLanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();

  const getLocalizedPath = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/(en|he)/, '') || '/';
    return `/${newLocale}${pathWithoutLocale}`;
  };

  const nextLocale = locale === 'en' ? 'he' : 'en';
  const nextLabel = locale === 'en' ? '🇮🇱 עברית' : '🇺🇸 EN';

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-sm"
      asChild
    >
      <Link href={getLocalizedPath(nextLocale)}>
        <Languages className="h-4 w-4 mr-1" />
        {nextLabel}
      </Link>
    </Button>
  );
}
