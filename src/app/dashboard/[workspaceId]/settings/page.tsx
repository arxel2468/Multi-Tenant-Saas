import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InviteForm } from "@/components/invite-form";
import { RoleSelector } from "@/components/role-selector";
import { RemoveMemberButton } from "@/components/remove-member-button";
import { getPermissions, getRoleLabel, getRoleBadgeColor, Role } from "@/lib/permissions";
import { Crown, Shield, User, Mail } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SettingsPage({ 
  params 
}: { 
  params: Promise<{ workspaceId: string }> 
}) {
  const { workspaceId } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        orderBy: { role: "asc" },
      },
      invitations: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!workspace) return <div>Workspace not found</div>;

  const currentMembership = workspace.members.find(m => m.userId === userId);
  if (!currentMembership) redirect("/dashboard");

  const permissions = getPermissions(currentMembership.role as Role);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER": return <Crown className="w-4 h-4" />;
      case "ADMIN": return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Team Settings</h1>
          <p className="text-slate-500 mt-1">Manage your team members and permissions.</p>
        </div>

        <div className="space-y-8">
          {/* Your Role Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Role</CardTitle>
              <CardDescription>Your current permissions in this workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentMembership.role === "OWNER" ? "bg-purple-100 text-purple-600" :
                  currentMembership.role === "ADMIN" ? "bg-blue-100 text-blue-600" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {getRoleIcon(currentMembership.role)}
                </div>
                <div>
                  <p className="font-semibold">{getRoleLabel(currentMembership.role as Role)}</p>
                  <p className="text-sm text-slate-500">
                    {currentMembership.role === "OWNER" && "Full control over workspace"}
                    {currentMembership.role === "ADMIN" && "Can manage tasks and invite members"}
                    {currentMembership.role === "MEMBER" && "Can create and manage own tasks"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invite Section */}
          {permissions.canInviteMembers && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Invite a Member
                </CardTitle>
                <CardDescription>Send an invitation link to add new team members</CardDescription>
              </CardHeader>
              <CardContent>
                <InviteForm workspaceId={workspace.id} />
              </CardContent>
            </Card>
          )}

          {/* Pending Invites */}
          {permissions.canInviteMembers && workspace.invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Invites ({workspace.invitations.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.invitations.map(inv => (
                  <div key={inv.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{inv.email}</p>
                      <p className="text-xs text-slate-400 font-mono truncate max-w-xs">
                        {process.env.NEXT_PUBLIC_APP_URL}/invite/{inv.token}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pending
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Member List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Members ({workspace.members.length})</CardTitle>
              <CardDescription>Manage roles and permissions for your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workspace.members.map(member => {
                const isCurrentUser = member.userId === userId;
                const canManage = permissions.canChangeRoles && 
                  !isCurrentUser && 
                  member.role !== "OWNER";
                const canRemove = permissions.canRemoveMembers && 
                  !isCurrentUser && 
                  member.role !== "OWNER";

                return (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                    <div className="flex items-center gap-3">
                      <Avatar className={`w-10 h-10 ${
                        member.role === "OWNER" ? "ring-2 ring-purple-500 ring-offset-2" : ""
                      }`}>
                        <AvatarFallback className={
                          member.role === "OWNER" ? "bg-purple-100 text-purple-700" :
                          member.role === "ADMIN" ? "bg-blue-100 text-blue-700" :
                          "bg-slate-100 text-slate-700"
                        }>
                          {(member.userEmail || member.userId)[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2">
                          {member.userEmail || member.userId}
                          {isCurrentUser && (
                            <span className="text-xs text-slate-400">(You)</span>
                          )}
                        </p>
                        <Badge variant="outline" className={`${getRoleBadgeColor(member.role as Role)} text-xs mt-1`}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1">{getRoleLabel(member.role as Role)}</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {canManage && (
                        <RoleSelector 
                          memberId={member.id}
                          currentRole={member.role}
                          workspaceId={workspaceId}
                        />
                      )}

                      {canRemove && (
                        <RemoveMemberButton
                          memberId={member.id}
                          workspaceId={workspaceId}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {permissions.canDeleteWorkspace && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for this workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">Delete Workspace</p>
                    <p className="text-sm text-red-600">All tasks, members, and data will be permanently deleted.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}