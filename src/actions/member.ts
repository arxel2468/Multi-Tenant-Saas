"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentMembership } from "@/lib/check-permission";
import { getPermissions, canManageRole, Role } from "@/lib/permissions";

export async function changeMemberRole(
  memberId: string,
  newRole: Role,
  workspaceId: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const currentMembership = await getCurrentMembership(workspaceId);
  if (!currentMembership) throw new Error("You are not a member of this workspace");

  const permissions = getPermissions(currentMembership.role as Role);
  if (!permissions.canChangeRoles) {
    throw new Error("You do not have permission to change roles");
  }

  const targetMembership = await prisma.membership.findUnique({
    where: { id: memberId },
  });

  if (!targetMembership) throw new Error("Member not found");

  // Cannot change your own role
  if (targetMembership.userId === userId) {
    throw new Error("You cannot change your own role");
  }

  // Cannot promote someone to equal or higher rank
  if (!canManageRole(currentMembership.role as Role, newRole)) {
    throw new Error("You cannot assign this role");
  }

  // Cannot demote someone of equal or higher rank
  if (!canManageRole(currentMembership.role as Role, targetMembership.role as Role)) {
    throw new Error("You cannot change this member's role");
  }

  await prisma.membership.update({
    where: { id: memberId },
    data: { role: newRole },
  });

  revalidatePath(`/dashboard/${workspaceId}/settings`);
}

export async function removeMember(memberId: string, workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const currentMembership = await getCurrentMembership(workspaceId);
  if (!currentMembership) throw new Error("You are not a member of this workspace");

  const permissions = getPermissions(currentMembership.role as Role);
  if (!permissions.canRemoveMembers) {
    throw new Error("You do not have permission to remove members");
  }

  const targetMembership = await prisma.membership.findUnique({
    where: { id: memberId },
  });

  if (!targetMembership) throw new Error("Member not found");

  // Cannot remove yourself
  if (targetMembership.userId === userId) {
    throw new Error("You cannot remove yourself. Transfer ownership first.");
  }

  // Cannot remove someone of equal or higher rank
  if (!canManageRole(currentMembership.role as Role, targetMembership.role as Role)) {
    throw new Error("You cannot remove this member");
  }

  await prisma.membership.delete({
    where: { id: memberId },
  });

  revalidatePath(`/dashboard/${workspaceId}/settings`);
}

export async function leaveWorkspace(workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const membership = await getCurrentMembership(workspaceId);
  if (!membership) throw new Error("You are not a member of this workspace");

  // Owner cannot leave without transferring ownership
  if (membership.role === "OWNER") {
    throw new Error("Owners cannot leave. Transfer ownership or delete the workspace.");
  }

  await prisma.membership.delete({
    where: { id: membership.id },
  });

  revalidatePath(`/dashboard`);
}