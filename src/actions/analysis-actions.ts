'use server';

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import { revalidatePath } from "next/cache";
import { analyzeCase } from "@/lib/ai/analysis";

export async function startAnalysis(caseId: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    await connectDB();
    const caseData = await Case.findById(caseId);
    
    if (!caseData) {
        throw new Error("Case not found");
    }

    // Trigger analysis
    try {
        await analyzeCase(caseId);
        revalidatePath(`/dashboard/cases/${caseId}`);
        return { success: true };
    } catch (error) {
        console.error("Analysis invocation failed:", error);
        return { success: false, error: (error as Error).message };
    }
}
