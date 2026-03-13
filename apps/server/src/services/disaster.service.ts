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
