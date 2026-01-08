import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

export default async function ProfilePage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Manage your account details.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.picture || ''} />
                        <AvatarFallback>{user?.given_name?.[0]}{user?.family_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="font-medium leading-none">{user?.given_name} {user?.family_name}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </CardContent>
            </Card>
            <div className="flex gap-4">
                 <Button asChild variant="outline">
                    <Link href="/api/auth/logout">Sign Out</Link>
                 </Button>
            </div>
        </div>
    )
}
