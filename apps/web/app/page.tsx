"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth";

export default function HomePage() {
  const { user, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Disaster Response Platform
      </h1>
      <p className="max-w-md text-muted-foreground">
        Real-time coordination between victims, volunteers, and relief organizations during emergencies.
      </p>
      <div className="flex gap-3">
        {!user && (
          <Link href="/register" className={cn(buttonVariants())}>
            Get Started
          </Link>
        )}
        <Link href="/dashboard" className={cn(buttonVariants({ variant: user ? "default" : "outline" }))}>
          View Dashboard
        </Link>
      </div>
    </div>
  );
}
