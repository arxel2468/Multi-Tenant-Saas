import { prisma } from "@/lib/prisma";
import { acceptInvite } from "@/actions/invite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function InvitePage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const { token } = await params;

  // Check if invite exists and is valid
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      workspace: {
        select: { name: true }
      }
    }
  });

  // Invalid or expired invite
  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Invalid Invite Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-500 mb-6">
              This invite link is invalid or has expired. Please ask for a new invitation.
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full">Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already accepted
  if (invitation.status === "ACCEPTED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Already Accepted</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-500 mb-6">
              This invite has already been accepted. You may already be a member of this workspace.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invite - show accept form
  const acceptInviteWithToken = acceptInvite.bind(null, token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>You&apos;ve been invited!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-500 mb-6">
            You&apos;ve been invited to join <strong>{invitation.workspace.name}</strong>.
          </p>
          <form action={acceptInviteWithToken}>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Accept & Join Team
            </Button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-4">
            You will need to sign in or create an account to join.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}