import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVolunteerProfile, updateVolunteerProfile } from "../api";
import type { VolunteerProfile } from "@repo/shared/schemas";

export type { VolunteerProfile };

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
      queryClient.invalidateQueries({ queryKey: ["volunteer-profile"] });
      queryClient.invalidateQueries({ queryKey: ["map-data"] });
    },
  });
}
