import { useState, useMemo } from "react";
import { PackageMinus, FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TransactionFilters, FilterState } from "@/components/filters/TransactionFilters";
import { useStockMovements } from "@/hooks/useStockMovements";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface BulkItem {
  id: string;
  itemId: string;
  quantity: string;
}

export default function BulkStockIssuance() {
  const { movements, createMovement } = useStockMovements();
  const [filters, setFilters] = useState<FilterState>({
    startDate: undefined,
    endDate: undefined,
    itemId: "",
  });

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

  const [bulkItems, setBulkItems] = useState<BulkItem[]>([
    { id: "1", itemId: "", quantity: "" }
  ]);
  const [formData, setFormData] = useState({
    custodianId: "",
    reference: "",
    date: new Date().toISOString().split('T')[0],
    purpose: "",
    notes: "",
  });

  const addItem = () => {
    setBulkItems([...bulkItems, { id: Date.now().toString(), itemId: "", quantity: "" }]);
  };

  const removeItem = (id: string) => {
    if (bulkItems.length > 1) {
      setBulkItems(bulkItems.filter(item => item.id !== id));
    }
  };

  const updateBulkItem = (id: string, field: keyof BulkItem, value: string) => {
    setBulkItems(bulkItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = bulkItems.filter(bi => bi.itemId && bi.quantity);
    if (validItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const selectedCustodian = custodians.find(c => c.id === formData.custodianId);
    if (!selectedCustodian) {
      toast.error("Please select a custodian");
      return;
    }

    try {
      for (const bulkItem of validItems) {
        await createMovement.mutateAsync({
          item_id: bulkItem.itemId,
          movement_type: "issued",
          quantity: parseInt(bulkItem.quantity),
          reference: formData.reference,
          movement_date: formData.date,
          custodian: selectedCustodian.name,
          department: selectedCustodian.department,
          purpose: formData.purpose || formData.notes,
        });
      }

      // Reset form
      setBulkItems([{ id: "1", itemId: "", quantity: "" }]);
      setFormData({
        custodianId: "",
        reference: "",
        date: new Date().toISOString().split('T')[0],
        purpose: "",
        notes: "",
      });

      toast.success(`${validItems.length} item(s) issued successfully`);
    } catch (error) {
      console.error("Error creating movements:", error);
    }
  };

  // Filter movements
  const filteredMovements = useMemo(() => {
    return movements
      .filter(m => m.movement_type === "issued")
      .filter(m => {
        if (filters.startDate) {
          const movementDate = new Date(m.movement_date);
          if (movementDate < filters.startDate) return false;
        }
        if (filters.endDate) {
          const movementDate = new Date(m.movement_date);
          if (movementDate > filters.endDate) return false;
        }
        if (filters.itemId && filters.itemId !== "all" && m.item_id !== filters.itemId) {
          return false;
        }
        return true;
      });
  }, [movements, filters]);

  const itemsForFilter = items.map(item => ({
    id: item.id,
    itemCode: item.item_code,
    itemName: item.item_name,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bulk Stock Issuance</h1>
        <p className="text-muted-foreground mt-1">Issue multiple inventory items at once</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bulk Issuance Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageMinus className="w-5 h-5" />
              Issue Multiple Items (RIS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custodian">Custodian</Label>
                <Select 
                  value={formData.custodianId} 
                  onValueChange={(value) => setFormData({ ...formData, custodianId: value })}
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
                  <Label htmlFor="reference">RIS No.</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="RIS-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date Issued</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Purpose of issuance"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Items to Issue</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {bulkItems.map((bulkItem, index) => {
                    const selectedItem = items.find(i => i.id === bulkItem.itemId);
                    return (
                      <div key={bulkItem.id} className="flex items-end gap-2 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs">Item #{index + 1}</Label>
                          <Select 
                            value={bulkItem.itemId} 
                            onValueChange={(value) => updateBulkItem(bulkItem.id, "itemId", value)}
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
                        <div className="w-24 space-y-2">
                          <Label className="text-xs">
                            Qty {selectedItem ? `(max: ${selectedItem.quantity})` : ""}
                          </Label>
                          <Input
                            type="number"
                            value={bulkItem.quantity}
                            onChange={(e) => updateBulkItem(bulkItem.id, "quantity", e.target.value)}
                            placeholder="0"
                            max={selectedItem?.quantity}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(bulkItem.id)}
                          disabled={bulkItems.length === 1}
                          className="h-10 w-10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or remarks"
                  rows={2}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={createMovement.isPending}>
                <PackageMinus className="w-4 h-4" />
                {createMovement.isPending ? "Processing..." : `Issue ${bulkItems.filter(bi => bi.itemId && bi.quantity).length} Item(s)`}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Issuances with Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Issuances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TransactionFilters items={itemsForFilter} onFilterChange={setFilters} />
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {filteredMovements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No issuances found
                </div>
              ) : (
                filteredMovements.slice(0, 20).map((movement) => {
                  const item = items.find(i => i.id === movement.item_id);
                  return (
                    <div
                      key={movement.id}
                      className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <PackageMinus className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item?.item_name || "Unknown Item"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              To: {movement.custodian}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Ref: {movement.reference}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-primary flex-shrink-0">
                            -{movement.quantity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(movement.movement_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
