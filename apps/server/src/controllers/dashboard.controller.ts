import type { RequestHandler } from "express";
import * as disasterRepo from "../repositories/disaster.repository.js";
import { ServiceError } from "../services/auth.service.js";

// US-011: Full dashboard data for admin
export const getDashboardData: RequestHandler = async (_req, res) => {
	const [zones, requests, volunteers, resources] = await Promise.all([
		disasterRepo.findAllActiveZones(),
		disasterRepo.findAllHelpRequestsFull(),
		disasterRepo.findAllVolunteers(),
		disasterRepo.findAllResources(),
	]);

	const summary = {
		totalActiveDisasters: zones.length,
		pendingRequests: requests.filter((r) => r.status === "pending").length,
		assignedRequests: requests.filter((r) => r.status === "assigned").length,
		inProgressRequests: requests.filter((r) => r.status === "in_progress")
			.length,
		resolvedRequests: requests.filter((r) => r.status === "resolved").length,
		availableVolunteers: volunteers.filter((v) => v.isAvailable).length,
		onMissionVolunteers: volunteers.filter((v) => v.status === "on_mission")
			.length,
		totalResources: resources.reduce((sum, r) => sum + r.quantity, 0),
	};

	res.json({ summary, zones, requests, volunteers, resources });
};

// US-012: Rescue tracking for a victim's request
export const getRescueStatus: RequestHandler = async (req, res) => {
	if (!req.user) {
		res.status(401).json({ error: "Not authenticated" });
		return;
	}

	const requests = await disasterRepo.findHelpRequestsByUser(req.user.userId);
	const active = requests.filter((r) => r.status !== "resolved");

	const result = await Promise.all(
		active.map(async (request) => {
			let volunteer = null;
			let volunteerDistance = null;

			if (request.assignedVolunteerId) {
				const [user] = await disasterRepo.findUserById(
					request.assignedVolunteerId,
				);
				const [vol] = await disasterRepo.findVolunteerByUserId(
					request.assignedVolunteerId,
				);

				if (user && vol && vol.latitude != null && vol.longitude != null) {
					const R = 6371;
					const dLat = ((vol.latitude - request.latitude) * Math.PI) / 180;
					const dLon = ((vol.longitude - request.longitude) * Math.PI) / 180;
					const a =
						Math.sin(dLat / 2) ** 2 +
						Math.cos((request.latitude * Math.PI) / 180) *
							Math.cos((vol.latitude * Math.PI) / 180) *
							Math.sin(dLon / 2) ** 2;
					volunteerDistance =
						R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

					volunteer = {
						name: user.name,
						phone: user.phone,
						distance: Math.round(volunteerDistance * 10) / 10,
					};
				} else if (user) {
					volunteer = { name: user.name, phone: user.phone, distance: null };
				}
			}

			return {
				id: request.id,
				emergencyType: request.emergencyType,
				peopleCount: request.peopleCount,
				description: request.description,
				status: request.status,
				createdAt: request.createdAt,
				updatedAt: request.updatedAt,
				volunteer,
			};
		}),
	);

	res.json(result);
};
