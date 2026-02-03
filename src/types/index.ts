export interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  unitCost: number;
  reorderLevel: number;
  status: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  reorderLevel: number;
  location: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  item_id: string;
  itemName?: string;
  movement_type: "received" | "issued";
  quantity: number;
  movement_date: string;
  reference: string;
  custodian?: string | null;
  department?: string | null;
  purpose?: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface Custodian {
  id: string;
  name: string;
  department: string;
  email: string | null;
  phone: string | null;
  position?: string | null;
  contactNumber?: string;
  itemsAssigned?: number;
  totalValue?: number;
  is_active?: boolean;
}

export interface DepartmentRequest {
  id: string;
  risNumber?: string;
  department: string;
  requestedBy: string;
  requestDate: string;
  items: RequestItem[];
  status: "pending" | "approved" | "rejected" | "fulfilled";
  remarks?: string;
  // Legacy fields for backward compatibility
  itemId?: string;
  itemName?: string;
  quantity?: number;
  purpose?: string;
  approvedBy?: string;
}

export interface RequestItem {
  id?: string;
  itemId?: string;
  item_id?: string;
  itemName: string;
  quantity: number;
  purpose: string;
}

export interface PhysicalCountItem {
  item_id: string;
  itemName?: string;
  counted_quantity: number;
  system_quantity: number;
  discrepancy?: number;
}

export interface PhysicalCount {
  id: string;
  countDate: string;
  countedBy: string;
  location: string;
  status: "Scheduled" | "In Progress" | "Completed";
  itemsCounted: number;
  discrepanciesFound: number;
  notes: string;
  items?: PhysicalCountItem[];
}
