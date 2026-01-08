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
import { PlusCircle } from 'lucide-react';
import { createCase } from '@/actions/case-actions';

export function NewCaseDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
          <DialogDescription>
            Start a new traffic ticket assessment case.
          </DialogDescription>
        </DialogHeader>
        <form action={createCase}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                Title
                </Label>
                <Input
                id="title"
                name="title"
                placeholder="e.g. Speeding Ticket - Jan 20"
                className="col-span-3"
                required
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit">Create Case</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
