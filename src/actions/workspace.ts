"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createWorkspace(formData: FormData) {
  const { userId } = await auth();

  // Debugging: Check if ID exists in your terminal
  console.log("Attempting to create workspace. User ID:", userId);

  if (!userId) {
    // This ensures we know exactly why it failed
    throw new Error("You must be signed in to create a workspace.");
  }

  const name = formData.get("name") as string;

  if (!name) {
      throw new Error("Workspace name is required");
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);

  let workspace;

  try {
      workspace = await prisma.workspace.create({
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
  } catch (error) {
      console.error("Database Error:", error);
      throw new Error("Failed to create workspace in database");
  }

  // Refresh the dashboard so the new workspace appears in the list
  revalidatePath("/dashboard");

  // Redirect to the new workspace
  redirect(`/dashboard/${workspace.id}`);
}

export async function getWorkspaces() {
  const { userId } = await auth();
  
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
