'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2, Play } from "lucide-react";
import { useRouter } from 'next/navigation';

export function EditFactsDialog({ caseId, data }: { caseId: string, data: Record<string, any> }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(data || {});
  const router = useRouter();

  const handleSave = async (shouldReanalyze: boolean = false) => {
      setLoading(true);
      try {
          // 1. Save Facts
          const res = await fetch('/api/cases/facts', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ caseId, structuredData: formData })
          });

          if (!res.ok) throw new Error("Failed to update facts");

          // 2. Trigger Analysis if requested
          if (shouldReanalyze) {
             const { startAnalysis } = await import("@/actions/analysis-actions"); 
             const analysisRes = await startAnalysis(caseId);
             if (!analysisRes.success) throw new Error(analysisRes.error);
          }

          setOpen(false);
          router.refresh();
      } catch (error) {
          console.error(error);
          alert("Failed to save changes: " + (error as Error).message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
            <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Extracted Facts</DialogTitle>
          <DialogDescription>
            Correct any details extracted from the ticket. This will update the context for the AI assistant.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            {Object.entries(formData).map(([key, value]) => (
                 <div key={key} className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={key} className="text-right capitalize text-xs text-muted-foreground">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Input
                    id={key}
                    value={value as string}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    className="col-span-3 h-8 text-sm"
                    />
                </div>
            ))}
            {Object.keys(formData).length === 0 && (
                <div className="text-center text-sm text-muted-foreground">No facts to edit.</div>
            )}
        </div>
        <DialogFooter className="flex gap-2 sm:justify-end">
           <Button type="button" variant="secondary" onClick={() => handleSave(true)} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Save & Reanalyze
          </Button>
          <Button type="submit" onClick={() => handleSave(false)} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
