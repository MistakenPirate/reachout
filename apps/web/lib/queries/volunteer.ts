import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchVolunteerProfile, updateVolunteerProfile, fetchVolunteerMissions, updateMissionStatus } from "../api";
import type { VolunteerProfile } from "@repo/shared/schemas";

export type { VolunteerProfile };

export interface VolunteerMission {
  id: string;
  latitude: number;
  longitude: number;
  emergencyType: string;
  peopleCount: number;
  description: string | null;
  status: string;
  priorityScore: number | null;
  createdAt: string;
  updatedAt: string;
  userName: string | null;
  userPhone: string | null;
}

export function useVolunteerProfile() {
  return useQuery<VolunteerProfile>({
    queryKey: ["volunteer-profile"],
    queryFn: fetchVolunteerProfile,
    retry: false,
  });
}

export function useUpdateVolunteerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVolunteerProfile,
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["volunteer-profile"] });
      queryClient.invalidateQueries({ queryKey: ["map-data"] });
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useVolunteerMissions() {
  return useQuery<VolunteerMission[]>({
    queryKey: ["volunteer-missions"],
    queryFn: fetchVolunteerMissions,
    refetchInterval: 15000,
  });
}

export function useUpdateMissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateMissionStatus(id, status),
    onSuccess: () => {
      toast.success("Mission status updated");
      queryClient.invalidateQueries({ queryKey: ["volunteer-missions"] });
      queryClient.invalidateQueries({ queryKey: ["volunteer-profile"] });
      queryClient.invalidateQueries({ queryKey: ["map-data"] });
    },
    onError: (err) => toast.error(err.message),
  });
}
