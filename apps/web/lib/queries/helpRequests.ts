import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyRequests, createHelpRequest, resolveHelpRequest } from "../api";

export function useMyRequests() {
  return useQuery<{
    id: string;
    emergencyType: string;
    peopleCount: number;
    description: string | null;
    status: string;
    createdAt: string;
  }[]>({
    queryKey: ["my-help-requests"],
    queryFn: fetchMyRequests,
  });
}

export function useCreateHelpRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHelpRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-help-requests"] });
      queryClient.invalidateQueries({ queryKey: ["map-data"] });
    },
  });
}

export function useResolveHelpRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resolveHelpRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-help-requests"] });
      queryClient.invalidateQueries({ queryKey: ["map-data"] });
    },
  });
}
