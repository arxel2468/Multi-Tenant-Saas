"use client"; // <--- Must be client component for Razorpay

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { createRazorpayOrder } from "@/actions/razorpay";
import { useUser } from "@clerk/nextjs"; // We need user email for pre-fill
import { useState, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { verifyPaymentAndUpgrade } from "@/actions/payment";


// Define the Razorpay window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage({ 
  params 
}: { 
  params: { workspaceId: string } 
}) {
  // Unwrap params in client component (React.use() or just access if available)
  // Since this is "use client" in Next 15, params might need standard handling
  // For simplicity in this specific file, we'll assume passed prop or use a wrapper.
  // *Fixing params for Client Component in Next 15:*
  const [workspaceId, setWorkspaceId] = useState<string>("");
  
  useEffect(() => {
    // Quick fix to unwrap promise-based params if needed, 
    // or just access them if passed from parent server component
    // Let's treat params as an object for now.
    Promise.resolve(params).then((p) => setWorkspaceId(p.workspaceId));
  }, [params]);


  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!workspaceId) return;
    setLoading(true);
    
    try {
      // 1. Create Order on Server
      const { orderId, amount, currency } = await createRazorpayOrder(workspaceId);

      // 2. Options for Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // We need to expose this public key
        amount: amount,
        currency: currency,
        name: "YourSaaS Pro",
        description: "Upgrade to Pro Plan",
        order_id: orderId,
        handler: async function (response: any) {
          // CALL SERVER TO SAVE TO DB
          await verifyPaymentAndUpgrade(
            workspaceId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          
          router.push(`/dashboard/${workspaceId}?success=true`);
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#9333ea", // Purple-600
        },
      };

      // 3. Open Modal
      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      console.error("Payment failed", error);
      alert("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

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
              <div className="text-3xl font-bold mb-4">₹0<span className="text-lg text-gray-500 font-normal">/mo</span></div>
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
              <div className="text-3xl font-bold mb-4">₹499<span className="text-lg text-gray-500 font-normal">/mo</span></div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500" /> Unlimited Members</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500" /> Advanced Analytics</li>
              </ul>
              
              <Button 
                onClick={handleUpgrade} 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Upgrade to Pro"}
              </Button>

            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}