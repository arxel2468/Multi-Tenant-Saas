import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

// Re-export types from utils for convenience
export type { ActivityAction, TargetType } from "./activity-utils";
export { getActionLabel, getActionIcon } from "./activity-utils";

interface LogActivityParams {
  workspaceId: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, any>;
}

export async function logActivity(params: LogActivityParams) {
  try {
    const user = await currentUser();
    if (!user) return;

    await prisma.activityLog.create({
      data: {
        workspaceId: params.workspaceId,
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress || "Unknown",
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        targetName: params.targetName,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}