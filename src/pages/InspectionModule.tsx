import { useState } from "react";
import { ClipboardCheck, Plus, Search, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useInspections, CreateInspectionInput } from "@/hooks/useInspections";
import { usePAR } from "@/hooks/usePAR";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function InspectionModule() {
  const { inspections, isLoading, createInspection, updateInspection } = useInspections();
  const { pars } = usePAR();
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

  const [formData, setFormData] = useState<CreateInspectionInput>({
    par_id: "",
    item_id: "",
    inspection_date: new Date().toISOString().split('T')[0],
    inspector_name: "",
    condition_before: "Good",
    condition_after: "Good",
    findings: "",
    recommendations: "",
    status: "pending",
  });

  const handleSubmit = async () => {
    if (!formData.item_id || !formData.inspector_name) return;
    
    await createInspection.mutateAsync({
      ...formData,
      par_id: formData.par_id || undefined,
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleMarkComplete = async (id: string) => {
    await updateInspection.mutateAsync({ id, status: "completed" });
  };

  const resetForm = () => {
    setFormData({
      par_id: "",
      item_id: "",
      inspection_date: new Date().toISOString().split('T')[0],
      inspector_name: "",
      condition_before: "Good",
      condition_after: "Good",
      findings: "",
      recommendations: "",
      status: "pending",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "follow_up_required": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success/10 text-success";
      case "follow_up_required": return "bg-warning/10 text-warning";
      default: return "bg-primary/10 text-primary";
    }
  };

  const getConditionColor = (condition: string | null) => {
    switch (condition) {
      case "Good": return "text-success";
      case "Fair": return "text-warning";
      case "Poor": return "text-orange-500";
      case "Unserviceable": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const filteredInspections = inspections.filter(inspection => 
    inspection.inspection_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.items?.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.inspector_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inspection Records</h1>
          <p className="text-muted-foreground mt-1">Track property inspections and condition assessments</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Inspection
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Inspections</p>
                <p className="text-2xl font-bold">{inspections.length}</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{inspections.filter(i => i.status === "pending").length}</p>
              </div>
              <Clock className="w-8 h-8 text-warning/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Follow-up Required</p>
                <p className="text-2xl font-bold">{inspections.filter(i => i.status === "follow_up_required").length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Inspection Records
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search inspections..."
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
          ) : filteredInspections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No inspection records found</p>
              <p className="text-sm mt-2">Create a new inspection to track property conditions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Inspection No.</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Inspector</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Condition</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInspections.map((inspection) => (
                    <tr key={inspection.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-primary">{inspection.inspection_number}</td>
                      <td className="py-3 px-4 text-sm">
                        <div>
                          <p className="font-medium">{inspection.items?.item_name}</p>
                          <p className="text-xs text-muted-foreground">{inspection.items?.item_code}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{new Date(inspection.inspection_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm">{inspection.inspector_name}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={getConditionColor(inspection.condition_before)}>
                            {inspection.condition_before || "N/A"}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className={getConditionColor(inspection.condition_after)}>
                            {inspection.condition_after || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`gap-1 ${getStatusColor(inspection.status)}`}>
                          {getStatusIcon(inspection.status)}
                          {inspection.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {inspection.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkComplete(inspection.id)}
                            className="text-success hover:bg-success/10"
                          >
                            Mark Complete
                          </Button>
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

      {/* Add Inspection Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Inspection Record</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>PAR Reference (Optional)</Label>
              <Select 
                value={formData.par_id || ""} 
                onValueChange={(value) => {
                  const selectedPar = pars.find(p => p.id === value);
                  setFormData({ 
                    ...formData, 
                    par_id: value,
                    item_id: selectedPar?.item_id || formData.item_id 
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select PAR (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No PAR</SelectItem>
                  {pars.map((par) => (
                    <SelectItem key={par.id} value={par.id}>
                      {par.par_number} - {par.items?.item_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inspection Date</Label>
                <Input
                  type="date"
                  value={formData.inspection_date}
                  onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Inspector Name</Label>
                <Input
                  value={formData.inspector_name}
                  onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                  placeholder="Enter inspector name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Condition Before</Label>
                <Select 
                  value={formData.condition_before} 
                  onValueChange={(value: "Good" | "Fair" | "Poor" | "Unserviceable") => 
                    setFormData({ ...formData, condition_before: value })
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
              <div className="space-y-2">
                <Label>Condition After</Label>
                <Select 
                  value={formData.condition_after} 
                  onValueChange={(value: "Good" | "Fair" | "Poor" | "Unserviceable") => 
                    setFormData({ ...formData, condition_after: value })
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
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: "pending" | "completed" | "follow_up_required") => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="follow_up_required">Follow-up Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Findings</Label>
              <Textarea
                value={formData.findings || ""}
                onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                placeholder="Describe inspection findings"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Recommendations</Label>
              <Textarea
                value={formData.recommendations || ""}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                placeholder="Enter recommendations"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createInspection.isPending}>
              {createInspection.isPending ? "Creating..." : "Create Inspection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
