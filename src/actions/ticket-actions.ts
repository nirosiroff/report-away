'use server';

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import Case from "@/models/Case";
import { revalidatePath } from "next/cache";
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; 
import { analyzeTicket } from "@/lib/ai/analysis";

export async function uploadTicket(formData: FormData) {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser) {
        throw new Error("Unauthorized");
    }

    const file = formData.get("file") as File;
    const caseId = formData.get("caseId") as string;

    if (!file || !caseId) {
        throw new Error("Missing file or case ID");
    }

    await connectDB();
    
    // Verify case ownership
    const ticketCase = await Case.findById(caseId); // Rename to avoid conflict with 'Case' model usage if needed, but here it's fine
    if (!ticketCase) throw new Error("Case not found");
     
    // Simple local save for prototype
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    // Ensure directory exists in real app, here assuming we create it via command
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadDir, filename);
    
    try {
        await writeFile(filepath, buffer);
    } catch (error) {
        console.error("Error saving file locally:", error);
        // Fallback or better error handling
    }

    const fileUrl = `/uploads/${filename}`;

// ... (existing imports)
// ... (existing imports)

    const newTicket = await Ticket.create({
        caseId,
        fileUrl,
        rawText: "Pending extraction...", 
    });

    // Update case status
    ticketCase.status = 'Analysis In Progress';
    await ticketCase.save();

    // Trigger Analysis (Async)
    // We don't await this if we want fast response, but for Vercel functions it might be killed.
    // Ideally use background job. For now, await it to ensure it runs.
    try {
        await analyzeTicket(newTicket._id.toString());
    } catch (e) {
        console.error("Analysis trigger failed", e);
    }


    revalidatePath(`/dashboard/cases/${caseId}`);
    return { success: true, ticket: newTicket };
}

export async function getTickets(caseId: string) {
    await connectDB();
    const tickets = await Ticket.find({ caseId }).sort({ createdAt: -1 });
    return tickets.map(t => ({
        id: t._id.toString(),
        fileUrl: t.fileUrl,
        createdAt: t.createdAt,
        analysis: t.analysis
    }));
}
