"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg">
            DisasterResponse
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            {user?.role === "victim" && (
              <Link href="/victim" className="text-muted-foreground hover:text-foreground transition-colors">
                Request Help
              </Link>
            )}
            {user?.role === "volunteer" && (
              <Link href="/volunteer" className="text-muted-foreground hover:text-foreground transition-colors">
                My Profile
              </Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Badge variant="secondary">{user.role}</Badge>
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Login
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
