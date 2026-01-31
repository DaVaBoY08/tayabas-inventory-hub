import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Inspection {
  id: string;
  inspection_number: string;
  par_id: string | null;
  item_id: string;
  inspection_date: string;
  inspector_name: string;
  condition_before: "Good" | "Fair" | "Poor" | "Unserviceable" | null;
  condition_after: "Good" | "Fair" | "Poor" | "Unserviceable" | null;
  findings: string | null;
  recommendations: string | null;
  status: "pending" | "completed" | "follow_up_required";
  created_by: string | null;
  created_at: string;
  updated_at: string;
  items?: {
    id: string;
    item_code: string;
    item_name: string;
    unit: string;
  };
  property_acknowledgement_receipts?: {
    id: string;
    par_number: string;
    custodians: {
      name: string;
      department: string;
    };
  };
}

export interface CreateInspectionInput {
  par_id?: string;
  item_id: string;
  inspection_date: string;
  inspector_name: string;
  condition_before?: "Good" | "Fair" | "Poor" | "Unserviceable";
  condition_after?: "Good" | "Fair" | "Poor" | "Unserviceable";
  findings?: string;
  recommendations?: string;
  status?: "pending" | "completed" | "follow_up_required";
}

export function useInspections() {
  const queryClient = useQueryClient();

  const { data: inspections = [], isLoading, error } = useQuery({
    queryKey: ["inspections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inspections")
        .select(`
          *,
          items (id, item_code, item_name, unit),
          property_acknowledgement_receipts (
            id, 
            par_number,
            custodians (name, department)
          )
        `)
        .order("inspection_date", { ascending: false });

      if (error) throw error;
      return data as Inspection[];
    },
  });

  const createInspection = useMutation({
    mutationFn: async (input: CreateInspectionInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate inspection number
      const inspectionNumber = `INS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const { data, error } = await supabase
        .from("inspections")
        .insert({
          inspection_number: inspectionNumber,
          ...input,
          created_by: user?.id,
        })
        .select(`
          *,
          items (id, item_code, item_name, unit)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast.success("Inspection recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to record inspection: ${error.message}`);
    },
  });

  const updateInspection = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Inspection> & { id: string }) => {
      const { error } = await supabase
        .from("inspections")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast.success("Inspection updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update inspection: ${error.message}`);
    },
  });

  return {
    inspections,
    isLoading,
    error,
    createInspection,
    updateInspection,
  };
}
