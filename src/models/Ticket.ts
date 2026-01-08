import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicket extends Document {
  caseId: mongoose.Types.ObjectId;
  fileUrl: string;
  rawText?: string;
  structuredData?: Record<string, any>;
  analysis?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    caseId: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    fileUrl: { type: String, required: true },
    rawText: { type: String },
    structuredData: { type: Schema.Types.Mixed },
    analysis: { type: String },
  },
  { timestamps: true }
);

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
