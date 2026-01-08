'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { uploadTicket } from "@/actions/ticket-actions";
import { useRouter } from 'next/navigation';

// Define ticket type for props
interface TicketType {
    id: string;
    fileUrl: string;
    createdAt: Date;
    analysis?: string;
}

// We need to fetch tickets in the parent or here. 
// For simplicity, let's assume we pass initial tickets or fetch them.
// Actually, better to fetch in server component page and pass as prop, but for now I'll just rely on router refresh.

export function TicketList({ caseId }: { caseId: string }) {
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('caseId', caseId);
            
            setIsUploading(true);
            try {
                await uploadTicket(formData);
                router.refresh();
            } catch (error) {
                console.error("Upload failed", error);
                alert("Upload failed");
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Files</h3>
                <div className="relative">
                    <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <Button size="sm" variant="outline" disabled={isUploading}>
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {isUploading ? "Uploading..." : "Upload Ticket"}
                    </Button>
                </div>
            </div>
            
            <div className="flex flex-col gap-4">
                 {/* This component should ideally receive tickets as props to list them */}
                 <p className="text-sm text-muted-foreground">Uploaded tickets will appear here after page refresh.</p>
                 {/* TODO: Add list display here */}
            </div>
        </div>
    )
}
