"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentMembership } from "@/lib/check-permission";
import { getPermissions, Role } from "@/lib/permissions";
import { logActivity } from "@/lib/activity-logger";

export async function createTask(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId") as string;
  
  const membership = await getCurrentMembership(workspaceId);
  if (!membership) throw new Error("You are not a member of this workspace");

  const permissions = getPermissions(membership.role as Role);
  if (!permissions.canCreateTask) throw new Error("You do not have permission to create tasks");

  const title = formData.get("title") as string;
  const assigneeId = formData.get("assigneeId") as string;
  const priority = (formData.get("priority") as string) || "MEDIUM";
  const dueDateString = formData.get("dueDate") as string;
  const dueDate = dueDateString ? new Date(dueDateString) : null;

  const task = await prisma.task.create({
    data: {
      workspaceId,
      title,
      assignedToId: assigneeId === "none" ? null : assigneeId,
      status: "TODO",
      priority,
      dueDate,
      createdById: user.id,
      createdByEmail: user.emailAddresses[0].emailAddress,
    },
  });

  // Log activity
  await logActivity({
    workspaceId,
    action: "CREATED_TASK",
    targetType: "TASK",
    targetId: task.id,
    targetName: title,
    metadata: { priority, dueDate },
  });

  revalidatePath(`/dashboard/${workspaceId}`);
}

export async function deleteTask(taskId: string, workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const membership = await getCurrentMembership(workspaceId);
  if (!membership) throw new Error("You are not a member of this workspace");

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) throw new Error("Task not found");

  const permissions = getPermissions(membership.role as Role);
  const canDelete = permissions.canDeleteTask(task.createdById || "", userId);

  if (!canDelete) {
    throw new Error("You do not have permission to delete this task");
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  // Log activity
  await logActivity({
    workspaceId,
    action: "DELETED_TASK",
    targetType: "TASK",
    targetId: taskId,
    targetName: task.title,
  });

  revalidatePath(`/dashboard/${workspaceId}`);
}

export async function toggleTaskStatus(taskId: string, currentStatus: string, workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const membership = await getCurrentMembership(workspaceId);
  if (!membership) throw new Error("You are not a member of this workspace");

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) throw new Error("Task not found");

  const permissions = getPermissions(membership.role as Role);
  const canEdit = permissions.canEditTask(task.createdById || "", userId);

  if (!canEdit) {
    throw new Error("You do not have permission to edit this task");
  }

  const newStatus = currentStatus === "TODO" ? "DONE" : "TODO";

  await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });

  // Log activity
  await logActivity({
    workspaceId,
    action: newStatus === "DONE" ? "COMPLETED_TASK" : "REOPENED_TASK",
    targetType: "TASK",
    targetId: taskId,
    targetName: task.title,
  });

  revalidatePath(`/dashboard/${workspaceId}`);
}

export async function updateTaskStatusAndOrder(taskId: string, newStatus: string, workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const membership = await getCurrentMembership(workspaceId);
  if (!membership) throw new Error("You are not a member of this workspace");

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) throw new Error("Task not found");

  const permissions = getPermissions(membership.role as Role);
  const canEdit = permissions.canEditTask(task.createdById || "", userId);

  if (!canEdit) {
    throw new Error("You do not have permission to edit this task");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });

  // Log activity
  await logActivity({
    workspaceId,
    action: newStatus === "DONE" ? "COMPLETED_TASK" : "UPDATED_TASK",
    targetType: "TASK",
    targetId: taskId,
    targetName: task.title,
    metadata: { newStatus },
  });

  revalidatePath(`/dashboard/${workspaceId}`);
}