"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";

type Role = "victim" | "volunteer" | "admin";

const roleHomePaths: Record<Role, string> = {
	victim: "/victim",
	volunteer: "/volunteer",
	admin: "/admin",
};

/**
 * Redirects to /login if not authenticated.
 * If `allowedRoles` is provided, redirects to the user's home page if their role isn't allowed.
 * Returns { user, isLoading } — render nothing while isLoading is true.
 */
export function useAuthGuard(allowedRoles?: Role[]) {
	const { user, hydrate } = useAuthStore();
	const router = useRouter();

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	useEffect(() => {
		// Wait for hydration — user will be null before hydrate runs
		const token = localStorage.getItem("token");

		if (!token) {
			router.replace("/login");
			return;
		}

		if (user && allowedRoles && !allowedRoles.includes(user.role as Role)) {
			router.replace(roleHomePaths[user.role as Role] ?? "/dashboard");
		}
	}, [user, allowedRoles, router]);

	const isAuthorized =
		user && (!allowedRoles || allowedRoles.includes(user.role as Role));

	return { user, isLoading: !user, isAuthorized };
}

/**
 * Returns the home path for a given role.
 */
export function getRoleHomePath(role: string): string {
	return roleHomePaths[role as Role] ?? "/dashboard";
}
