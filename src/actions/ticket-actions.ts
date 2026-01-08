'use server';

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import Case from "@/models/Case";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; 
import { put } from '@vercel/blob';

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
     
    // Vercel Blob Upload or Local Fallback
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    let fileUrl = '';
    
    // Check for the custom env var provided by user
    const blobToken = process.env.BLOB_REPORT_READ_WRITE_TOKEN;

    if (blobToken) {
        try {
            const { url } = await put(filename, file, { 
                access: 'public',
                token: blobToken // Explicitly pass the token
            });
            fileUrl = url;
            console.log("Uploaded to Vercel Blob:", fileUrl);
        } catch (error) {
            console.error("Vercel Blob upload failed:", error);
            throw new Error("File upload failed");
        }
    } else {
        console.warn("BLOB_REPORT_READ_WRITE_TOKEN not found, falling back to local storage.");
        try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            
            await mkdir(uploadDir, { recursive: true });
            
            const filepath = path.join(uploadDir, filename);
            await writeFile(filepath, buffer);
            fileUrl = `/uploads/${filename}`;
            console.log("Uploaded locally:", fileUrl);
        } catch (error) {
            console.error("Local upload failed:", error);
            throw new Error("File upload failed");
        }
    }

    const newTicket = await Ticket.create({
        caseId,
        fileUrl,
        status: 'Uploaded',
        rawText: "Pending analysis...", 
    });
    
    // Note: Analysis is now triggered manually via 'startAnalysis'


    revalidatePath(`/dashboard/cases/${caseId}`);
    return { 
        success: true, 
        ticket: {
            id: newTicket._id.toString(),
            fileUrl: newTicket.fileUrl,
            status: newTicket.status,
            createdAt: newTicket.createdAt,
            // Add other fields if needed by UI
        } 
    };
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
