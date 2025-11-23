import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react"; // Add this icon

export default async function WorkspaceDashboard({ 
  params,
  searchParams 
}: { 
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ success?: string }>; // Add searchParams
}) {
  const { workspaceId } = await params;
  const { success } = await searchParams;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId }
  });

  if (!workspace) return notFound();

  // SIMULATION: If success=true, we assume they paid (for portfolio demo)
  // In real life, webhooks handle this.
  const isPro = workspace.plan === "PRO" || success === "true";

  return (
    <div className="p-8">
      {/* Success Banner */}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded flex items-center">
          <PartyPopper className="w-6 h-6 mr-3" />
          <div>
            <p className="font-bold">Upgrade Successful!</p>
            <p>Your workspace is now on the PRO plan.</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {workspace.name} 
            {isPro && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full border border-purple-200">PRO</span>}
          </h1>
          <p className="text-gray-500 mt-1">Workspace ID: {workspace.id}</p>
        </div>
        <a href={`/dashboard/${workspaceId}/billing`}>
          <Button variant="outline">Manage Billing</Button>
        </a>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
         <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h3 className="font-bold text-lg mb-4">Team Members</h3>
            <p className="text-gray-500">You are the only member.</p>
         </div>
         <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h3 className="font-bold text-lg mb-4">Analytics</h3>
            {isPro ? (
              <div className="h-32 flex items-center justify-center bg-gray-50 rounded border border-dashed">
                <span className="text-gray-400">Premium Analytics Graph Placeholder</span>
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center bg-gray-50 rounded border border-dashed">
                <p className="text-gray-400 mb-2">Analytics are locked.</p>
                <a href={`/dashboard/${workspaceId}/billing`} className="text-blue-600 hover:underline text-sm">Upgrade to see data</a>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}