import { useState } from "react";
import { FileInput, Plus, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDepartmentRequests, CreateRequestInput } from "@/hooks/useDepartmentRequests";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RequestItemForm {
  id: string;
  itemId: string;
  quantity: string;
  purpose: string;
}

export default function DepartmentRequestsNew() {
  const { requests, isLoading, createRequest, updateRequestStatus } = useDepartmentRequests();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch items from Supabase
  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("item_name");
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    department: "",
    requestedBy: "",
  });

  const [requestItems, setRequestItems] = useState<RequestItemForm[]>([
    { id: "1", itemId: "", quantity: "", purpose: "" }
  ]);

  const addRequestItem = () => {
    setRequestItems([...requestItems, { id: Date.now().toString(), itemId: "", quantity: "", purpose: "" }]);
  };

  const removeRequestItem = (id: string) => {
    if (requestItems.length > 1) {
      setRequestItems(requestItems.filter(item => item.id !== id));
    }
  };

  const updateRequestItem = (id: string, field: keyof RequestItemForm, value: string) => {
    setRequestItems(requestItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async () => {
    const validItems = requestItems.filter(ri => ri.itemId && ri.quantity);
    if (validItems.length === 0 || !formData.department || !formData.requestedBy) return;

    const input: CreateRequestInput = {
      department: formData.department,
      requested_by: formData.requestedBy,
      items: validItems.map(ri => ({
        item_id: ri.itemId,
        quantity: parseInt(ri.quantity),
        purpose: ri.purpose,
      })),
    };

    await createRequest.mutateAsync(input);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleApprove = async (id: string) => {
    await updateRequestStatus.mutateAsync({ id, status: "approved" });
  };

  const handleReject = async (id: string) => {
    await updateRequestStatus.mutateAsync({ id, status: "rejected", remarks: "Rejected by manager" });
  };

  const resetForm = () => {
    setFormData({ department: "", requestedBy: "" });
    setRequestItems([{ id: "1", itemId: "", quantity: "", purpose: "" }]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "fulfilled": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-success/10 text-success";
      case "rejected": return "bg-destructive/10 text-destructive";
      case "fulfilled": return "bg-primary/10 text-primary";
      default: return "bg-warning/10 text-warning";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Department Requests</h1>
          <p className="text-muted-foreground mt-1">Request items before issuance (multiple items per request)</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileInput className="w-5 h-5" />
            Request List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileInput className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No requests found</p>
              <p className="text-sm mt-2">Create a new request to start</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Request No.</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Requested By</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-primary">{request.request_number}</td>
                      <td className="py-3 px-4 text-sm">{new Date(request.request_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm font-medium">{request.department}</td>
                      <td className="py-3 px-4 text-sm">{request.requested_by}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="space-y-1">
                          {request.request_items?.map((item, index) => (
                            <div key={index} className="text-xs">
                              <span className="font-medium">{item.items?.item_name}</span>
                              <span className="text-muted-foreground"> x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`gap-1 ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {request.status === "pending" && (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(request.id)}
                              className="h-8 text-success hover:bg-success/10"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(request.id)}
                              className="h-8 text-destructive hover:bg-destructive/10"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Request Dialog with Multiple Items */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Department Request (Multiple Items)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mayor's Office">Mayor's Office</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="IT Department">IT Department</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Requested By</Label>
                <Input
                  value={formData.requestedBy}
                  onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Requested Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRequestItem} className="gap-1">
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {requestItems.map((requestItem, index) => {
                  const selectedItem = items.find(i => i.id === requestItem.itemId);
                  return (
                    <div key={requestItem.id} className="p-4 bg-muted/30 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Item #{index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRequestItem(requestItem.id)}
                          disabled={requestItems.length === 1}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-2">
                          <Label className="text-xs">Item</Label>
                          <Select 
                            value={requestItem.itemId} 
                            onValueChange={(value) => updateRequestItem(requestItem.id, "itemId", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.item_code} - {item.item_name} (Avail: {item.quantity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            value={requestItem.quantity}
                            onChange={(e) => updateRequestItem(requestItem.id, "quantity", e.target.value)}
                            placeholder="0"
                            max={selectedItem?.quantity}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Purpose</Label>
                        <Input
                          value={requestItem.purpose}
                          onChange={(e) => updateRequestItem(requestItem.id, "purpose", e.target.value)}
                          placeholder="Purpose for this item"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createRequest.isPending}>
              {createRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
