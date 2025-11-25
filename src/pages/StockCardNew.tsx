import { useState } from "react";
import { FileText, Search, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockItems } from "@/lib/mockData";

interface StockCardEntry {
  id: string;
  date: string;
  reference: string;
  type: "Received" | "Issued";
  quantity: number;
  balance: number;
  unitCost: number;
  totalValue: number;
  remarks: string;
}

export default function StockCardNew() {
  const [selectedItem, setSelectedItem] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock stock card entries
  const stockCardEntries: StockCardEntry[] = [
    {
      id: "1",
      date: "2024-01-01",
      reference: "Beginning Balance",
      type: "Received",
      quantity: 100,
      balance: 100,
      unitCost: 220,
      totalValue: 22000,
      remarks: "Opening stock",
    },
    {
      id: "2",
      date: "2024-01-10",
      reference: "PO-2024-001",
      type: "Received",
      quantity: 50,
      balance: 150,
      unitCost: 220,
      totalValue: 33000,
      remarks: "Regular procurement",
    },
    {
      id: "3",
      date: "2024-01-12",
      reference: "RIS-2024-003",
      type: "Issued",
      quantity: 10,
      balance: 140,
      unitCost: 220,
      totalValue: 30800,
      remarks: "To HR Department",
    },
    {
      id: "4",
      date: "2024-01-15",
      reference: "RIS-2024-005",
      type: "Issued",
      quantity: 15,
      balance: 125,
      unitCost: 220,
      totalValue: 27500,
      remarks: "To Finance Department",
    },
  ];

  const filteredItems = mockItems.filter(item =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedItemData = mockItems.find(item => item.id === selectedItem);

  const handleExport = () => {
    // Export functionality would be implemented here
    alert("Stock card export feature - connect to your export service");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Card</h1>
          <p className="text-muted-foreground mt-1">View detailed stock movement history by item</p>
        </div>
        {selectedItem && (
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export to PDF
          </Button>
        )}
      </div>

      {/* Item Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  {filteredItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.itemCode} - {item.itemName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Item Summary */}
          {selectedItemData && (
            <div className="grid gap-4 md:grid-cols-4 mt-6 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-bold">{selectedItemData.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unit Cost</p>
                <p className="text-2xl font-bold">₱{selectedItemData.unitCost}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₱{selectedItemData.totalValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-lg font-semibold">{selectedItemData.location}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Card History */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Stock Movement History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Unit Cost</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Value</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {stockCardEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm">{entry.date}</td>
                      <td className="py-3 px-4 text-sm font-medium">{entry.reference}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.type === "Received" 
                            ? "bg-success/10 text-success" 
                            : "bg-primary/10 text-primary"
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-sm text-right font-semibold ${
                        entry.type === "Received" ? "text-success" : "text-primary"
                      }`}>
                        {entry.type === "Received" ? "+" : "-"}{entry.quantity}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-bold">{entry.balance}</td>
                      <td className="py-3 px-4 text-sm text-right">₱{entry.unitCost.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium">₱{entry.totalValue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{entry.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedItem && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Please select an item to view its stock card</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
