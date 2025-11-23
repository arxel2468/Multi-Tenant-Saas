import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

// FIX: params is now a Promise in Next.js 15
export default async function WorkspaceDashboard({ 
  params 
}: { 
  params: Promise<{ workspaceId: string }> 
}) {
  // We must await params before using the variables inside
  const { workspaceId } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId }
  });

  if (!workspace) return notFound();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{workspace.name} Dashboard</h1>
      <p className="text-gray-500 mt-2">Workspace ID: {workspace.id}</p>
      
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-blue-800 font-bold mb-2">Next Steps (Day 4):</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>Create a "Settings" tab</li>
          <li>Add Stripe Subscription status</li>
          <li>List Team Members here</li>
        </ul>
      </div>
    </div>
  );
}