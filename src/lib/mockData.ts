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
  itemId: string;
  itemName: string;
  type: "received" | "issued";
  quantity: number;
  date: string;
  reference: string;
  custodian?: string;
}

export interface Custodian {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  itemsAssigned: number;
  totalValue: number;
}

// Mock data
export const mockItems: InventoryItem[] = [
  {
    id: "1",
    itemCode: "OFF-001",
    itemName: "A4 Bond Paper (500 sheets)",
    category: "Office Supplies",
    unit: "ream",
    quantity: 150,
    unitCost: 220,
    totalValue: 33000,
    reorderLevel: 50,
    location: "Warehouse A",
    status: "In Stock",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    itemCode: "OFF-002",
    itemName: "Ballpoint Pen (Blue)",
    category: "Office Supplies",
    unit: "box",
    quantity: 25,
    unitCost: 150,
    totalValue: 3750,
    reorderLevel: 30,
    location: "Warehouse A",
    status: "Low Stock",
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    itemCode: "EQP-001",
    itemName: "Desktop Computer",
    category: "Equipment",
    unit: "unit",
    quantity: 45,
    unitCost: 35000,
    totalValue: 1575000,
    reorderLevel: 5,
    location: "IT Storage",
    status: "In Stock",
    lastUpdated: "2024-01-13",
  },
  {
    id: "4",
    itemCode: "OFF-003",
    itemName: "Stapler Wire",
    category: "Office Supplies",
    unit: "box",
    quantity: 10,
    unitCost: 50,
    totalValue: 500,
    reorderLevel: 20,
    location: "Warehouse A",
    status: "Low Stock",
    lastUpdated: "2024-01-12",
  },
  {
    id: "5",
    itemCode: "PPE-001",
    itemName: "Face Mask (Surgical)",
    category: "PPE",
    unit: "box",
    quantity: 200,
    unitCost: 300,
    totalValue: 60000,
    reorderLevel: 50,
    location: "Medical Storage",
    status: "In Stock",
    lastUpdated: "2024-01-15",
  },
];

export const mockStockMovements: StockMovement[] = [
  {
    id: "1",
    itemId: "1",
    itemName: "A4 Bond Paper (500 sheets)",
    type: "received",
    quantity: 50,
    date: "2024-01-15",
    reference: "PO-2024-001",
  },
  {
    id: "2",
    itemId: "2",
    itemName: "Ballpoint Pen (Blue)",
    type: "issued",
    quantity: 10,
    date: "2024-01-14",
    reference: "RIS-2024-005",
    custodian: "Juan Dela Cruz",
  },
  {
    id: "3",
    itemId: "3",
    itemName: "Desktop Computer",
    type: "received",
    quantity: 5,
    date: "2024-01-13",
    reference: "PO-2024-002",
  },
  {
    id: "4",
    itemId: "4",
    itemName: "Stapler Wire",
    type: "issued",
    quantity: 5,
    date: "2024-01-12",
    reference: "RIS-2024-004",
    custodian: "Maria Santos",
  },
];

export const mockCustodians: Custodian[] = [
  {
    id: "1",
    name: "Juan Dela Cruz",
    department: "Human Resources",
    email: "juan.delacruz@tayabas.gov",
    phone: "+63 912 345 6789",
    itemsAssigned: 15,
    totalValue: 45000,
  },
  {
    id: "2",
    name: "Maria Santos",
    department: "Finance",
    email: "maria.santos@tayabas.gov",
    phone: "+63 923 456 7890",
    itemsAssigned: 22,
    totalValue: 78000,
  },
  {
    id: "3",
    name: "Pedro Reyes",
    department: "IT Department",
    email: "pedro.reyes@tayabas.gov",
    phone: "+63 934 567 8901",
    itemsAssigned: 8,
    totalValue: 280000,
  },
];

// Chart data
export const monthlyStockMovement = [
  { month: "Jul", received: 150, issued: 120 },
  { month: "Aug", received: 180, issued: 145 },
  { month: "Sep", received: 165, issued: 150 },
  { month: "Oct", received: 200, issued: 170 },
  { month: "Nov", received: 220, issued: 190 },
  { month: "Dec", received: 195, issued: 175 },
  { month: "Jan", received: 210, issued: 160 },
];

export const categoryDistribution = [
  { name: "Office Supplies", value: 450, fill: "hsl(var(--chart-1))" },
  { name: "Equipment", value: 180, fill: "hsl(var(--chart-2))" },
  { name: "PPE", value: 280, fill: "hsl(var(--chart-3))" },
  { name: "Cleaning Supplies", value: 150, fill: "hsl(var(--chart-4))" },
  { name: "Others", value: 90, fill: "hsl(var(--chart-5))" },
];

export const topIssuedItems = [
  { name: "A4 Bond Paper", count: 450 },
  { name: "Ballpoint Pen", count: 380 },
  { name: "Folder", count: 320 },
  { name: "Stapler Wire", count: 280 },
  { name: "Printer Ink", count: 250 },
  { name: "Envelope", count: 220 },
  { name: "Tape", count: 180 },
  { name: "Paper Clip", count: 160 },
  { name: "Rubber Band", count: 140 },
  { name: "Correction Fluid", count: 120 },
];

export const custodianAssets = [
  { name: "Human Resources", value: 45, fill: "hsl(var(--chart-1))" },
  { name: "Finance", value: 32, fill: "hsl(var(--chart-2))" },
  { name: "IT Department", value: 28, fill: "hsl(var(--chart-3))" },
  { name: "Engineering", value: 25, fill: "hsl(var(--chart-4))" },
  { name: "Others", value: 20, fill: "hsl(var(--chart-5))" },
];
