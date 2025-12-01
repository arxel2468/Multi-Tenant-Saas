"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createComment(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const taskId = formData.get("taskId") as string;
  const workspaceId = formData.get("workspaceId") as string;
  const content = formData.get("content") as string;

  if (!content || content.trim() === "") {
    throw new Error("Comment cannot be empty");
  }

  await prisma.comment.create({
    data: {
      taskId,
      content: content.trim(),
      userId: user.id,
      userEmail: user.emailAddresses[0].emailAddress,
    },
  });

  revalidatePath(`/dashboard/${workspaceId}`);
}

export async function deleteComment(commentId: string, workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Only allow deletion if user owns the comment
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) throw new Error("Comment not found");
  if (comment.userId !== userId) throw new Error("You can only delete your own comments");

  await prisma.comment.delete({
    where: { id: commentId },
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