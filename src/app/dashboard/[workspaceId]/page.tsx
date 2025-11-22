import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function WorkspaceDashboard({ params }: { params: { workspaceId: string } }) {

  const workspace = await prisma.workspace.findUnique({
    where: { id: params.workspaceId }
  });

  if (!workspace) return notFound();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{workspace.name} Dashboard</h1>
      <p className="text-gray-500 mt-2">Workspace ID: {workspace.id}</p>
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-blue-800">
          <strong>Coming on Day 4:</strong> Stripe Subscription Status & Team Members list here.
        </p>
      </div>
    </div>
  );
}
