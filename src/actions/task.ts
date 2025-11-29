"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const { userId } = await auth(); // Next 15 await
  if (!userId) throw new Error("Unauthorized");

  const workspaceId = formData.get("workspaceId") as string;
  const title = formData.get("title") as string;
  const assigneeId = formData.get("assigneeId") as string; // This is the Membership ID

  await prisma.task.create({
    data: {
      workspaceId,
      title,
      assignedToId: assigneeId === "none" ? null : assigneeId,
      status: "TODO",
    },
  });

  revalidatePath(`/dashboard/${workspaceId}`);
}

export async function deleteTask(taskId: string, workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.task.delete({
    where: { id: taskId },
  });

  revalidatePath(`/dashboard/${workspaceId}`);
}

export async function toggleTaskStatus(taskId: string, currentStatus: string, workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const newStatus = currentStatus === "TODO" ? "DONE" : "TODO";

  await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });

  revalidatePath(`/dashboard/${workspaceId}`);
}