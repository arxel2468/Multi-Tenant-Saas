import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getPermissions, Role } from "@/lib/permissions";

export async function getCurrentMembership(workspaceId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });

  return membership;
}

export async function checkPermission(
  workspaceId: string,
  permission: keyof ReturnType<typeof getPermissions>
): Promise<boolean> {
  const membership = await getCurrentMembership(workspaceId);
  if (!membership) return false;

  const permissions = getPermissions(membership.role as Role);
  const permValue = permissions[permission];
  
  if (typeof permValue === "function") {
    return false;
  }
  
  return permValue;
}

export async function requirePermission(
  workspaceId: string,
  permission: keyof ReturnType<typeof getPermissions>
): Promise<void> {
  const hasPermission = await checkPermission(workspaceId, permission);
  if (!hasPermission) {
    throw new Error(`Permission denied: ${permission}`);
  }
}