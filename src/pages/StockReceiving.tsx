import { useState } from "react";
import { PackagePlus, Calendar, Filter, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useItems } from "@/hooks/useItems";
import { useStockMovements } from "@/hooks/useStockMovements";
import DateRangeFilter from "@/components/filters/DateRangeFilter";
import ItemFilter from "@/components/filters/ItemFilter";

interface CartItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
}

export default function StockReceiving() {
  const { items, updateItem } = useItems();
  const { movements, createMovement } = useStockMovements();

  // Filter only received movements
  const receivedMovements = movements.filter(m => m.movement_type === "received");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState({
    reference: "",
    date: new Date().toISOString().split("T")[0],
    supplier: "",
    notes: "",
  });

  // Item selection for adding to cart
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("");

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Filter receipts
  const filteredReceipts = receivedMovements.filter((movement) => {
    const item = items.find(i => i.id === movement.item_id);
    const itemName = item?.item_name?.toLowerCase() || "";
    const reference = movement.reference?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    const matchesSearch = itemName.includes(query) || reference.includes(query);

    let matchesDate = true;
    if (dateFrom || dateTo) {
      const movementDate = movement.movement_date?.split("T")[0] || "";
      if (dateFrom && movementDate < dateFrom) matchesDate = false;
      if (dateTo && movementDate > dateTo) matchesDate = false;
    }

    return matchesSearch && matchesDate;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
  };

  const handleAddToCart = () => {
    if (!selectedItemId) {
      toast.error("Please select an item.");
      return;
    }

    const item = items.find(i => i.id === selectedItemId);
    if (!item) {
      toast.error("Item not found.");
      return;
    }

    const quantity = parseInt(selectedQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    // Check if item already in cart
    const existingCartItem = cart.find(c => c.itemId === selectedItemId);

    if (existingCartItem) {
      // Update existing cart item
      setCart(cart.map(c =>
        c.itemId === selectedItemId
          ? { ...c, quantity: c.quantity + quantity }
          : c
      ));
    } else {
      // Add new cart item
      setCart([...cart, {
        itemId: item.id,
        itemCode: item.item_code,
        itemName: item.item_name,
        quantity,
      }]);
    }

    // Reset selection
    setSelectedItemId("");
    setSelectedQuantity("");
    toast.success("Item added to cart");
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.itemId !== itemId));
    toast.success("Item removed from cart");
  };

  const handleUpdateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId);
      return;
    }

    setCart(cart.map(c =>
      c.itemId === itemId ? { ...c, quantity: newQuantity } : c
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Please add at least one item to the cart.");
      return;
    }

    if (!formData.reference.trim()) {
      toast.error("Please enter a reference number (PO/DR).");
      return;
    }

    // Check for duplicate reference
    if (movements.some((movement) => movement.reference === formData.reference)) {
      toast.error("Reference No. (PO/DR) already exists.");
      return;
    }

    try {
      // Create movement for each cart item
      for (const cartItem of cart) {
        const item = items.find(i => i.id === cartItem.itemId);
        if (!item) continue;

        await createMovement.mutateAsync({
          item_id: cartItem.itemId,
          movement_type: "received",
          quantity: cartItem.quantity,
          movement_date: formData.date,
          reference: formData.reference,
          custodian: null,
          department: null,
          purpose: formData.supplier ? `Supplier: ${formData.supplier}` : null,
        });

        // Update item quantity
        const updatedQuantity = item.quantity + cartItem.quantity;
        await updateItem.mutateAsync({
          id: item.id,
          quantity: updatedQuantity,
        });
      }

      // Reset form and cart
      setCart([]);
      setFormData({
        reference: "",
        date: new Date().toISOString().split("T")[0],
        supplier: "",
        notes: "",
      });

      toast.success(`${cart.length} item(s) received successfully under ${formData.reference}`);
    } catch (error) {
      toast.error("Failed to receive items. Please try again.");
    }
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Receiving</h1>
        <p className="text-muted-foreground mt-1">Record multiple incoming inventory items</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Receiving Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackagePlus className="w-5 h-5" />
              Receive Items
              {cart.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {cart.length} item(s)
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Receipt Header */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference No. (PO/DR)</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="PO-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date Received</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>

              <Separator />

              {/* Add Item to Cart Section */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <Label className="text-sm font-medium">Add Item to Cart</Label>

                <div className="space-y-2">
                  <Label htmlFor="item">Item</Label>
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
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
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    placeholder="0"
                    min="1"
                  />
                </div>

                <Button type="button" variant="outline" onClick={handleAddToCart} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add to Cart
                </Button>
              </div>

              {/* Cart Items */}
              {cart.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Cart Items ({totalCartItems} total qty)</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart.map((cartItem) => (
                      <div
                        key={cartItem.itemId}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{cartItem.itemName}</p>
                          <p className="text-xs text-muted-foreground">{cartItem.itemCode}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={cartItem.quantity}
                            onChange={(e) => handleUpdateCartQuantity(cartItem.itemId, parseInt(e.target.value) || 0)}
                            className="w-20 h-8 text-center"
                            min="1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromCart(cartItem.itemId)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              <Button type="submit" className="w-full gap-2" disabled={cart.length === 0}>
                <PackagePlus className="w-4 h-4" />
                Receive {cart.length} Item(s)
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Receipts
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Hide" : "Filter"}
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
                <ItemFilter
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  showCategoryFilter={false}
                  onClear={() => setSearchQuery("")}
                />
                <DateRangeFilter
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateFromChange={setDateFrom}
                  onDateToChange={setDateTo}
                  onClear={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                />
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredReceipts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery || dateFrom || dateTo ? "No matching receipts found" : "No receipts recorded yet"}
                </div>
              ) : (
                filteredReceipts.slice(0, 20).map((movement) => {
                  const item = items.find(i => i.id === movement.item_id);
                  return (
                    <div
                      key={movement.id}
                      className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                        <PackagePlus className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item?.item_name || "Unknown Item"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Reference: {movement.reference}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-success flex-shrink-0">
                            +{movement.quantity}
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
