"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth";
import Navbar from "@/components/Navbar";

export default function HomePage() {
	const { user, hydrate } = useAuthStore();

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	return (
		<div className="font-body bg-[#fbf9f4] text-[#1b1c19] min-h-screen">
			<Navbar />

			<main>
				{/* Hero Section */}
				<section className="max-w-7xl mx-auto px-8 pt-24 pb-32">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
						<div className="lg:col-span-7">
							<h1 className="serif-display text-6xl md:text-7xl font-semibold leading-tight text-[#1b1c19] mb-8">
								Crisis care, <br />
								<span className="italic text-[#005245]">simplified.</span>
							</h1>
							<p className="text-xl md:text-2xl text-[#3f4946] font-light leading-relaxed max-w-2xl mb-12">
								The resilient toolkit for disaster management. Friendly support,
								real-time maps, and human connections when it matters most.
							</p>
							<div className="flex flex-wrap gap-4">
								<Link
									href={user ? "/victim" : "/register"}
									className="bg-[#005245] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#226b5c] transition-colors shadow-sm"
								>
									Get Help Now
								</Link>
								<Link
									href={user ? "/volunteer" : "/register"}
									className="bg-[#a7d3fe] text-[#2d5c80] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-opacity-80 transition-colors"
								>
									Join as Volunteer
								</Link>
							</div>
						</div>
						<div className="lg:col-span-5">
							<div className="relative aspect-square bg-[#f5f3ee] rounded-2xl overflow-hidden ghost-border p-4">
								<img
									alt="Hands holding a digital tablet showing a map"
									className="w-full h-full object-cover rounded-xl shadow-inner"
									src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_3yK5XipmgXikQ48wGSAQiBWs4hBLdJlcgqd25K1kzuuZ7Lcae-sEd2ubzB0PAyj8dOM24g_DWg9pPcG-1qCXCJhKdCfg-TXguvrgnm0QvthesP-2ZZuQcp0cRG0p_ceSI9lvxMd7KAFNySu0PwumrKcr9Ni4w6eDW6XvPvijzSG0LIgqL1w6wWwxCxcNKjC_asoiqeXlE4-yS6ZiOiudBgfZU0hDuwDSi4dDl0fN2ZZ2kImMnF2DN-54-yK59ZeTFrSbvr5Tuvw"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />
							</div>
						</div>
					</div>
				</section>

				{/* Features Bento Grid */}
				<section className="bg-[#f5f3ee] py-32">
					<div className="max-w-7xl mx-auto px-8">
						<div className="mb-16">
							<h2 className="serif-display text-4xl font-medium mb-4">
								Core Resilience Tools
							</h2>
							<p className="text-[#3f4946] text-lg">
								Integrated modules built for speed and reliability.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{/* Real-time Map */}
							<div className="md:col-span-2 bg-white p-8 rounded-xl ghost-border flex flex-col md:flex-row gap-8 items-center">
								<div className="flex-1">
									<div className="bg-[#005245]/10 text-[#005245] w-12 h-12 rounded-lg flex items-center justify-center mb-6">
										<span className="material-symbols-outlined">map</span>
									</div>
									<h3 className="serif-display text-2xl mb-4 font-semibold">
										Real-time Safety Maps
									</h3>
									<p className="text-[#3f4946] leading-relaxed mb-6">
										Navigate chaos with clarity. Our maps highlight active hazard
										zones, secure shelters, and live civilian updates to keep
										your team informed.
									</p>
									<Link
										href="/dashboard"
										className="text-[#005245] font-semibold flex items-center gap-2 group"
									>
										View Hazards{" "}
										<span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
											arrow_forward
										</span>
									</Link>
								</div>
								<div className="w-full md:w-72 h-64 bg-[#eae8e3] rounded-lg overflow-hidden relative">
									<img
										alt="Abstract digital map visual"
										className="w-full h-full object-cover grayscale opacity-80"
										src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYfUfyM1UuaQ7UpJbDyBPPsXxDUW8ueE1nmIFC7KoQtPyJe4xWa6Vf8MN9VR4fM3VOtYulULZsXmYfo6uneVNpf4GR-Dv9rAzgWNFAZwTkl2M4iBYtirfyQkOXEN9XfMLfS1rE2L92sYw3Wj9D2GM15OQEZr1qCgNX3w7yo2gyDOGU9geMI7vDJ-SVOLOeKEMBa2YKxF03rfNNYhQcmHFonT6mx5AYmdUkj02UjssqTGgsHNuwuHf5BPXAUGOjs2JTV1OIuXCUREA"
									/>
									<div className="absolute top-4 right-4 bg-[#ba1a1a] text-white px-3 py-1 text-xs rounded-full flex items-center gap-1">
										<span className="w-2 h-2 bg-white rounded-full" /> 3 Active
										Hazards
									</div>
								</div>
							</div>

							{/* Gen AI Support */}
							<div className="bg-white p-8 rounded-xl ghost-border">
								<div className="bg-[#356287]/10 text-[#356287] w-12 h-12 rounded-lg flex items-center justify-center mb-6">
									<span className="material-symbols-outlined">psychology</span>
								</div>
								<h3 className="serif-display text-2xl mb-4 font-semibold">
									24/7 AI Companion
								</h3>
								<p className="text-[#3f4946] leading-relaxed mb-8">
									Instant first-aid protocols and emotional grounding when
									experts are out of reach. Calibrated for high-stress empathy.
								</p>
								<div className="bg-[#f5f3ee] p-4 rounded-lg italic text-sm text-[#356287] flex gap-3">
									<span className="material-symbols-outlined">chat_bubble</span>
									&ldquo;How do I stabilize a leg fracture with limited
									supplies?&rdquo;
								</div>
							</div>

							{/* Volunteer Portal */}
							<div className="bg-white p-8 rounded-xl ghost-border">
								<div className="bg-[#71382b]/10 text-[#71382b] w-12 h-12 rounded-lg flex items-center justify-center mb-6">
									<span className="material-symbols-outlined">group</span>
								</div>
								<h3 className="serif-display text-2xl mb-4 font-semibold">
									Volunteer Sync
								</h3>
								<p className="text-[#3f4946] leading-relaxed">
									Coordination simplified. Assign tasks, track supply drops, and
									manage local hero teams with zero friction.
								</p>
							</div>

							{/* Rescue Comms */}
							<div className="md:col-span-2 bg-white p-8 rounded-xl ghost-border flex flex-col md:flex-row-reverse gap-8 items-center">
								<div className="flex-1">
									<div className="bg-[#1b1c19]/10 text-[#1b1c19] w-12 h-12 rounded-lg flex items-center justify-center mb-6">
										<span className="material-symbols-outlined">
											cell_tower
										</span>
									</div>
									<h3 className="serif-display text-2xl mb-4 font-semibold">
										Low-Bandwidth Comms
									</h3>
									<p className="text-[#3f4946] leading-relaxed">
										Built for the worst-case scenario. ReachOut works on 2G
										networks and supports offline mesh messaging to ensure no
										one is left in the dark.
									</p>
								</div>
								<div className="w-full md:w-64 h-48 bg-[#226b5c] rounded-lg flex items-center justify-center">
									<span className="material-symbols-outlined text-[#a2e9d6] text-6xl">
										signal_cellular_alt_1_bar
									</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Platform for Everyone */}
				<section className="max-w-7xl mx-auto px-8 py-32">
					<div className="text-center mb-20">
						<h2 className="serif-display text-5xl font-semibold mb-6">
							A Platform for Everyone
						</h2>
						<p className="text-[#3f4946] text-xl max-w-2xl mx-auto">
							Connecting the dots between those who need help and those who have
							the power to give it.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						<div className="bg-[#fbf9f4] p-8 rounded-xl transition-all hover:bg-[#eae8e3] text-center flex flex-col items-center">
							<div className="mb-6 text-[#005245]">
								<span className="material-symbols-outlined text-4xl">
									person_alert
								</span>
							</div>
							<h4 className="font-semibold text-lg mb-2">Victims</h4>
							<p className="text-[#3f4946] text-sm">
								Find shelter, request supplies, and signal for help.
							</p>
						</div>

						<div className="bg-[#fbf9f4] p-8 rounded-xl transition-all hover:bg-[#eae8e3] text-center flex flex-col items-center">
							<div className="mb-6 text-[#005245]">
								<span className="material-symbols-outlined text-4xl">
									volunteer_activism
								</span>
							</div>
							<h4 className="font-semibold text-lg mb-2">Local Heroes</h4>
							<p className="text-[#3f4946] text-sm">
								Join neighborhood teams and verify local reports.
							</p>
						</div>

						<div className="bg-[#fbf9f4] p-8 rounded-xl transition-all hover:bg-[#eae8e3] text-center flex flex-col items-center">
							<div className="mb-6 text-[#005245]">
								<span className="material-symbols-outlined text-4xl">
									account_balance
								</span>
							</div>
							<h4 className="font-semibold text-lg mb-2">City Officials</h4>
							<p className="text-[#3f4946] text-sm">
								Deploy resources and manage regional communications.
							</p>
						</div>

						<div className="bg-[#fbf9f4] p-8 rounded-xl transition-all hover:bg-[#eae8e3] text-center flex flex-col items-center">
							<div className="mb-6 text-[#005245]">
								<span className="material-symbols-outlined text-4xl">
									medical_services
								</span>
							</div>
							<h4 className="font-semibold text-lg mb-2">Rescue Teams</h4>
							<p className="text-[#3f4946] text-sm">
								Coordinate medical triage and extraction routes.
							</p>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="max-w-7xl mx-auto px-8 mb-32">
					<div className="bg-[#005245] text-white rounded-3xl p-16 text-center relative overflow-hidden">
						<div className="relative z-10">
							<h2 className="serif-display text-4xl md:text-5xl mb-8">
								Ready to build a more resilient community?
							</h2>
							<div className="flex flex-wrap justify-center gap-6">
								<Link
									href={user ? "/dashboard" : "/register"}
									className="bg-white text-[#005245] px-10 py-4 rounded-lg font-bold hover:bg-[#aaf0dd] transition-colors shadow-lg"
								>
									Get Help Now
								</Link>
								<Link
									href="/register"
									className="border-2 border-white/30 text-white px-10 py-4 rounded-lg font-bold hover:bg-white/10 transition-colors"
								>
									Partner With Us
								</Link>
							</div>
						</div>
						<div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="bg-[#f5f3ee]">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 py-16 max-w-7xl mx-auto">
					<div>
						<Link
							href="/"
							className="text-lg font-serif italic text-[#1b1c19] mb-6 block serif-display"
						>
							ReachOut
						</Link>
						<p className="text-sm text-[#3f4946] leading-relaxed max-w-xs">
							Empowering communities with high-tech resilience and human-first
							support during critical moments.
						</p>
					</div>
					<div>
						<h5 className="font-semibold text-[#005245] mb-6">Product</h5>
						<ul className="space-y-4">
							<li>
								<Link
									href="/dashboard"
									className="text-[#3f4946] hover:underline hover:text-[#005245] transition-all"
								>
									Real-time Map
								</Link>
							</li>
							<li>
								<Link
									href="/victim"
									className="text-[#3f4946] hover:underline hover:text-[#005245] transition-all"
								>
									AI Assistant
								</Link>
							</li>
							<li>
								<Link
									href="/volunteer"
									className="text-[#3f4946] hover:underline hover:text-[#005245] transition-all"
								>
									Sync Portal
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h5 className="font-semibold text-[#005245] mb-6">Resources</h5>
						<ul className="space-y-4">
							<li>
								<span className="text-[#3f4946] hover:underline hover:text-[#005245] transition-all cursor-pointer">
									Disaster Prep
								</span>
							</li>
							<li>
								<span className="text-[#3f4946] hover:underline hover:text-[#005245] transition-all cursor-pointer">
									Safety API
								</span>
							</li>
							<li>
								<span className="text-[#3f4946] hover:underline hover:text-[#005245] transition-all cursor-pointer">
									Community Blog
								</span>
							</li>
						</ul>
					</div>
					<div>
						<h5 className="font-semibold text-[#005245] mb-6">Support</h5>
						<ul className="space-y-4">
							<li>
								<span className="text-[#3f4946] hover:underline hover:text-[#005245] transition-all cursor-pointer">
									Help Center
								</span>
							</li>
							<li>
								<span className="text-[#3f4946] hover:underline hover:text-[#005245] transition-all cursor-pointer">
									Emergency Contacts
								</span>
							</li>
							<li>
								<span className="text-[#3f4946] hover:underline hover:text-[#005245] transition-all cursor-pointer">
									Contact Us
								</span>
							</li>
						</ul>
					</div>
				</div>
				<div className="max-w-7xl mx-auto px-8 py-8 border-t border-[#bec9c4]/10 text-center md:text-left">
					<p className="text-sm text-[#3f4946]">
						&copy; 2024 ReachOut. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
