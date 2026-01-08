'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Play, Loader2, CheckCircle2 } from "lucide-react";
import { startAnalysis } from "@/actions/analysis-actions";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CaseAnalysis({ caseId, ticket }: { caseId: string, ticket?: any }) {
    const [isPending, startTransition] = useTransition();

    if (!ticket) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pending Upload</AlertTitle>
                <AlertDescription>
                    Please upload a ticket to generate an AI assessment.
                </AlertDescription>
            </Alert>
        );
    }

    const handleStartAnalysis = () => {
        startTransition(async () => {
             const res = await startAnalysis(ticket.id);
             if (!res.success) {
                 alert("Analysis failed to start: " + res.error);
             }
        });
    };

    const isAnalyzed = ticket.status === 'Analyzed';
    const isAnalyzing = ticket.status === 'Analyzing';

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                     <h3 className="text-lg font-medium">AI Assessment</h3>
                     <p className="text-sm text-muted-foreground">Status: {ticket.status}</p>
                </div>
                {!isAnalyzed && ticket.status !== 'Failed' && (
                     <Button 
                        onClick={handleStartAnalysis} 
                        disabled={isPending || isAnalyzing}
                    >
                         {isPending || isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                         {isAnalyzing ? "Analyzing..." : "Start Analysis"}
                     </Button>
                )}
             </div>

             {/* Analysis Logs / Progress */}
             {ticket.analysisLog && ticket.analysisLog.length > 0 && (
                 <div className="rounded-md border bg-slate-950 text-slate-50 p-4 font-mono text-xs">
                     <p className="text-emerald-400 mb-2 font-bold flex items-center">
                         <Loader2 className="h-3 w-3 mr-2 animate-spin" /> 
                         System Activity Log
                     </p>
                     <ScrollArea className="h-[150px]">
                        <div className="space-y-1">
                            {ticket.analysisLog.map((log: string, i: number) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-slate-500">{log.split('] ')[0]}]</span>
                                    <span>{log.split('] ')[1]}</span>
                                </div>
                            ))}
                        </div>
                     </ScrollArea>
                 </div>
             )}

            {isAnalyzed && ticket.analysis && (
                <div className="rounded-lg border p-6 bg-card prose dark:prose-invert max-w-none shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="h-5 w-5" />
                        Analysis Complete
                    </div>
                    <div className="whitespace-pre-wrap font-serif leading-relaxed">
                        {ticket.analysis}
                    </div>
                </div>
            )}
            
            {!isAnalyzed && !isAnalyzing && (
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
