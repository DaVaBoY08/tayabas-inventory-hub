import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PAR {
  id: string;
  par_number: string;
  item_id: string;
  custodian_id: string;
  quantity: number;
  date_acquired: string;
  property_number: string | null;
  location: string | null;
  condition: "Good" | "Fair" | "Poor" | "Unserviceable";
  remarks: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  items?: {
    id: string;
    item_code: string;
    item_name: string;
    unit: string;
  };
  custodians?: {
    id: string;
    name: string;
    department: string;
    position: string | null;
  };
}

export interface CreatePARInput {
  item_id: string;
  custodian_id: string;
  quantity: number;
  date_acquired: string;
  property_number?: string;
  location?: string;
  condition?: "Good" | "Fair" | "Poor" | "Unserviceable";
  remarks?: string;
}

export function usePAR() {
  const queryClient = useQueryClient();

  const { data: pars = [], isLoading, error } = useQuery({
    queryKey: ["property_acknowledgement_receipts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_acknowledgement_receipts")
        .select(`
          *,
          items (id, item_code, item_name, unit),
          custodians (id, name, department, position)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PAR[];
    },
  });

  const createPAR = useMutation({
    mutationFn: async (input: CreatePARInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate PAR number
      const parNumber = `PAR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const { data, error } = await supabase
        .from("property_acknowledgement_receipts")
        .insert({
          par_number: parNumber,
          ...input,
          created_by: user?.id,
        })
        .select(`
          *,
          items (id, item_code, item_name, unit),
          custodians (id, name, department, position)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property_acknowledgement_receipts"] });
      toast.success("PAR created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create PAR: ${error.message}`);
    },
  });

  const updatePAR = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PAR> & { id: string }) => {
      const { error } = await supabase
        .from("property_acknowledgement_receipts")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property_acknowledgement_receipts"] });
      toast.success("PAR updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update PAR: ${error.message}`);
    },
  });

  return {
    pars,
    isLoading,
    error,
    createPAR,
    updatePAR,
  };
}
