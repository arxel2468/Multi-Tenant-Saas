"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// 1. Create an Invite
export async function createInvite(formData: FormData) {
  // FIX: Add 'await' here
  const { userId } = await auth(); 
  
  if (!userId) throw new Error("Unauthorized");

  const email = formData.get("email") as string;
  const workspaceId = formData.get("workspaceId") as string;

  // Generate a secure random token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  await prisma.invitation.create({
    data: {
      email,
      workspaceId,
      token,
    },
  });

  revalidatePath(`/dashboard/${workspaceId}`);
  return token; 
}

// 2. Accept an Invite
export async function acceptInvite(token: string) {
  // FIX: Add 'await' here too
  const { userId } = await auth();
  
  if (!userId) {
    return redirect(`/sign-in?redirect_url=/invite/${token}`);
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation || invitation.status !== "PENDING") {
    throw new Error("Invalid or expired invite");
  }

  await prisma.membership.create({
    data: {
      userId,
      workspaceId: invitation.workspaceId,
      role: "MEMBER",
    },
  });

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: "ACCEPTED" },
  });

  redirect(`/dashboard/${invitation.workspaceId}`);
}