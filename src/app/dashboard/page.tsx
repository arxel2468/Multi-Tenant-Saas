import { UserButton, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-4xl font-bold">Welcome back!</h1>
              <UserButton />
            </div>
            <div className="bg-white rounded-2xl p-12 text-center shadow-xl">
              <h2 className="text-3xl font-bold mb-4">Day 2 Complete</h2>
              <p className="text-xl text-gray-600 mb-8">
                Auth + beautiful marketing site is LIVE.<br />
                Tomorrow we add Workspaces (the multi-tenant magic).
              </p>
              <Button size="lg">Create your first workspace →</Button>
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}