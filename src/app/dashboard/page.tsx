import { getCases } from '@/actions/case-actions';
import { NewCaseDialog } from '@/components/cases/NewCaseDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function DashboardPage() {
  const cases = await getCases();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Cases</h1>
        <NewCaseDialog />
      </div>
      
      {cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg min-h-[400px] bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-muted-foreground mb-4">You have no active cases.</p>
          <NewCaseDialog />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => (
                <Link key={c.id} href={`/dashboard/cases/${c.id}`}>
                    <Card className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {c.title}
                            </CardTitle>
                            <Badge variant={c.status === 'Open' ? 'default' : 'secondary'}>{c.status}</Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                Created {new Date(c.createdAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
      )}
    </div>
  );
}
