"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Crown } from "lucide-react";
import { createRazorpayOrder } from "@/actions/razorpay";
import { verifyPaymentAndUpgrade } from "@/actions/payment";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BillingClientProps {
  workspaceId: string;
  currentPlan: string;
  workspaceName: string;
}

export function BillingClient({ workspaceId, currentPlan, workspaceName }: BillingClientProps) {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isPro = currentPlan === "PRO";

  const handleUpgrade = async () => {
    if (isPro) return;
    
    setLoading(true);
    
    try {
      const { orderId, amount, currency } = await createRazorpayOrder(workspaceId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "YourSaaS Pro",
        description: `Pro Plan for ${workspaceName}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            await verifyPaymentAndUpgrade(
              workspaceId,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            toast.success("Upgrade successful!");
            router.push(`/dashboard/${workspaceId}?success=true`);
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#9333ea",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      console.error("Payment failed", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="min-h-screen bg-slate-50/50">
        <div className="p-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Plans & Billing</h1>
            <p className="text-slate-500 mt-1">Manage your subscription and billing details.</p>
          </div>

          {/* Current Plan Status */}
          {isPro && (
            <Card className="mb-8 border-purple-200 bg-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-800">You are on the Pro Plan</h3>
                    <p className="text-purple-600 text-sm">Enjoy unlimited features and priority support.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className={!isPro ? "border-2 border-slate-300" : ""}>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For small teams getting started</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">
                  ₹0<span className="text-lg text-slate-500 font-normal">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex gap-3"><Check className="w-5 h-5 text-green-500 flex-shrink-0" /> Up to 3 team members</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 text-green-500 flex-shrink-0" /> Basic task management</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 text-green-500 flex-shrink-0" /> Activity logs</li>
                </ul>
                <Button variant="outline" disabled className="w-full">
                  {isPro ? "Previous Plan" : "Current Plan"}
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className={`relative overflow-hidden ${isPro ? "border-2 border-purple-500" : ""}`}>
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1">
                {isPro ? "CURRENT" : "RECOMMENDED"}
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For growing teams that need more</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">
                  ₹499<span className="text-lg text-slate-500 font-normal">/mo</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex gap-3"><Check className="w-5 h-5 text-purple-500 flex-shrink-0" /> Unlimited team members</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 text-purple-500 flex-shrink-0" /> Advanced analytics</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 text-purple-500 flex-shrink-0" /> Priority support</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 text-purple-500 flex-shrink-0" /> Export reports</li>
                  <li className="flex gap-3"><Check className="w-5 h-5 text-purple-500 flex-shrink-0" /> Role-based permissions</li>
                </ul>
                
                <Button 
                  onClick={handleUpgrade} 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={loading || isPro}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isPro ? (
                    "Current Plan"
                  ) : (
                    "Upgrade to Pro"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}