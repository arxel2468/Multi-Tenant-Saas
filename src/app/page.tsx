import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Users, CreditCard } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <header className="container mx-auto px-6 pt-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">YourSaaS</h1>
        <SignedOut>
          <SignInButton mode="modal">
            <Button>Sign in</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <main className="container mx-auto px-6 pt-32 pb-20 text-center">
        <Badge className="mb-6">Launching in public – Day 2/9</Badge>
        <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
          Ship Your SaaS<br />in Days, Not Months
        </h1>
        <p className="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Multi-tenant • Stripe Billing • Team Invites • Real-time • Production Ready
        </p>

        <div className="flex gap-6 justify-center flex-wrap">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="text-lg">
                Start free → <ArrowRight className="ml-2" />
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Button size="lg" asChild>
              <a href="/dashboard">Go to dashboard →</a>
            </Button>
          </SignedIn>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
          {[
            { icon: Zap, title: "Blazing Fast", desc: "Next.js 15 App Router + React Server Components" },
            { icon: Users, title: "Multi-tenant", desc: "Workspaces & team invites out of the box" },
            { icon: CreditCard, title: "Stripe Ready", desc: "Billing + paywalls in < 2 days" },
          ].map((f) => (
            <div key={f.title} className="p-8 rounded-2xl bg-gray-900/50 backdrop-blur border border-gray-800">
              <f.icon className="w-12 h-12 mb-4 text-cyan-400" />
              <h3 className="text-2xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}