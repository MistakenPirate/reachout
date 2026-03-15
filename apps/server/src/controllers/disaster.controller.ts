import type { RequestHandler } from "express";
import {
	createDisasterZoneSchema,
	createResourceSchema,
} from "@repo/shared/schemas";
import * as disasterService from "../services/disaster.service.js";
import { broadcast } from "../ws.js";

export const getMapData: RequestHandler = async (_req, res) => {
	const data = await disasterService.getAllMapData();
	res.json(data);
};

export const createDisasterZone: RequestHandler = async (req, res) => {
	const parsed = createDisasterZoneSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten().fieldErrors });
		return;
	}

	const zone = await disasterService.createDisasterZone(parsed.data);
	broadcast({ type: "disaster_zone_created", payload: zone });
	res.status(201).json(zone);
};

export const createResource: RequestHandler = async (req, res) => {
	const parsed = createResourceSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten().fieldErrors });
		return;
	}

	const resource = await disasterService.createResource(parsed.data);
	broadcast({ type: "resource_allocated", payload: resource });
	res.status(201).json(resource);
};
