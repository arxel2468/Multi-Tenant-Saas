import { acceptInvite } from "@/actions/invite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InvitePage({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const { token } = await params;

  // We create a bind to pass the token to the server action
  const acceptInviteWithToken = acceptInvite.bind(null, token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle>You've been invited!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 mb-6">
            Someone invited you to join their workspace.
          </p>
          <form action={acceptInviteWithToken}>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Accept & Join Team
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}