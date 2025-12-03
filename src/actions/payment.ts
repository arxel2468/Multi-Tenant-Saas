"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { logActivity } from "@/lib/activity-logger";

export async function verifyPaymentAndUpgrade(
  workspaceId: string, 
  razorpay_order_id: string, 
  razorpay_payment_id: string, 
  razorpay_signature: string
) {
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    throw new Error("Invalid Payment Signature");
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      plan: "PRO",
      subscriptionId: razorpay_payment_id,
    },
  });

  // Log activity
  await logActivity({
    workspaceId,
    action: "UPGRADED_PLAN",
    targetType: "WORKSPACE",
    targetId: workspaceId,
    metadata: { paymentId: razorpay_payment_id },
  });

  revalidatePath(`/dashboard/${workspaceId}`);
  
  return { success: true };
}