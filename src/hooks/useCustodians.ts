import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Custodian {
  id: string;
  name: string;
  department: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCustodians() {
  const queryClient = useQueryClient();

  const { data: custodians = [], isLoading, error } = useQuery({
    queryKey: ["custodians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custodians")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as Custodian[];
    },
  });

  const createCustodian = useMutation({
    mutationFn: async (custodian: Omit<Custodian, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("custodians")
        .insert(custodian)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custodians"] });
      toast.success("Custodian created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create custodian: ${error.message}`);
    },
  });

  const updateCustodian = useMutation({
    mutationFn: async ({
      id,
      ...custodian
    }: Partial<Custodian> & { id: string }) => {
      const { data, error } = await supabase
        .from("custodians")
        .update(custodian)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custodians"] });
      toast.success("Custodian updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update custodian: ${error.message}`);
    },
  });

  const deleteCustodian = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custodians").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custodians"] });
      toast.success("Custodian deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete custodian: ${error.message}`);
    },
  });

  return {
    custodians,
    isLoading,
    error,
    createCustodian,
    updateCustodian,
    deleteCustodian,
  };
}
