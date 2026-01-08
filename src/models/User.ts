import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  kindeId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    kindeId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
