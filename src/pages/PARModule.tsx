import { useState } from "react";
import { FileCheck, Plus, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { usePAR, CreatePARInput } from "@/hooks/usePAR";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function PARModule() {
  const { pars, isLoading, createPAR } = usePAR();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Fetch custodians from Supabase
  const { data: custodians = [] } = useQuery({
    queryKey: ["custodians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custodians")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState<CreatePARInput>({
    item_id: "",
    custodian_id: "",
    quantity: 1,
    date_acquired: new Date().toISOString().split('T')[0],
    property_number: "",
    location: "",
    condition: "Good",
    remarks: "",
  });

  const handleSubmit = async () => {
    if (!formData.item_id || !formData.custodian_id) return;
    
    await createPAR.mutateAsync(formData);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      item_id: "",
      custodian_id: "",
      quantity: 1,
      date_acquired: new Date().toISOString().split('T')[0],
      property_number: "",
      location: "",
      condition: "Good",
      remarks: "",
    });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Good": return "bg-success/10 text-success";
      case "Fair": return "bg-warning/10 text-warning";
      case "Poor": return "bg-orange-500/10 text-orange-500";
      case "Unserviceable": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredPARs = pars.filter(par => 
    par.par_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    par.items?.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    par.custodians?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Property Acknowledgement Receipt (PAR)</h1>
          <p className="text-muted-foreground mt-1">Track property assignments and accountability</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New PAR
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              PAR Records
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search PAR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredPARs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No PAR records found</p>
              <p className="text-sm mt-2">Create a new PAR to track property assignments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">PAR No.</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Custodian</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Qty</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date Acquired</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Condition</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPARs.map((par) => (
                    <tr key={par.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-primary">{par.par_number}</td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <p className="font-medium">{par.items?.item_name}</p>
                          <p className="text-xs text-muted-foreground">{par.items?.item_code}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <p className="font-medium">{par.custodians?.name}</p>
                          <p className="text-xs text-muted-foreground">{par.custodians?.position}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{par.custodians?.department}</td>
                      <td className="py-3 px-4 text-sm text-right">{par.quantity}</td>
                      <td className="py-3 px-4 text-sm">{new Date(par.date_acquired).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <Badge className={getConditionColor(par.condition)}>{par.condition}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{par.location || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add PAR Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Property Acknowledgement Receipt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Item</Label>
              <Select 
                value={formData.item_id} 
                onValueChange={(value) => setFormData({ ...formData, item_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.item_code} - {item.item_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Custodian (Accountable Officer)</Label>
              <Select 
                value={formData.custodian_id} 
                onValueChange={(value) => setFormData({ ...formData, custodian_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select custodian" />
                </SelectTrigger>
                <SelectContent>
                  {custodians.map((custodian) => (
                    <SelectItem key={custodian.id} value={custodian.id}>
                      {custodian.name} - {custodian.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date Acquired</Label>
                <Input
                  type="date"
                  value={formData.date_acquired}
                  onChange={(e) => setFormData({ ...formData, date_acquired: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Property Number (Optional)</Label>
                <Input
                  value={formData.property_number || ""}
                  onChange={(e) => setFormData({ ...formData, property_number: e.target.value })}
                  placeholder="e.g., PROP-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select 
                  value={formData.condition} 
                  onValueChange={(value: "Good" | "Fair" | "Poor" | "Unserviceable") => 
                    setFormData({ ...formData, condition: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Unserviceable">Unserviceable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Room 101, Building A"
              />
            </div>

            <div className="space-y-2">
              <Label>Remarks (Optional)</Label>
              <Textarea
                value={formData.remarks || ""}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createPAR.isPending}>
              {createPAR.isPending ? "Creating..." : "Create PAR"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
