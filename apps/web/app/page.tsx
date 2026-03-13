"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth";
import Navbar from "@/components/Navbar";

const features = [
  {
    title: "Request Help Instantly",
    description: "Pin your location on a map, describe your emergency, and get connected to the nearest available volunteer.",
    icon: "🆘",
  },
  {
    title: "Volunteer Matching",
    description: "Volunteers are matched to requests based on skills, proximity, and availability using AI prioritization.",
    icon: "🤝",
  },
  {
    title: "Live Disaster Map",
    description: "See disaster zones, help requests, volunteers, and resources on a real-time interactive map.",
    icon: "🗺️",
  },
  {
    title: "AI Emergency Assistant",
    description: "Get immediate guidance on first aid, evacuation procedures, and safety tips through an AI chatbot.",
    icon: "🤖",
  },
  {
    title: "Resource Coordination",
    description: "Track and allocate food, water, medical supplies, and shelter kits across affected areas.",
    icon: "📦",
  },
  {
    title: "Real-time Updates",
    description: "WebSocket-powered live updates keep everyone in sync — from rescue status to volunteer assignments.",
    icon: "⚡",
  },
];

const roles = [
  {
    title: "Victim",
    description: "Submit help requests, track rescue status, and chat with the AI assistant for emergency guidance.",
  },
  {
    title: "Volunteer",
    description: "Set your skills and availability, get assigned missions, and coordinate with victims on the ground.",
  },
  {
    title: "Admin",
    description: "Manage disaster zones, assign volunteers, allocate resources, and run AI-powered prioritization.",
  },
];

export default function HomePage() {
  const { user, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 pt-24 pb-16 text-center">
        <p className="text-sm font-medium text-primary tracking-wide uppercase">Disaster Response Platform</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl max-w-3xl">
          Coordinate relief efforts when every second counts
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          ReachOut connects victims, volunteers, and administrators on a single platform with real-time maps, AI-powered prioritization, and instant coordination.
        </p>
        <div className="flex gap-3 mt-2">
          {!user && (
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Get Started
            </Link>
          )}
          <Link href="/dashboard" className={cn(buttonVariants({ variant: user ? "default" : "outline", size: "lg" }))}>
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-2">How it works</h2>
        <p className="text-center text-muted-foreground mb-10">Everything you need for effective disaster response coordination.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="border-border/50">
              <CardContent className="pt-6">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-semibold mt-3 mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-2">Built for every role</h2>
        <p className="text-center text-muted-foreground mb-10">Whether you need help or want to provide it.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div key={r.title} className="rounded-lg border p-5 text-center space-y-2">
              <h3 className="font-semibold">{r.title}</h3>
              <p className="text-sm text-muted-foreground">{r.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Built for HackVITA 4.0
      </footer>
    </div>
  );
}
