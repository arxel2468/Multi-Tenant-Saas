import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { createCheckoutSession } from "@/actions/stripe";

// FIX: Async params for Next.js 15
export default async function BillingPage({ 
  params 
}: { 
  params: Promise<{ workspaceId: string }> 
}) {
  const { workspaceId } = await params;

  // We create a "Bind" so we can pass the workspaceId to the server action
  const handleUpgrade = createCheckoutSession.bind(null, workspaceId);

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Plans & Billing</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For hobby projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">0 INR<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> 3 Members</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Basic Analytics</li>
            </ul>
            <Button variant="outline" disabled className="w-full">Current Plan</Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="border-purple-500 border-2 relative overflow-hidden">
           <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-3 py-1">RECOMMENDED</div>
          <CardHeader>
            <CardTitle>Pro Workspace</CardTitle>
            <CardDescription>For growing teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">499 INR<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500" /> Unlimited Members</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500" /> Advanced Analytics</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500" /> Priority Support</li>
            </ul>
            
            {/* THE MAGIC BUTTON */}
            <form action={handleUpgrade}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Upgrade to Pro</Button>
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}