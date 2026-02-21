import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface TravelRoute {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  path: Array<{ lat: number; lng: number }>;
  color: string;
  distance: number | null;
  duration: number | null;
  created_at: string;
}

export function useRoutes() {
  return useQuery({
    queryKey: ["travel-routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("travel_routes" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((r) => ({
        ...r,
        path: Array.isArray(r.path) ? r.path : [],
      })) as TravelRoute[];
    },
  });
}

export function useCreateRoute() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      path: Array<{ lat: number; lng: number }>;
      color?: string;
    }) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await (supabase as any)
        .from("travel_routes")
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description ?? null,
          path: input.path,
          color: input.color ?? "#FF6B6B",
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as TravelRoute;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["travel-routes"] });
      toast.success("Route added");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteRoute() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("travel_routes" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["travel-routes"] });
      toast.success("Route deleted");
    },
    onError: (e) => toast.error(e.message),
  });
}
