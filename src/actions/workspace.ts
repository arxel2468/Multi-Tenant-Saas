"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createWorkspace(formData: FormData) {
  const user = await currentUser(); // <--- GET FULL USER DATA
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);
  const userEmail = user.emailAddresses[0].emailAddress;

  if (!name) {
      throw new Error("Workspace name is required");
  }


  let workspace;

  try {
      workspace = await prisma.workspace.create({
        data: {
          name,
          slug,
          members: {
            create: {
              userId: user.id,
              userEmail: userEmail,
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
