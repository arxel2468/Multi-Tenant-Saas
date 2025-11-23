"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export async function createCheckoutSession(workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Get the workspace
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) throw new Error("Workspace not found");

  // 2. Create a Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        // This is a "One-time" setup for testing. Later we use real Product IDs.
        price_data: {
          currency: "inr",
          product_data: {
            name: "Pro Plan - " + workspace.name,
            description: "Unlock unlimited members and analytics",
          },
          unit_amount: 49900, // 499 rupees
        },
        quantity: 1,
      },
    ],
    mode: "payment", // Or "subscription" if you want recurring
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${workspace.id}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${workspace.id}?canceled=true`,
    metadata: {
      workspaceId: workspace.id,
      userId: userId,
    },
  });

  // 3. Redirect user to the Stripe hosted page
  if (session.url) {
    redirect(session.url);
  }
}