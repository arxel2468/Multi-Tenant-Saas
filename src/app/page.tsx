import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Layout, Users, ShieldCheck, Zap } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-purple-100">
      
      {/* 1. NAVBAR */}
      <nav className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
              <Zap size={20} fill="currentColor" />
            </div>
            YourSaaS
          </div>
          
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Log in</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button className="bg-purple-600 hover:bg-purple-700">Get Started</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="secondary">Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <Badge className="mb-6 bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-1 rounded-full text-sm border border-purple-200">
            v1.0 is now live
          </Badge>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
            Manage tasks, <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              without the chaos.
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The simplest project management tool for high-performing teams. 
            Create workspaces, invite your team, and ship faster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
             <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="h-14 px-8 text-lg bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-200">
                  Start for free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg">
                  Enter Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </SignedIn>
            <p className="text-sm text-slate-500 mt-4 sm:mt-0">
              No credit card required
            </p>
          </div>
        </div>
        
        {/* Abstract Background Blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-200/30 rounded-full blur-3xl -z-10" />
      </section>

      {/* 3. SOCIAL PROOF (Fake Companies) */}
      <section className="py-10 border-y bg-slate-50">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">
            Trusted by developers at
          </p>
          <div className="flex justify-center gap-12 opacity-50 grayscale mix-blend-multiply">
            {/* Simple text logos for minimalist look */}
            <span className="text-xl font-bold">ACME Corp</span>
            <span className="text-xl font-bold">Stark Ind</span>
            <span className="text-xl font-bold">Wayne Ent</span>
            <span className="text-xl font-bold">Cyberdyne</span>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 md:text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Everything you need to ship.</h2>
            <p className="text-lg text-slate-600">
              We stripped away the bloat. Focus on what matters: tasks, team, and shipping code.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Layout,
                title: "Multi-Workspace",
                desc: "Create separate workspaces for different clients or projects. Switch between them instantly."
              },
              {
                icon: Users,
                title: "Team Collaboration",
                desc: "Invite members via email. Assign tasks, track progress, and keep everyone in sync."
              },
              {
                icon: ShieldCheck,
                title: "Enterprise Security",
                desc: "Bank-level security with Clerk authentication and Role-Based Access Control (RBAC)."
              }
            ].map((feature, i) => (
              <Card key={i} className="border-none shadow-lg shadow-slate-100 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon size={24} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRICING */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400">Start for free, upgrade when you grow.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl border border-slate-700 bg-slate-800/50">
              <h3 className="text-2xl font-bold mb-2">Free Starter</h3>
              <div className="text-4xl font-bold mb-6">₹0<span className="text-lg font-normal text-slate-400">/mo</span></div>
              <ul className="space-y-4 mb-8 text-slate-300">
                <li className="flex gap-3"><CheckCircle2 className="text-purple-400" /> Up to 3 members</li>
                <li className="flex gap-3"><CheckCircle2 className="text-purple-400" /> 1 Workspace</li>
                <li className="flex gap-3"><CheckCircle2 className="text-purple-400" /> Basic Analytics</li>
              </ul>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button className="w-full bg-slate-700 hover:bg-slate-600">Get Started</Button>
                </SignInButton>
              </SignedOut>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl border border-purple-500 bg-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 uppercase">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro Team</h3>
              <div className="text-4xl font-bold mb-6">₹499<span className="text-lg font-normal text-slate-400">/mo</span></div>
              <ul className="space-y-4 mb-8 text-slate-300">
                <li className="flex gap-3"><CheckCircle2 className="text-purple-400" /> Unlimited Members</li>
                <li className="flex gap-3"><CheckCircle2 className="text-purple-400" /> Unlimited Workspaces</li>
                <li className="flex gap-3"><CheckCircle2 className="text-purple-400" /> Advanced Analytics</li>
              </ul>
              <SignedOut>
                 <SignInButton mode="modal">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Start Pro Trial</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                 <Link href="/dashboard">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Upgrade in Dashboard</Button>
                 </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-12 bg-white border-t text-center">
        <div className="container mx-auto px-6 text-slate-500">
          <p className="mb-4">&copy; 2025 YourSaaS Inc. Built with Next.js 15 & Tailwind.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-purple-600">Privacy Policy</a>
            <a href="#" className="hover:text-purple-600">Terms of Service</a>
            <a href="https://github.com/arxel2468" className="hover:text-purple-600">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}