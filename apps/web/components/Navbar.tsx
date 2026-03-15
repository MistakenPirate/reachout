"use client";

import Link from "next/link";
import { useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function NavLink({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const isActive = pathname === href || pathname.startsWith(href + "/");

	return (
		<Link
			href={href}
			className={cn(
				"text-sm transition-colors",
				isActive
					? "text-foreground font-medium"
					: "text-muted-foreground hover:text-foreground",
			)}
		>
			{children}
		</Link>
	);
}

const roleBadgeColors: Record<string, string> = {
	admin:
		"bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-400 dark:ring-red-800",
	volunteer:
		"bg-green-50 text-green-700 ring-green-200 dark:bg-green-950 dark:text-green-400 dark:ring-green-800",
	victim:
		"bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-800",
};

export default function Navbar() {
	const { user, logout, hydrate } = useAuthStore();
	const router = useRouter();

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	const handleLogout = useCallback(() => {
		logout();
		router.push("/login");
	}, [logout, router]);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center justify-between mx-auto px-4">
				<div className="flex items-center gap-6">
					<Link href="/" className="font-semibold text-lg tracking-tight">
						ReachOut
					</Link>
					<nav className="flex items-center gap-4">
						<NavLink href="/dashboard">Dashboard</NavLink>
						{user?.role === "victim" && (
							<NavLink href="/victim">Request Help</NavLink>
						)}
						{user?.role === "volunteer" && (
							<NavLink href="/volunteer">My Profile</NavLink>
						)}
						{user?.role === "admin" && (
							<NavLink href="/admin">Admin Panel</NavLink>
						)}
					</nav>
				</div>
				<div className="flex items-center gap-3">
					{user ? (
						<>
							<span
								className={cn(
									"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
									roleBadgeColors[user.role] ??
										"bg-muted text-muted-foreground ring-border",
								)}
							>
								{user.role}
							</span>
							<span className="text-sm text-muted-foreground">{user.name}</span>
							<Button variant="ghost" size="sm" onClick={handleLogout}>
								Logout
							</Button>
						</>
					) : (
						<div className="flex items-center gap-2">
							<Link
								href="/login"
								className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
							>
								Login
							</Link>
							<Link
								href="/register"
								className={cn(buttonVariants({ size: "sm" }))}
							>
								Register
							</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
