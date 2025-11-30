"use client";

import { Button } from "@/components/ui/button";
import { Zap, Menu } from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function LandingNav() {
  const { isSignedIn } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
            <Zap size={20} fill="currentColor" />
          </div>
          YourSaaS
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost">Log in</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button className="bg-purple-600 hover:bg-purple-700">Get Started</Button>
              </SignInButton>
            </>
          ) : (
            <Link href="/dashboard">
              <Button variant="secondary">Go to Dashboard</Button>
            </Link>
          )}
        </div>

        {/* Mobile Nav (Hamburger) */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
               <div className="flex flex-col gap-6 mt-10">
                  <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                      <Zap size={20} fill="currentColor" />
                    </div>
                    YourSaaS
                  </div>
                  <hr />
                  <div className="flex flex-col gap-4">
                    <a href="#" className="text-lg font-medium hover:text-purple-600">Features</a>
                    <a href="#" className="text-lg font-medium hover:text-purple-600">Pricing</a>
                    <a href="#" className="text-lg font-medium hover:text-purple-600">About</a>
                  </div>
                  <div className="mt-auto">
                    {!isSignedIn ? (
                      <div className="flex flex-col gap-3">
                        <SignInButton mode="modal">
                          <Button className="w-full" variant="outline">Log in</Button>
                        </SignInButton>
                        <SignInButton mode="modal">
                          <Button className="w-full bg-purple-600">Get Started</Button>
                        </SignInButton>
                      </div>
                    ) : (
                      <Link href="/dashboard">
                        <Button className="w-full">Go to Dashboard</Button>
                      </Link>
                    )}
                  </div>
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}