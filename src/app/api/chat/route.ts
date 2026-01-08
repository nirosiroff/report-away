import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import Ticket from "@/models/Ticket";
import Message from "@/models/Message";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, caseId } = await req.json();

    if (!caseId || !messages) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();
    const currentCase = await Case.findById(caseId);
    if (!currentCase) {
        return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // TODO: Verify user ownership of case
    // if (currentCase.userId.toString() !== user._id.toString()) return 403
    
    // Fetch context (Tickets)
    const tickets = await Ticket.find({ caseId });
    const ticketContext = tickets.map(t => `Ticket Analysis: ${t.analysis || 'Not analyzed yet'}`).join('\n');

    const systemMessage = {
      role: "system",
      content: `You are an expert traffic ticket lawyer assistant. You are helping a user with their case "${currentCase.title}".
      
      Case Context:
      ${ticketContext}
      
      Advice should be helpful, pointing out potential challenges based on the ticket details. 
      Do not give definitive legal guarantees.
      `
    };

    // Save user message
    const lastUserMsg = messages[messages.length - 1];
    await Message.create({
        caseId,
        role: 'user',
        content: lastUserMsg.content
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...messages] as any,
    });

    const assistantContent = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    // Save assistant message
    await Message.create({
        caseId,
        role: 'assistant',
        content: assistantContent
    });

    return NextResponse.json({ 
        role: 'assistant', 
        content: assistantContent 
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
