import { getCases, deleteCase } from '@/actions/case-actions';
import { NewCaseDialog } from '@/components/cases/NewCaseDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Trash2, TrendingUp, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const cases = await getCases();
  const t = await getTranslations('dashboard');

  // Calculate Metrics
  const totalCases = cases.length;
  const analysisComplete = cases.filter(c => c.status === 'Ready').length;
  const analysisPending = cases.filter(c => c.status === 'Analysis In Progress').length;
  const openCases = cases.filter(c => c.status === 'Open').length;

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'Ready': return 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20';
        case 'Analysis In Progress': return 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/20';
        case 'Closed': return 'bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 border-slate-500/20';
        default: return 'bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/20';
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-8">
      {/* Header & Metrics */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">{t('title')}</h1>
                <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
            </div>
            <NewCaseDialog />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('metrics.totalCases')}</CardTitle>
                    <FileText className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalCases}</div>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('metrics.analyzed')}</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analysisComplete}</div>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('metrics.inProgress')}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analysisPending}</div>
                </CardContent>
            </Card>
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t('metrics.needsReview')}</CardTitle>
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{openCases}</div>
                </CardContent>
            </Card>
        </div>
      </div>
      
      {/* Case List */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {t('recentAssessments')}
        </h2>
        
        {cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/30">
                <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{t('noCases.title')}</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-sm">{t('noCases.description')}</p>
                <NewCaseDialog />
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cases.map((c) => (
                    <div key={c.id} className="relative group transition-all duration-300 hover:shadow-md rounded-xl">
                        <Link href={`/${locale}/dashboard/cases/${c.id}`} className="block h-full">
                            <Card className="h-full border hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-semibold leading-tight line-clamp-1">
                                                {c.title}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {t('caseCard.id')}: {c.id.slice(-6)}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(c.status)}>
                                            {c.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                                        <span>{t('caseCard.created')} {new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        
                        <form action={async () => {
                            'use server';
                            await deleteCase(c.id);
                        }} className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                             <Button 
                                type="submit" 
                                variant="destructive" 
                                size="icon" 
                                className="h-8 w-8 rounded-full shadow-lg"
                                title={t('caseCard.delete')}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
