import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"; // Updated import for Next 15
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createInvite } from "@/actions/invite";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function SettingsPage({ 
  params 
}: { 
  params: Promise<{ workspaceId: string }> 
}) {
  const { workspaceId } = await params;
  const { userId } = await auth(); // Await auth() in Next 15

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: true,
      invitations: true,
    },
  });

  if (!workspace) return <div>Workspace not found</div>;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Team Settings</h1>
      <p className="text-gray-500 mb-8">Manage your team members and invites.</p>

      <div className="grid gap-8">
        {/* Invite Section */}
        <Card>
          <CardHeader>
            <CardTitle>Invite a Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={async (formData) => {
              "use server";
              // We wrap this to handle the redirect/UI updates
              await createInvite(formData);
            }} className="flex gap-2">
              <input type="hidden" name="workspaceId" value={workspace.id} />
              <Input name="email" placeholder="colleague@example.com" required type="email" />
              <Button type="submit">Generate Invite Link</Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              * This will generate a Magic Link below. Copy and send it to them.
            </p>
          </CardContent>
        </Card>

        {/* Pending Invites */}
        {workspace.invitations.filter(i => i.status === "PENDING").length > 0 && (
           <Card>
            <CardHeader>
              <CardTitle>Pending Invites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workspace.invitations.filter(i => i.status === "PENDING").map(inv => (
                <div key={inv.id} className="flex justify-between items-center border p-3 rounded">
                  <div>
                    <p className="font-medium">{inv.email}</p>
                    <p className="text-xs text-gray-400">Link: {process.env.NEXT_PUBLIC_APP_URL}/invite/{inv.token}</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>Pending</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Member List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({workspace.members.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workspace.members.map(member => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{member.role[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.userId === userId ? "You" : member.userId}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}