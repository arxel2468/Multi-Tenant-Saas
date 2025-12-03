"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-logger";

export async function createComment(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const taskId = formData.get("taskId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const content = formData.get("content") as string;

  if (!content || content.trim() === "") {
    throw new Error("Comment cannot be empty");
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { title: true },
  });

  const comment = await prisma.comment.create({
    data: {
      taskId,
      content: content.trim(),
      userId: user.id,
      userEmail: user.emailAddresses[0].emailAddress,
    },
  });

  // Log activity
  await logActivity({
    workspaceId,
    action: "CREATED_COMMENT",
    targetType: "COMMENT",
    targetId: comment.id,
    targetName: task?.title,
    metadata: { preview: content.substring(0, 50) },
  });

  revalidatePath(`/dashboard/${workspaceId}`);
}

export async function deleteComment(commentId: string, workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { task: { select: { title: true } } },
  });

  if (!comment) throw new Error("Comment not found");
  if (comment.userId !== userId) throw new Error("You can only delete your own comments");

  await prisma.comment.delete({
    where: { id: commentId },
  });

  // Log activity
  await logActivity({
    workspaceId,
    action: "DELETED_COMMENT",
    targetType: "COMMENT",
    targetId: commentId,
    targetName: comment.task?.title,
  });

  revalidatePath(`/dashboard/${workspaceId}`);
}

export async function getTaskWithComments(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: true,
      comments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return task;
}