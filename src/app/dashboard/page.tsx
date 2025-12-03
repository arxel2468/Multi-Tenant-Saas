
import { UserButton } from "@clerk/nextjs";
import { getWorkspaces } from "@/actions/workspace";
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";

export default async function Dashboard() {
  const workspaces = await getWorkspaces();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Workspaces</h2>
          <CreateWorkspaceDialog />
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No workspaces yet</h3>
            <p className="text-gray-500 mb-6">Create your first workspace to get started.</p>
            <CreateWorkspaceDialog />
          </div>
        ) : (
          <div
           className="grid md:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <Link key={ws.id} href={`/dashboard/${ws.id}`}>
                <Card className="p-6 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-purple-600">
                  <h3 className="font-bold text-lg mb-2">{ws.name}</h3>
                  <p className="text-sm text-gray-500">Role: OWNER</p>
                  <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
                    Open Dashboard <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
