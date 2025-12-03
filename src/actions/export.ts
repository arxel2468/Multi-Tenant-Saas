"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMembership } from "@/lib/check-permission";
import { getPermissions, Role } from "@/lib/permissions";
import { getActionLabel, ActivityAction } from "@/lib/activity-logger";

export async function exportActivityLogs(workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const membership = await getCurrentMembership(workspaceId);
  if (!membership) throw new Error("You are not a member of this workspace");

  // Only OWNER and ADMIN can export
  const permissions = getPermissions(membership.role as Role);
  if (!permissions.canInviteMembers) {
    throw new Error("You do not have permission to export data");
  }

  const logs = await prisma.activityLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  // Convert to CSV
  const headers = ["Date", "Time", "User", "Action", "Target", "Details"];
  const rows = logs.map((log) => {
    const date = new Date(log.createdAt);
    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      log.userEmail,
      getActionLabel(log.action as ActivityAction),
      log.targetName || "-",
      log.metadata || "-",
    ];
  });

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csv;
}

export async function exportTasks(workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const membership = await getCurrentMembership(workspaceId);
  if (!membership) throw new Error("You are not a member of this workspace");

  const tasks = await prisma.task.findMany({
    where: { workspaceId },
    include: { assignee: true },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["Title", "Status", "Priority", "Due Date", "Assignee", "Created"];
  const rows = tasks.map((task) => [
    task.title,
    task.status,
    task.priority,
    task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-",
    task.assignee?.userEmail || "Unassigned",
    new Date(task.createdAt).toLocaleDateString(),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csv;
}