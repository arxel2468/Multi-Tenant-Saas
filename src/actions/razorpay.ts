"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) throw new Error("Workspace not found");

  // Create an order
  const order = await razorpay.orders.create({
    amount: 49900, // ₹499.00 (in paisa)
    currency: "INR",
    receipt: `receipt_${workspaceId}`,
    notes: {
      workspaceId: workspaceId,
      userId: userId,
    },
  });

  return { orderId: order.id, amount: order.amount, currency: order.currency };
}