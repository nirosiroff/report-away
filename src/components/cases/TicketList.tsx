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

export function TicketList({ caseId, tickets = [] }: { caseId: string, tickets?: any[] }) {
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
                router.refresh(); // Refresh server components to see new ticket
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
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {tickets.length === 0 && (
                     <p className="text-sm text-muted-foreground col-span-full text-center py-8">No files uploaded yet.</p>
                 )}
                 {tickets.map((t) => {
                    const isImage = t.fileUrl.match(/\.(jpeg|jpg|png|webp)$/i);
                    return (
                        <Card key={t.id} className="overflow-hidden group relative aspect-square flex flex-col">
                            <div className="flex-1 bg-muted relative overflow-hidden">
                                {isImage ? (
                                    <img src={t.fileUrl} alt="Ticket Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                        <FileText className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                     <Button variant="secondary" size="sm" asChild>
                                         <a href={t.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                                     </Button>
                                </div>
                            </div>
                            <div className="p-2 border-t bg-card text-xs">
                                 <p className="font-medium truncate mb-1">Uploaded {new Date(t.createdAt).toLocaleDateString()}</p>
                                 <div className="flex justify-between items-center text-muted-foreground">
                                     <span>{t.status}</span>
                                 </div>
                            </div>
                        </Card>
                    );
                 })}
            </div>
        </div>
    )
}
