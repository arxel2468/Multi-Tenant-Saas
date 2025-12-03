import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export type ActivityAction =
  | "CREATED_TASK"
  | "UPDATED_TASK"
  | "COMPLETED_TASK"
  | "REOPENED_TASK"
  | "DELETED_TASK"
  | "CREATED_COMMENT"
  | "DELETED_COMMENT"
  | "INVITED_MEMBER"
  | "ACCEPTED_INVITE"
  | "CHANGED_ROLE"
  | "REMOVED_MEMBER"
  | "UPGRADED_PLAN";

export type TargetType = "TASK" | "MEMBER" | "WORKSPACE" | "COMMENT" | "INVITATION";

interface LogActivityParams {
  workspaceId: string;
  action: ActivityAction;
  targetType: TargetType;
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
    // Don't throw - logging should never break the main action
    console.error("Failed to log activity:", error);
  }
}

export function getActionLabel(action: ActivityAction): string {
  const labels: Record<ActivityAction, string> = {
    CREATED_TASK: "created a task",
    UPDATED_TASK: "updated a task",
    COMPLETED_TASK: "completed a task",
    REOPENED_TASK: "reopened a task",
    DELETED_TASK: "deleted a task",
    CREATED_COMMENT: "added a comment",
    DELETED_COMMENT: "deleted a comment",
    INVITED_MEMBER: "invited a member",
    ACCEPTED_INVITE: "joined the workspace",
    CHANGED_ROLE: "changed a member's role",
    REMOVED_MEMBER: "removed a member",
    UPGRADED_PLAN: "upgraded to Pro",
  };
  return labels[action] || action;
}

export function getActionIcon(action: ActivityAction): string {
  const icons: Record<ActivityAction, string> = {
    CREATED_TASK: "📝",
    UPDATED_TASK: "✏️",
    COMPLETED_TASK: "✅",
    REOPENED_TASK: "🔄",
    DELETED_TASK: "🗑️",
    CREATED_COMMENT: "💬",
    DELETED_COMMENT: "🗨️",
    INVITED_MEMBER: "📧",
    ACCEPTED_INVITE: "👋",
    CHANGED_ROLE: "🔑",
    REMOVED_MEMBER: "👤",
    UPGRADED_PLAN: "⭐",
  };
  return icons[action] || "📌";
}