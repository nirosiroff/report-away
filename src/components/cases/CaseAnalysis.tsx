'use client';

import { useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, Play, Loader2, CheckCircle2, FileText, Scale } from "lucide-react";
import { startAnalysis } from "@/actions/analysis-actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function CaseAnalysis({ caseData }: { caseData: any }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleStartAnalysis = () => {
        startTransition(async () => {
             const res = await startAnalysis(caseData._id); 
             if (res.success) {
                 router.refresh();
             } else {
                 alert("Analysis failed to start: " + res.error);
             }
        });
    };

    const isAnalyzed = caseData.status === 'Ready';
    const isAnalyzing = caseData.status === 'Analysis In Progress';
    const hasData = caseData.structuredData && Object.keys(caseData.structuredData).length > 0;

    return (
        <div className="space-y-6 h-full flex flex-col">
             {/* Header Section */}
             <div className="flex items-center justify-between border-b pb-4">
                <div>
                     <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                        <Scale className="w-5 h-5 text-primary" />
                        Analysis & Strategy
                     </h3>
                     <p className="text-sm text-muted-foreground mt-1">
                        {isAnalyzed ? "AI assessment complete. Review the strategy below." : "Start the analysis to extract details and generate a defense strategy."}
                     </p>
                </div>
                 <Button 
                    onClick={handleStartAnalysis} 
                    disabled={isPending || isAnalyzing}
                    variant={isAnalyzed ? "outline" : "default"}
                    className="min-w-[140px]"
                >
                     {isPending || isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                     {isAnalyzing ? "Processing..." : (isAnalyzed ? "Reanalyze Case" : "Start Analysis")}
                 </Button>
             </div>

            {/* Main Content Area */}
            {isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 border rounded-lg bg-muted/10 border-dashed">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <div>
                        <h4 className="font-medium text-lg">Analyzing Case Documents</h4>
                        <p className="text-sm text-muted-foreground mt-1">Extracting text, verifying laws, and formulating strategy...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full min-h-0">
                    
                    {/* LEFT COLUMN: Extraction (4 cols) */}
                    <div className="xl:col-span-4 space-y-6">
                        {hasData ? (
                            <Card className="h-full border-l-4 border-l-primary/20 shadow-sm">
                                <CardHeader className="bg-muted/30 pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        Extracted Facts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[calc(100vh-340px)]">
                                        <div className="p-4 space-y-4">
                                            {Object.entries(caseData.structuredData).map(([key, value]) => (
                                                <div key={key} className="space-y-1 border-b last:border-0 pb-3 last:pb-0 border-border/50">
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </p>
                                                    <p className="text-sm font-medium text-foreground break-words">
                                                        {value ? String(value) : <span className="text-muted-foreground italic">Not found</span>}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="h-full flex items-center justify-center p-6 text-center border-dashed bg-muted/20">
                                <div>
                                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                                    <p className="text-sm text-muted-foreground">No ticket details found yet.</p>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Strategy (8 cols) */}
                    <div className="xl:col-span-8 h-full min-h-0">
                        {isAnalyzed && caseData.analysis ? (
                            <Card className="h-full border-none shadow-none bg-transparent">
                                <CardContent className="p-0 h-full">
                                    <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                                        <article className="prose dark:prose-invert prose-slate max-w-none 
                                            prose-headings:font-semibold prose-headings:tracking-tight
                                            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                                            prose-p:leading-7 prose-li:leading-7
                                            prose-strong:text-primary prose-strong:font-semibold
                                        ">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {caseData.analysis}
                                            </ReactMarkdown>
                                        </article>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-full flex items-center justify-center p-12 text-center border rounded-lg bg-muted/10 border-dashed">
                                <div>
                                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                        Start the analysis to generate a comprehensive legal defense strategy based on the extracted facts.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
