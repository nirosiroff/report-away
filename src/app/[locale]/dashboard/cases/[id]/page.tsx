import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "@/components/cases/ChatInterface";
import { TicketList } from "@/components/cases/TicketList";
import { CaseAnalysis } from "@/components/cases/CaseAnalysis";
import { getTickets } from "@/actions/ticket-actions";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Types } from "mongoose";

// Type for the populated user object
interface PopulatedUser {
    _id: Types.ObjectId | string;
    kindeId: string;
    email?: string;
    name?: string;
}

// Type for the Mongoose lean result
interface CaseDocument {
    _id: Types.ObjectId | string;
    title: string;
    status: string;
    createdAt: Date;
    userId?: Types.ObjectId | string | PopulatedUser;
    analysis?: string;
    structuredData?: Record<string, unknown>;
    chatHistory?: Array<{
        _id?: Types.ObjectId;
        role: 'user' | 'assistant';
        content: string;
        createdAt?: Date;
    }>;
}

// Type for the serialized case returned from getCase
interface SerializedCase extends Omit<CaseDocument, '_id' | 'userId' | 'chatHistory'> {
    _id: string;
    userId?: string;
    chatHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
        createdAt?: Date;
    }>;
}

async function getCase(id: string): Promise<SerializedCase | null> {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user) return null;

    await connectDB();
    const caseData = await Case.findById(id).populate('userId').lean() as CaseDocument | null;
    
    if (!caseData) return null;

    // Authorization check: verify the current user owns this case
    // The userId field may be populated (object with kindeId) or a string reference
    const populatedUser = caseData.userId as PopulatedUser | undefined;
    const caseOwnerId = populatedUser?.kindeId || populatedUser?._id?.toString() || (typeof caseData.userId === 'string' ? caseData.userId : undefined);
    const currentUserId = user.id?.toString();
    
    if (!caseOwnerId || !currentUserId || caseOwnerId !== currentUserId) {
        // User doesn't own this case - return null (will show 404)
        return null;
    }

    // Build serialized result with string IDs
    // Handle userId which may be a string, ObjectId, or populated user object
    let serializedUserId: string | undefined;
    if (caseData.userId) {
        if (typeof caseData.userId === 'object' && '_id' in caseData.userId) {
            // Populated user object - extract _id
            serializedUserId = (caseData.userId as PopulatedUser)._id.toString();
        } else {
            // String or ObjectId - both have toString()
            serializedUserId = String(caseData.userId);
        }
    }
    
    const serialized: SerializedCase = {
        _id: caseData._id.toString(),
        title: caseData.title,
        status: caseData.status,
        createdAt: caseData.createdAt,
        userId: serializedUserId,
        analysis: caseData.analysis,
        structuredData: caseData.structuredData,
    };

    // Sanitize chatHistory to avoid ObjectId serialization issues
    if (caseData.chatHistory) {
        serialized.chatHistory = caseData.chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
            createdAt: msg.createdAt,
        }));
    }
    
    return serialized;
}

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function CasePage({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  
  const t = await getTranslations('caseDetail');
  const caseData = await getCase(id);
  const tickets = await getTickets(id);

  if (!caseData) {
    return notFound(); 
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.16))] gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">{caseData.title}</h1>
            <p className="text-muted-foreground text-sm">{t('created')} {new Date(caseData.createdAt).toLocaleDateString()}</p>
        </div>
        <Badge className="text-base px-4 py-1">{caseData.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        <div className="lg:col-span-2 flex flex-col min-h-0">
            <Tabs defaultValue="files" className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="files">{t('files')}</TabsTrigger>
                    <TabsTrigger value="analysis">{t('analysis')}</TabsTrigger>
                </TabsList>
                <TabsContent value="files" className="bg-white flex-1 overflow-auto mt-4 border rounded-lg p-4 dark:bg-slate-900/50">
                    <TicketList caseId={caseData._id.toString()} tickets={tickets} />
                </TabsContent>
                <TabsContent value="analysis" className="flex-1 overflow-auto mt-4 border rounded-lg p-4 bg-white dark:bg-slate-900/50">
                     <CaseAnalysis caseData={JSON.parse(JSON.stringify(caseData))} />
                </TabsContent>
            </Tabs>
        </div>
        
        <div className="lg:col-span-1 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
            <div className="p-4 border-b">
                <h3 className="font-semibold leading-none tracking-tight">{t('aiAssistant')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('chatPrompt')}</p>
            </div>
             <div className="flex-1 p-0 overflow-hidden relative">
                 <ChatInterface 
                    caseId={caseData._id.toString()} 
                    initialHistory={caseData.chatHistory}
                 />
            </div>
        </div>
      </div>
    </div>
  );
}
