'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Play, Loader2, CheckCircle2, FileText } from "lucide-react";
import { startAnalysis } from "@/actions/analysis-actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CaseAnalysis({ caseData }: { caseData: any }) {
    const [isPending, startTransition] = useTransition();

    const handleStartAnalysis = () => {
        startTransition(async () => {
             const res = await startAnalysis(caseData._id); // Pass caseId
             if (!res.success) {
                 alert("Analysis failed to start: " + res.error);
             }
        });
    };

    const isAnalyzed = caseData.status === 'Ready';
    const isAnalyzing = caseData.status === 'Analysis In Progress';
    const hasData = caseData.structuredData && Object.keys(caseData.structuredData).length > 0;

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                     <h3 className="text-lg font-medium">AI Assessment</h3>
                     <p className="text-sm text-muted-foreground">Status: {caseData.status}</p>
                </div>
                {/* Show button if not analyzing (so show if Open OR Ready/Reanalyze) */}
                 <Button 
                    onClick={handleStartAnalysis} 
                    disabled={isPending || isAnalyzing}
                    variant={isAnalyzed ? "outline" : "default"}
                >
                     {isPending || isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                     {isAnalyzing ? "Analyzing..." : (isAnalyzed ? "Reanalyze Case" : "Start Analysis")}
                 </Button>
             </div>

             {/* Analysis Logs / Progress */}
             {(isAnalyzing || caseData.analysisLog?.length > 0) && (
                 <div className="rounded-md border bg-slate-950 text-slate-50 p-4 font-mono text-xs shadow-inner">
                     <p className="text-emerald-400 mb-2 font-bold flex items-center">
                         {isAnalyzing ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-2" />}
                         System Activity Log
                     </p>
                     <ScrollArea className="h-[150px]">
                        <div className="space-y-1">
                            {caseData.analysisLog?.map((log: string, i: number) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-slate-500">{log.split('] ')[0]}]</span>
                                    <span>{log.split('] ')[1]}</span>
                                </div>
                            ))}
                             {isAnalyzing && (
                                <div className="animate-pulse text-emerald-500/50">_</div>
                            )}
                        </div>
                     </ScrollArea>
                 </div>
             )}

            {/* Consolidated Details (Step 3 Result) */}
            {hasData && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-primary" />
                            Extracted Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 font-medium">
                                    <tr className="border-b">
                                        <th className="h-12 px-4 align-middle">Field</th>
                                        <th className="h-12 px-4 align-middle">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(caseData.structuredData).map(([key, value]) => (
                                        <tr key={key} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                                            <td className="p-4 align-middle">{String(value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isAnalyzed && caseData.analysis && (
                <div className="rounded-lg border p-6 bg-card prose dark:prose-invert max-w-none shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="h-5 w-5" />
                        Analysis Complete
                    </div>
                    <div className="whitespace-pre-wrap font-serif leading-relaxed">
                        {caseData.analysis}
                    </div>
                </div>
            )}
            
            {!isAnalyzed && !isAnalyzing && !hasData && (
                 <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">Assessment Criteria</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                        <li>Citation Date & Time</li>
                        <li>Violation Code Verification</li>
                        <li>Officer Notes Analysis</li>
                        <li>Weather/Road Conditions (if applicable)</li>
                    </ul>
                </div>
            )}
        </div>
    )
}
