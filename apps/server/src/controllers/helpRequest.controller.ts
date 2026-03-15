import type { RequestHandler } from "express";
import { createHelpRequestSchema } from "@repo/shared/schemas";
import * as helpRequestService from "../services/helpRequest.service.js";
import { ServiceError } from "../services/auth.service.js";
import { broadcast } from "../ws.js";

export const create: RequestHandler = async (req, res) => {
	if (!req.user) {
		res.status(401).json({ error: "Not authenticated" });
		return;
	}

	const parsed = createHelpRequestSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten().fieldErrors });
		return;
	}

	try {
		const request = await helpRequestService.createHelpRequest(
			req.user.userId,
			parsed.data,
		);
		broadcast({ type: "new_request", payload: request });
		res.status(201).json(request);
	} catch (err) {
		if (err instanceof ServiceError) {
			res.status(err.status).json({ error: err.message });
			return;
		}
		throw err;
	}
};

export const getMyRequests: RequestHandler = async (req, res) => {
	if (!req.user) {
		res.status(401).json({ error: "Not authenticated" });
		return;
	}

	const page = Math.max(0, parseInt(req.query.page as string) || 0);
	const limit = Math.min(
		50,
		Math.max(1, parseInt(req.query.limit as string) || 5),
	);
	const result = await helpRequestService.getUserRequestsPaginated(
		req.user.userId,
		page,
		limit,
	);
	res.json(result);
};

export const resolve: RequestHandler = async (req, res) => {
	if (!req.user) {
		res.status(401).json({ error: "Not authenticated" });
		return;
	}

	try {
		const id = req.params.id as string;
		const updated = await helpRequestService.resolveRequest(
			id,
			req.user.userId,
		);
		broadcast({ type: "request_updated", payload: updated });
		res.json(updated);
	} catch (err) {
		if (err instanceof ServiceError) {
			res.status(err.status).json({ error: err.message });
			return;
		}
		throw err;
	}
};
