import type { CreateDisasterZoneInput, CreateResourceInput } from "@repo/shared/schemas";
import * as disasterRepo from "../repositories/disaster.repository.js";

export async function getAllMapData() {
  const [zones, helpRequests, volunteers, resources] = await Promise.all([
    disasterRepo.findAllActiveZones(),
    disasterRepo.findAllHelpRequests(),
    disasterRepo.findAvailableVolunteers(),
    disasterRepo.findAllResources(),
  ]);

  return { zones, helpRequests, volunteers, resources };
}

export async function createDisasterZone(input: CreateDisasterZoneInput) {
  const [zone] = await disasterRepo.createZone(input);
  if (!zone) throw new Error("Failed to create disaster zone");
  return zone;
}

export async function createResource(input: CreateResourceInput) {
  const [resource] = await disasterRepo.createResource(input);
  if (!resource) throw new Error("Failed to create resource");
  return resource;
}

export async function getZonesPaginated(page: number, limit: number) {
  const offset = page * limit;
  const [data, total] = await Promise.all([
    disasterRepo.findActiveZonesPaginated(limit, offset),
    disasterRepo.countActiveZones(),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getResourcesPaginated(page: number, limit: number) {
  const offset = page * limit;
  const [data, total] = await Promise.all([
    disasterRepo.findResourcesPaginated(limit, offset),
    disasterRepo.countResources(),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function deleteDisasterZone(id: string) {
  const [zone] = await disasterRepo.deleteZone(id);
  if (!zone) throw new Error("Zone not found");
  return zone;
}

export async function deleteResource(id: string) {
  const [resource] = await disasterRepo.deleteResource(id);
  if (!resource) throw new Error("Resource not found");
  return resource;
}
