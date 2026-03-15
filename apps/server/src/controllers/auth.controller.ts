import type { RequestHandler } from "express";
import { registerSchema, loginSchema } from "@repo/shared/schemas";
import * as authService from "../services/auth.service.js";
import { ServiceError } from "../services/auth.service.js";

export const register: RequestHandler = async (req, res) => {
	const parsed = registerSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten().fieldErrors });
		return;
	}

	try {
		const result = await authService.register(parsed.data);
		res.status(201).json(result);
	} catch (err) {
		if (err instanceof ServiceError) {
			res.status(err.status).json({ error: err.message });
			return;
		}
		throw err;
	}
};

export const login: RequestHandler = async (req, res) => {
	const parsed = loginSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten().fieldErrors });
		return;
	}

	try {
		const result = await authService.login(parsed.data);
		res.json(result);
	} catch (err) {
		if (err instanceof ServiceError) {
			res.status(err.status).json({ error: err.message });
			return;
		}
		throw err;
	}
};

export const me: RequestHandler = async (req, res) => {
	if (!req.user) {
		res.status(401).json({ error: "Not authenticated" });
		return;
	}

	try {
		const user = await authService.getProfile(req.user.userId);
		res.json({ user });
	} catch (err) {
		if (err instanceof ServiceError) {
			res.status(err.status).json({ error: err.message });
			return;
		}
		throw err;
	}
};
