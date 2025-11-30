"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function verifyPaymentAndUpgrade(
  workspaceId: string, 
  razorpay_order_id: string, 
  razorpay_payment_id: string, 
  razorpay_signature: string
) {
  
  // 1. Verify the Signature (Security Check)
  // This ensures the user didn't just fake the success ID.
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    throw new Error("Invalid Payment Signature");
  }

  // 2. Update Database
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      plan: "PRO",
      subscriptionId: razorpay_payment_id, // Save the transaction ID
    },
  });

  // 3. Refresh Data
  revalidatePath(`/dashboard/${workspaceId}`);
  
  return { success: true };
}