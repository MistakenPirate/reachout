import { ServiceError } from "./auth.service.js";
import * as disasterRepo from "../repositories/disaster.repository.js";

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getSuggestedVolunteers(requestId: string) {
  const [request] = await disasterRepo.findHelpRequestById(requestId);
  if (!request) throw new ServiceError(404, "Help request not found");

  const volunteers = await disasterRepo.findAllAvailableVolunteersWithLocation();

  const ranked = volunteers
    .filter((v) => v.latitude != null && v.longitude != null)
    .map((v) => ({
      ...v,
      distance: haversineDistance(request.latitude, request.longitude, v.latitude!, v.longitude!),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  return ranked;
}

export async function assignVolunteer(requestId: string, volunteerUserId: string) {
  const [request] = await disasterRepo.findHelpRequestById(requestId);
  if (!request) throw new ServiceError(404, "Help request not found");
  if (request.status !== "pending") throw new ServiceError(400, "Request is not pending");

  const [updated] = await disasterRepo.assignVolunteerToRequest(requestId, volunteerUserId);
  if (!updated) throw new ServiceError(500, "Failed to assign volunteer");

  await disasterRepo.setVolunteerOnMission(volunteerUserId);

  return updated;
}

export async function allocateResource(resourceId: string, amount: number, disasterZoneId?: string) {
  const [resource] = await disasterRepo.findResourceById(resourceId);
  if (!resource) throw new ServiceError(404, "Resource not found");
  if (resource.quantity < amount) throw new ServiceError(400, "Insufficient quantity");

  const [updated] = await disasterRepo.decrementResourceQuantity(resourceId, amount);
  if (!updated) throw new ServiceError(500, "Failed to allocate resource");

  // Update status if depleted
  if (updated.quantity <= 0) {
    await disasterRepo.updateResource(resourceId, { status: "depleted" });
  }

  return updated;
}

export async function getAllPendingRequests() {
  const allRequests = await disasterRepo.findAllHelpRequests();
  return allRequests
    .filter((r) => r.status === "pending")
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
}
