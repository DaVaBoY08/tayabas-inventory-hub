import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DepartmentRequest {
  id: string;
  request_number: string;
  department: string;
  requested_by: string;
  request_date: string;
  status: "pending" | "approved" | "rejected" | "fulfilled";
  remarks: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  request_items?: RequestItem[];
}

export interface RequestItem {
  id: string;
  request_id: string;
  item_id: string;
  quantity: number;
  purpose: string | null;
  created_at: string;
  items?: {
    id: string;
    item_code: string;
    item_name: string;
    unit: string;
    quantity: number;
  };
}

export interface CreateRequestInput {
  department: string;
  requested_by: string;
  items: Array<{
    item_id: string;
    quantity: number;
    purpose?: string;
  }>;
}

export function useDepartmentRequests() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["department_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("department_requests")
        .select(`
          *,
          request_items (
            *,
            items (id, item_code, item_name, unit, quantity)
          )
        `)
        .order("request_date", { ascending: false });

      if (error) throw error;
      return data as DepartmentRequest[];
    },
  });

  const createRequest = useMutation({
    mutationFn: async (input: CreateRequestInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate request number
      const requestNumber = `REQ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      // Create the request
      const { data: request, error: requestError } = await supabase
        .from("department_requests")
        .insert({
          request_number: requestNumber,
          department: input.department,
          requested_by: input.requested_by,
          created_by: user?.id,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Add request items
      const itemsToInsert = input.items.map((item) => ({
        request_id: request.id,
        item_id: item.item_id,
        quantity: item.quantity,
        purpose: item.purpose,
      }));

      const { error: itemsError } = await supabase
        .from("request_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["department_requests"] });
      toast.success("Request submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit request: ${error.message}`);
    },
  });

  const updateRequestStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      remarks,
    }: {
      id: string;
      status: "approved" | "rejected" | "fulfilled";
      remarks?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("department_requests")
        .update({
          status,
          remarks,
          approved_by: status === "approved" ? user?.id : null,
          approved_at: status === "approved" ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["department_requests"] });
      toast.success(`Request ${variables.status}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update request: ${error.message}`);
    },
  });

  return {
    requests,
    isLoading,
    error,
    createRequest,
    updateRequestStatus,
  };
}
