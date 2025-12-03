"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMembership } from "@/lib/check-permission";
import { getPermissions, Role } from "@/lib/permissions";
import { logActivity } from "@/lib/activity-logger";

export async function createInvite(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const email = formData.get("email") as string;
  const workspaceId = formData.get("workspaceId") as string;

  const membership = await getCurrentMembership(workspaceId);
  if (!membership) throw new Error("You are not a member of this workspace");

  const permissions = getPermissions(membership.role as Role);
  if (!permissions.canInviteMembers) {
    throw new Error("You do not have permission to invite members");
  }

  const existingMember = await prisma.membership.findFirst({
    where: {
      workspaceId,
      userEmail: email,
    },
  });

  if (existingMember) {
    throw new Error("This user is already a member of this workspace");
  }

  const existingInvite = await prisma.invitation.findFirst({
    where: {
      workspaceId,
      email,
      status: "PENDING",
    },
  });

  if (existingInvite) {
    revalidatePath(`/dashboard/${workspaceId}/settings`);
    return existingInvite.token;
  }

  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  await prisma.invitation.create({
    data: {
      email,
      workspaceId,
      token,
    },
  });

  // Log activity
  await logActivity({
    workspaceId,
    action: "INVITED_MEMBER",
    targetType: "INVITATION",
    targetName: email,
  });

  revalidatePath(`/dashboard/${workspaceId}/settings`);
  return token;
}

export async function acceptInvite(token: string) {
  const user = await currentUser();
  
  if (!user) {
    return redirect(`/sign-in?redirect_url=/invite/${token}`);
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation || invitation.status !== "PENDING") {
    throw new Error("Invalid or expired invite");
  }

  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: invitation.workspaceId,
      },
    },
  });

  if (existingMembership) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });
    redirect(`/dashboard/${invitation.workspaceId}`);
  }

  await prisma.membership.create({
    data: {
      userId: user.id,
      userEmail: user.emailAddresses[0].emailAddress,
      workspaceId: invitation.workspaceId,
      role: "MEMBER",
    },
  });

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: "ACCEPTED" },
  });

  // Log activity
  await logActivity({
    workspaceId: invitation.workspaceId,
    action: "ACCEPTED_INVITE",
    targetType: "MEMBER",
    targetName: user.emailAddresses[0].emailAddress,
  });

  redirect(`/dashboard/${invitation.workspaceId}`);
}