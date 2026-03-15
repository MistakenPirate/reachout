"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth";
import Navbar from "@/components/Navbar";
import {
	MapPinIcon,
	UsersIcon,
	MapIcon,
	BotIcon,
	PackageIcon,
	ZapIcon,
	ShieldAlertIcon,
	HeartHandshakeIcon,
	LockIcon,
} from "lucide-react";

const features = [
	{
		title: "Request Help Instantly",
		description:
			"Pin your location on a map, describe your emergency, and get connected to the nearest available volunteer.",
		icon: ShieldAlertIcon,
		color: "bg-primary text-primary-foreground",
	},
	{
		title: "Volunteer Matching",
		description:
			"Volunteers are matched to requests based on skills, proximity, and availability using AI prioritization.",
		icon: UsersIcon,
		color: "bg-secondary text-secondary-foreground",
	},
	{
		title: "Live Disaster Map",
		description:
			"See disaster zones, help requests, volunteers, and resources on a real-time interactive map.",
		icon: MapIcon,
		color: "bg-accent text-accent-foreground",
	},
	{
		title: "AI Emergency Assistant",
		description:
			"Get immediate guidance on first aid, evacuation procedures, and safety tips through an AI chatbot.",
		icon: BotIcon,
		color: "bg-primary text-primary-foreground",
	},
	{
		title: "Resource Coordination",
		description:
			"Track and allocate food, water, medical supplies, and shelter kits across affected areas.",
		icon: PackageIcon,
		color: "bg-secondary text-secondary-foreground",
	},
	{
		title: "Real-time Updates",
		description:
			"WebSocket-powered live updates keep everyone in sync, from rescue status to volunteer assignments.",
		icon: ZapIcon,
		color: "bg-accent text-accent-foreground",
	},
];

const roles = [
	{
		title: "Victim",
		description:
			"Submit help requests, track rescue status, and chat with the AI assistant for emergency guidance.",
		icon: ShieldAlertIcon,
		badge: "Request Help",
		badgeColor: "bg-primary text-primary-foreground",
	},
	{
		title: "Volunteer",
		description:
			"Set your skills and availability, get assigned missions, and coordinate with victims on the ground.",
		icon: HeartHandshakeIcon,
		badge: "Save Lives",
		badgeColor: "bg-secondary text-secondary-foreground",
	},
	{
		title: "Admin",
		description:
			"Manage disaster zones, assign volunteers, allocate resources, and run AI-powered prioritization.",
		icon: LockIcon,
		badge: "Coordinate",
		badgeColor: "bg-accent text-accent-foreground",
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
			<section className="flex flex-col items-center justify-center gap-6 px-4 pt-24 pb-20 text-center">
				<Badge variant="outline" className="text-sm px-4 py-1 font-medium">
					Disaster Response Platform
				</Badge>
				<h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl max-w-3xl">
					Coordinate relief efforts when every second counts
				</h1>
				<p className="max-w-xl text-lg text-muted-foreground">
					ReachOut connects victims, volunteers, and administrators on a single
					platform with real-time maps, AI-powered prioritization, and instant
					coordination.
				</p>
				<div className="flex gap-3 mt-2">
					{!user && (
						<Link
							href="/register"
							className={cn(buttonVariants({ size: "lg" }), "text-base px-8")}
						>
							Get Started
						</Link>
					)}
					<Link
						href="/dashboard"
						className={cn(
							buttonVariants({
								variant: user ? "default" : "outline",
								size: "lg",
							}),
							"text-base px-8",
						)}
					>
						View Dashboard
					</Link>
				</div>
			</section>

			{/* Features */}
			<section className="container mx-auto max-w-5xl px-4 py-16">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-black mb-3">How it works</h2>
					<p className="text-muted-foreground max-w-lg mx-auto">
						Everything you need for effective disaster response coordination.
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
					{features.map((f) => (
						<Card
							key={f.title}
							className="transition-transform hover:-translate-y-1"
						>
							<CardContent className="pt-6 space-y-3">
								<div
									className={`inline-flex items-center justify-center size-12 ${f.color}`}
								>
									<f.icon className="size-6" />
								</div>
								<h3 className="font-bold text-lg">{f.title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{f.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Roles */}
			<section className="container mx-auto max-w-4xl px-4 py-16">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-black mb-3">Built for every role</h2>
					<p className="text-muted-foreground">
						Whether you need help or want to provide it.
					</p>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
					{roles.map((r) => (
						<Card
							key={r.title}
							className="text-center transition-transform hover:-translate-y-1"
						>
							<CardContent className="pt-6 space-y-4">
								<div
									className={`inline-flex items-center justify-center size-14 mx-auto ${r.badgeColor}`}
								>
									<r.icon className="size-7" />
								</div>
								<div>
									<h3 className="font-bold text-lg">{r.title}</h3>
									<Badge variant="outline" className="mt-1">
										{r.badge}
									</Badge>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{r.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* CTA */}
			<section className="container mx-auto max-w-2xl px-4 py-16">
				<Card className="bg-primary text-primary-foreground">
					<CardContent className="py-10 text-center space-y-4">
						<h2 className="text-2xl font-black">Ready to make a difference?</h2>
						<p className="opacity-90">
							Join ReachOut and help coordinate disaster relief in your area.
						</p>
						<div className="flex justify-center gap-3 pt-2">
							<Link
								href={user ? "/dashboard" : "/register"}
								className={cn(
									buttonVariants({ variant: "secondary", size: "lg" }),
									"text-base font-bold px-8",
								)}
							>
								{user ? "Go to Dashboard" : "Sign Up Now"}
							</Link>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Footer */}
			<footer className="border-t py-6 text-center text-sm text-muted-foreground">
				Built for HackVITA 4.0
			</footer>
		</div>
	);
}
