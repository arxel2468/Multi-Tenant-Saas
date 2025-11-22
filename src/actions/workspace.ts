"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createWorkspace(formData: FormData) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  // Simple slug generator: "My Team" -> "my-team"
  const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);

  // Transaction: Create Workspace AND make the creator the OWNER instantly
  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  redirect(`/dashboard/${workspace.id}`);
}

export async function getWorkspaces() {
  const { userId } = auth();
  if (!userId) return [];

  return await prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
