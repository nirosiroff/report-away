'use server';

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import connectDB from "@/lib/db";
import User, { IUser } from "@/models/User";
import Case, { ICase } from "@/models/Case";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCase(formData: FormData) {
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  if (!kindeUser.id || !kindeUser.email) {
    throw new Error("Invalid user data from Kinde");
  }

  // Find or create local user
  let user = await User.findOne({ kindeId: kindeUser.id });
  if (!user) {
    user = await User.create({
      kindeId: kindeUser.id,
      email: kindeUser.email,
      name: `${kindeUser.given_name} ${kindeUser.family_name}`,
    });
  }

  const title = formData.get("title") as string;

  if (!title) {
    throw new Error("Title is required");
  }

  const newCase = await Case.create({
    userId: user?._id,
    title,
    status: 'Open',
  });

  revalidatePath('/dashboard');
  redirect(`/dashboard/cases/${newCase._id}`);
}

export async function getCases() {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();
  
    if (!kindeUser) {
        return [];
    }
  
    await connectDB();
    const user = await User.findOne({ kindeId: kindeUser.id });
    
    if (!user) return [];

    const cases = await Case.find({ userId: user._id }).sort({ createdAt: -1 });

    return cases.map(c => ({
        id: c._id.toString(),
        title: c.title,
        status: c.status,
        createdAt: c.createdAt,
    }));
}

// Helper imports for deletion logic
import Ticket from "@/models/Ticket";
import Message from "@/models/Message";

export async function deleteCase(caseId: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    await connectDB();
    
    // Verify ownership
    const localUser = await User.findOne({ kindeId: user.id });
    if (!localUser) throw new Error("User not found");

    const caseToDelete = await Case.findOne({ _id: caseId, userId: localUser._id });
    if (!caseToDelete) {
        throw new Error("Case not found or unauthorized");
    }

    // Delete related data
    await Ticket.deleteMany({ caseId: caseToDelete._id });
    await Message.deleteMany({ caseId: caseToDelete._id });
    
    // Delete case
    await Case.findByIdAndDelete(caseToDelete._id);

    revalidatePath('/dashboard');
}
