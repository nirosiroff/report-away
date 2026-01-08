import mongoose, { Schema, Document, Model } from 'mongoose';

export type CaseStatus = 'Open' | 'Analysis In Progress' | 'Ready' | 'Closed';

export interface ICase extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  status: CaseStatus;
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
  },
  { timestamps: true }
);

const Case: Model<ICase> = mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);

export default Case;
