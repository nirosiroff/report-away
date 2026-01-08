'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function CaseAnalysis({ caseId }: { caseId: string }) {
    return (
        <div className="space-y-4">
             <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pending Upload</AlertTitle>
                <AlertDescription>
                    Please upload a ticket to generate an AI assessment.
                </AlertDescription>
            </Alert>
            
            <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">Assessment Criteria</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Citation Date & Time</li>
                    <li>Violation Code Verification</li>
                    <li>Officer Notes Analysis</li>
                    <li>Weather/Road Conditions (if applicable)</li>
                </ul>
            </div>
        </div>
    )
}
