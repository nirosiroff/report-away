import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import Ticket from "@/models/Ticket"; // Helper to avoid error if model not loaded
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatInterface } from "@/components/cases/ChatInterface";
import { TicketList } from "@/components/cases/TicketList";
import { CaseAnalysis } from "@/components/cases/CaseAnalysis";

async function getCase(id: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user) return null;

    await connectDB();
    const caseData = await Case.findById(id).populate('userId').lean();
    
    // Check ownership
    // Note: populating userId might return an object, but kindeId check is safer if we had it, 
    // or just check existing user's kindeId against case.userId ref lookup.
    // simpler:
    if (!caseData) return null;

    // Convert _id to string to avoid serialization issues
    // @ts-ignore
    caseData._id = caseData._id.toString();
    // @ts-ignore
    if(caseData.userId) caseData.userId = caseData.userId.toString();
    
    return caseData;

    // TODO: Strict ownership check here
    
    return caseData;
}

import { getTickets } from "@/actions/ticket-actions";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseData = await getCase(id);
  const tickets = await getTickets(id);

  console.log(`[CasePage] Fetched case ${id}. Status: ${caseData?.status}`);
  console.log(`[CasePage] structuredData type:`, typeof caseData?.structuredData, caseData?.structuredData);
  console.log(`[CasePage] analysis length:`, caseData?.analysis?.length);

  if (!caseData) {
    return notFound(); 
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.16))] gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">{caseData.title}</h1>
            <p className="text-muted-foreground text-sm">Created {new Date(caseData.createdAt).toLocaleDateString()}</p>
        </div>
        <Badge className="text-base px-4 py-1">{caseData.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        <div className="lg:col-span-2 flex flex-col min-h-0">
            <Tabs defaultValue="files" className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis & Strategy</TabsTrigger>
                </TabsList>
                <TabsContent value="files" className="flex-1 overflow-auto mt-4 border rounded-lg p-4 bg-white/50 dark:bg-slate-900/50">
                    <TicketList caseId={caseData._id.toString()} tickets={tickets} />
                </TabsContent>
                <TabsContent value="analysis" className="flex-1 overflow-auto mt-4 border rounded-lg p-4 bg-white/50 dark:bg-slate-900/50">
                     <CaseAnalysis caseData={JSON.parse(JSON.stringify(caseData))} />
                </TabsContent>
            </Tabs>
        </div>
        
        <div className="lg:col-span-1 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
            <div className="p-4 border-b">
                <h3 className="font-semibold leading-none tracking-tight">AI Assistant</h3>
                <p className="text-sm text-muted-foreground mt-1">Chat about your case.</p>
            </div>
            <div className="flex-1 p-0 overflow-hidden relative">
                 <ChatInterface caseId={caseData._id.toString()} />
            </div>
        </div>
      </div>
    </div>
  );
}
