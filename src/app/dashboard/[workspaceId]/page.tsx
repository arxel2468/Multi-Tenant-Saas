import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";
import { CreateTaskButton } from "@/components/create-task-button";
import { TaskCard } from "@/components/task-card";
import { AnalyticsChart } from "@/components/analytics-chart";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Clock } from "lucide-react";
import { isOverdue } from "@/lib/date-utils";

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
  const overdueTasks = workspace.tasks.filter(
    t => t.status !== "DONE" && isOverdue(t.dueDate)
  );
  const totalTasks = workspace.tasks.length;
  const completedTasks = workspace.tasks.filter(t => t.status === "DONE").length;

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
      {/* Overdue Alert Banner */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-red-800">
              {overdueTasks.length} task{overdueTasks.length > 1 ? 's' : ''} overdue
            </h3>
            <p className="text-red-600 text-sm">
              {overdueTasks.map(t => t.title).slice(0, 3).join(", ")}
              {overdueTasks.length > 3 ? ` and ${overdueTasks.length - 3} more...` : ""}
            </p>
          </div>
        </div>
      )}
      {/* Task Board */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* TODO COLUMN */}
        <div className="col-span-2 space-y-4">
        {workspace.tasks.map((task, index) => (
          // We add a tiny delay based on index so they cascade in beautifully
          <FadeIn key={task.id} delay={index * 0.05}>
            <TaskCard task={task} workspaceId={workspaceId} />
          </FadeIn>
        ))}
          
          {workspace.tasks.filter(t => t.status === "TODO").length === 0 && (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center bg-gray-50/50">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">All caught up!</h3>
              <p className="text-gray-500 text-sm mb-6">You have no pending tasks. Enjoy your day.</p>
              <CreateTaskButton workspaceId={workspace.id} members={workspace.members} />
            </div>
          )}
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

            <div className="p-6 bg-white rounded-xl border shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg mb-1">Productivity</h3>
        <p className="text-sm text-gray-500">Task completion rate</p>
      </div>
      
        {isPro ? (
          <div className="mt-4">
            <AnalyticsChart total={totalTasks} completed={completedTasks} />
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center bg-gray-50 rounded border border-dashed mt-4">
            <p className="text-gray-400 mb-2 text-sm">Analytics are locked.</p>
            <a href={`/dashboard/${workspaceId}/billing`} className="text-purple-600 hover:underline text-sm font-medium">
              Upgrade to PRO
            </a>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}