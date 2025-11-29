import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";
import { CreateTaskButton } from "@/components/create-task-button";
import { TaskCard } from "@/components/task-card";

export default async function WorkspaceDashboard({ 
  params,
  searchParams 
}: { 
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { workspaceId } = await params;
  const { success } = await searchParams;

  // Fetch Workspace + Members + Tasks
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: true,
      tasks: {
        orderBy: { createdAt: "desc" }, // Newest first
        include: { assignee: true }     // Get assignee details
      }
    }
  });

  if (!workspace) return notFound();

  const isPro = workspace.plan === "PRO" || success === "true";

  return (
    <div className="p-8">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {workspace.name} 
            {isPro && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full border border-purple-200">PRO</span>}
          </h1>
          <p className="text-gray-500 mt-1">Track your team projects here.</p>
        </div>
        
        <div className="flex gap-3">
           {/* We pass the members to the button so we can assign them */}
           <CreateTaskButton workspaceId={workspace.id} members={workspace.members} />
           
           <a href={`/dashboard/${workspaceId}/settings`}>
            <Button variant="secondary">Settings</Button>
          </a>
        </div>
      </div>

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

      {/* Task Board */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* TODO COLUMN */}
        <div className="col-span-2 space-y-4">
          <h2 className="font-bold text-gray-500 text-sm uppercase tracking-wider">
             Tasks ({workspace.tasks.filter(t => t.status === "TODO").length})
          </h2>
          
          {workspace.tasks.filter(t => t.status === "TODO").length === 0 && (
            <div className="border-2 border-dashed rounded-xl p-8 text-center text-gray-400">
              No pending tasks. Good job!
            </div>
          )}

          {workspace.tasks.filter(t => t.status === "TODO").map(task => (
             <TaskCard key={task.id} task={task} workspaceId={workspaceId} />
          ))}
        </div>

        {/* COMPLETED COLUMN */}
        <div className="space-y-4 opacity-70">
          <h2 className="font-bold text-gray-500 text-sm uppercase tracking-wider">
             Completed ({workspace.tasks.filter(t => t.status === "DONE").length})
          </h2>
          
          {workspace.tasks.filter(t => t.status === "DONE").map(task => (
             <TaskCard key={task.id} task={task} workspaceId={workspaceId} />
          ))}
        </div>
      </div>
    </div>
  );
}