import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock, PartyPopper } from "lucide-react";
import { CreateTaskButton } from "@/components/create-task-button";
import { TaskList } from "@/components/task-list";
import { AnalyticsChart } from "@/components/analytics-chart";
import { ActivityFeed } from "@/components/activity-feed";
import { ExportButton } from "@/components/export-button";
import { isOverdue } from "@/lib/date-utils";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { getPermissions, Role } from "@/lib/permissions";

export default async function WorkspaceDashboard({ 
  params,
  searchParams 
}: { 
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { workspaceId } = await params;
  const { success } = await searchParams;
  const { userId } = await auth();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: true,
      tasks: {
        orderBy: { createdAt: "desc" },
        include: { 
          assignee: true,
          _count: { select: { comments: true } }
        }
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    }
  });

  if (!workspace) return notFound();

  const currentMembership = workspace.members.find(m => m.userId === userId);
  const userRole = (currentMembership?.role || "MEMBER") as Role;
  const permissions = getPermissions(userRole);

  const isPro = workspace.plan === "PRO" || success === "true";
  
  const totalTasks = workspace.tasks.length;
  const completedTasks = workspace.tasks.filter(t => t.status === "DONE").length;
  const overdueTasks = workspace.tasks.filter(
    t => t.status !== "DONE" && isOverdue(t.dueDate)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {workspace.name}
                {isPro && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full border border-purple-200">
                    PRO
                  </span>
                )}
              </h1>
              <p className="text-slate-500 mt-1">
                {totalTasks} tasks • {workspace.members.length} members
              </p>
            </div>
            
            <div className="flex gap-3 flex-wrap">
              <CreateTaskButton workspaceId={workspace.id} members={workspace.members} />
              {permissions.canInviteMembers && (
                <ExportButton workspaceId={workspace.id} />
              )}
              <a href={`/dashboard/${workspaceId}/settings`}>
                <Button variant="outline">Settings</Button>
              </a>
              {permissions.canAccessBilling && (
                <a href={`/dashboard/${workspaceId}/billing`}>
                  <Button variant="outline">Billing</Button>
                </a>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Success Banner */}
        {success && (
          <FadeIn delay={0.1}>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <PartyPopper className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-800">Upgrade Successful!</h3>
                <p className="text-green-600 text-sm">Your workspace is now on the PRO plan.</p>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Overdue Alert */}
        {overdueTasks.length > 0 && (
          <FadeIn delay={0.15}>
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
          </FadeIn>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Tasks Section (3 columns) */}
          <div className="lg:col-span-3">
            <FadeIn delay={0.2}>
              <TaskList 
                tasks={workspace.tasks} 
                members={workspace.members} 
                workspaceId={workspaceId}
                currentUserId={userId || ""}
                userRole={userRole}
              />
            </FadeIn>
          </div>

          {/* Sidebar (1 column) */}
          <div className="space-y-6">
            {/* Analytics Card */}
            <FadeIn delay={0.25}>
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="font-bold text-lg mb-1">Productivity</h3>
                <p className="text-sm text-slate-500 mb-4">Task completion rate</p>
                
                {isPro ? (
                  <AnalyticsChart total={totalTasks} completed={completedTasks} />
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed">
                    <p className="text-slate-400 mb-2 text-sm">Analytics locked</p>
                    <a href={`/dashboard/${workspaceId}/billing`} className="text-purple-600 hover:underline text-sm font-medium">
                      Upgrade to PRO
                    </a>
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Quick Stats */}
            <FadeIn delay={0.3}>
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Tasks</span>
                    <span className="font-bold">{totalTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Completed</span>
                    <span className="font-bold text-green-600">{completedTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Pending</span>
                    <span className="font-bold text-yellow-600">{totalTasks - completedTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Overdue</span>
                    <span className="font-bold text-red-600">{overdueTasks.length}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Team Members</span>
                    <span className="font-bold">{workspace.members.length}</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Activity Feed */}
            <FadeIn delay={0.35}>
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                <ActivityFeed logs={workspace.activityLogs} />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}