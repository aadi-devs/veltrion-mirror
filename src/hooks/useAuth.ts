import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";

export function useAuth() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return (await api.getMe()).user;
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => qc.setQueryData(["me"], null),
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    refresh: () => qc.invalidateQueries({ queryKey: ["me"] }),
    logout: () => logoutMutation.mutate(),
  };
}
