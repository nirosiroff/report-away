import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId, content } = await req.json();

    if (!caseId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    const caseData = await Case.findById(caseId);

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Verify ownership (optional but recommended)
    // if (caseData.userId.toString() !== user.id) ... 
    
    // Append User Message to DB
    const userMessage = { role: 'user', content, createdAt: new Date() };
    
    // Ensure chatHistory exists
    if (!caseData.chatHistory) {
        caseData.chatHistory = [];
    }
    
    // @ts-ignore
    caseData.chatHistory.push(userMessage);

    // Prepare Context for LLM
    const context = `
      Case Title: ${caseData.title}
      Status: ${caseData.status}
      
      Extracted Ticket Facts:
      ${JSON.stringify(caseData.structuredData, null, 2)}
      
      Legal Analysis & Strategy:
      ${caseData.analysis || "Analysis not yet complete."}
    `;

    const systemPrompt = `You are ReportAway's expert traffic law AI assistant. 
    You have access to the specific details of the user's traffic case.
    Answer the user's questions clearly, referencing the facts and strategy provided below.
    Do not make up laws; stick to the provided context and general traffic law principles.
    
    CASE CONTEXT:
    ${context}
    `;

    // Construct full message history for the API call
    // Limit history to last 10 messages for token efficiency if needed, but for now send all (or last 20)
    const apiMessages = [
        { role: 'system', content: systemPrompt },
        // @ts-ignore
        ...caseData.chatHistory.map(m => ({ role: m.role, content: m.content })) 
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: apiMessages as any,
    });

    const assistantContent = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    // Append Assistant Message to DB
    const assistantMessage = { role: 'assistant', content: assistantContent, createdAt: new Date() };
    // @ts-ignore
    caseData.chatHistory.push(assistantMessage);
    
    // DEBUG: Log before save
    console.log(`[ChatAPI] Saving history... Current Length: ${caseData.chatHistory.length}`);
    
    await caseData.save();

    // DEBUG: Verify it persisted
    const verify = await Case.findById(caseId);
    console.log(`[ChatAPI] Post-save verification. History Length: ${verify?.chatHistory?.length}`);

    return NextResponse.json({ 
        success: true, 
        message: assistantMessage 
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
