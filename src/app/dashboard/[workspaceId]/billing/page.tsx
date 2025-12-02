import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getPermissions, Role } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { BillingClient } from "./billing-client";

export default async function BillingPage({ 
  params 
}: { 
  params: Promise<{ workspaceId: string }> 
}) {
  const { workspaceId } = await params;
  const { userId } = await auth();
  
  if (!userId) redirect("/sign-in");

  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });

  if (!membership) redirect("/dashboard");

  const permissions = getPermissions(membership.role as Role);
  
  if (!permissions.canAccessBilling) {
    redirect(`/dashboard/${workspaceId}`);
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { plan: true, name: true },
  });

  return (
    <BillingClient 
      workspaceId={workspaceId} 
      currentPlan={workspace?.plan || "FREE"}
      workspaceName={workspace?.name || ""}
    />
  );
}