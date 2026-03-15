import type { CreateHelpRequestInput } from "@repo/shared/schemas";
import { ServiceError } from "./auth.service.js";
import * as disasterRepo from "../repositories/disaster.repository.js";

export async function createHelpRequest(
	userId: string,
	input: CreateHelpRequestInput,
) {
	const [request] = await disasterRepo.createHelpRequest({
		userId,
		latitude: input.latitude,
		longitude: input.longitude,
		emergencyType: input.emergencyType,
		peopleCount: input.peopleCount,
		description: input.description,
		disasterZoneId: input.disasterZoneId,
	});
	if (!request) throw new ServiceError(500, "Failed to create help request");
	return request;
}

export async function getUserRequests(userId: string) {
	return disasterRepo.findHelpRequestsByUser(userId);
}

export async function getUserRequestsPaginated(
	userId: string,
	page: number,
	limit: number,
) {
	const offset = page * limit;
	const [data, total] = await Promise.all([
		disasterRepo.findHelpRequestsByUserPaginated(userId, limit, offset),
		disasterRepo.countHelpRequestsByUser(userId),
	]);
	return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function resolveRequest(requestId: string, userId: string) {
	const [request] = await disasterRepo.findHelpRequestById(requestId);
	if (!request) throw new ServiceError(404, "Help request not found");
	if (request.userId !== userId)
		throw new ServiceError(403, "Not your request");

	const [updated] = await disasterRepo.updateHelpRequestStatus(
		requestId,
		"resolved",
	);
	if (!updated) throw new ServiceError(500, "Failed to update request");
	return updated;
}
