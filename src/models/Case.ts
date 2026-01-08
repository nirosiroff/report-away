import mongoose, { Schema, Document, Model } from 'mongoose';

export type CaseStatus = 'Open' | 'Analysis In Progress' | 'Ready' | 'Closed';

export interface ICase extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  status: CaseStatus;
  analysisLog?: string[];
  structuredData?: Record<string, any>;
  analysis?: string;
  chatHistory?: {
      role: 'user' | 'assistant';
      content: string;
      createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['Open', 'Analysis In Progress', 'Ready', 'Closed'],
      default: 'Open',
    },
    analysisLog: { type: [String], default: [] },
    structuredData: { type: Schema.Types.Mixed, default: {} },
    analysis: { type: String },
    chatHistory: [
        {
            role: { type: String, enum: ['user', 'assistant'], required: true },
            content: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
  },
  { timestamps: true }
);

// Force recompilation if schema changed in dev
if (process.env.NODE_ENV === 'development' && mongoose.models.Case) {
    delete mongoose.models.Case;
}

const Case: Model<ICase> = mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);

export default Case;
