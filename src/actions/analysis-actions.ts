'use server';

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import { revalidatePath } from "next/cache";
import { analyzeTicket } from "@/lib/ai/analysis";

export async function startAnalysis(ticketId: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    await connectDB();
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
        throw new Error("Ticket not found");
    }

    // Trigger analysis
    // We await it here to ensure at least the initial status update happens, 
    // but the actual AI call inside is also awaited. 
    // If it takes too long for Vercel (max 10s on hobby), might need background job.
    // For now, we assume it fits or client handles loading state.
    
    try {
        await analyzeTicket(ticketId);
        revalidatePath(`/dashboard/cases/${ticket.caseId}`);
        return { success: true };
    } catch (error) {
        console.error("Analysis invocation failed:", error);
        return { success: false, error: (error as Error).message };
    }
}
