
export type Location = {
  aisle: string;
  shelf: string;
  bin: string;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  location: Location;
  description: string;
  unitPrice: number;
  lastUpdated: string;
  imageUrl?: string;
};

export type AuditLog = {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  type: 'IN' | 'OUT' | 'ADJUST' | 'RMA';
  quantityDelta: number;
  reason: string;
  timestamp: string;
  user: string;
};

export type RMAEntry = {
  id: string;
  originalOrderId?: string;
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  reason: 'DAMAGED' | 'DEFECTIVE' | 'WRONG_ITEM' | 'OTHER';
  status: 'PENDING' | 'INSPECTED' | 'REPLACED' | 'RESTOCKED' | 'SCRAPPED';
  timestamp: string;
  notes: string;
};

export type AppState = {
  inventory: InventoryItem[];
  logs: AuditLog[];
  rmas: RMAEntry[];
};
