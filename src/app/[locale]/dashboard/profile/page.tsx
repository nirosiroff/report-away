import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    // Redirect unauthenticated users to sign-in
    if (!user) {
        redirect('/api/auth/login');
    }
    
    const t = await getTranslations('profile');
    const tCommon = await getTranslations('common');

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>{t('userInfo')}</CardTitle>
                    <CardDescription>{t('manageAccount')}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user.picture || ''} />
                        <AvatarFallback>
                            {user.given_name?.[0] || user.email?.[0] || '?'}
                            {user.family_name?.[0] || ''}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="font-medium leading-none">
                          {[user.given_name, user.family_name].filter(Boolean).join(' ') || user.email || 'User'}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </CardContent>
            </Card>
            <div className="flex gap-4">
                 <Button asChild variant="outline">
                    <Link href="/api/auth/logout">{tCommon('signOut')}</Link>
                 </Button>
            </div>
        </div>
    )
}
