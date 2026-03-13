import type { UpdateVolunteerProfileInput } from "@repo/shared/schemas";
import { ServiceError } from "./auth.service.js";
import * as disasterRepo from "../repositories/disaster.repository.js";

export async function getOrCreateProfile(userId: string) {
  const [existing] = await disasterRepo.findVolunteerByUserId(userId);
  if (existing) return existing;

  const [created] = await disasterRepo.createVolunteer({ userId });
  if (!created) throw new ServiceError(500, "Failed to create volunteer profile");
  return created;
}

export async function updateProfile(userId: string, input: UpdateVolunteerProfileInput) {
  const [existing] = await disasterRepo.findVolunteerByUserId(userId);
  if (!existing) {
    // Auto-create then update
    await disasterRepo.createVolunteer({ userId });
  }

  const [updated] = await disasterRepo.updateVolunteer(userId, input);
  if (!updated) throw new ServiceError(500, "Failed to update volunteer profile");
  return updated;
}
