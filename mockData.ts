
import { InventoryItem, AuditLog, RMAEntry } from './types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    sku: 'EL-001-PRO',
    name: 'Industrial Relay Switch',
    category: 'Electronics',
    quantity: 142,
    minStock: 50,
    location: { aisle: 'A1', shelf: 'S4', bin: 'B12' },
    description: 'Heavy-duty relay switch for industrial automation panels.',
    unitPrice: 24.50,
    lastUpdated: '2023-10-27T10:00:00Z'
  },
  {
    id: '2',
    sku: 'ME-992-HXS',
    name: 'M12 Titanium Hex Bolt',
    category: 'Mechanical',
    quantity: 1200,
    minStock: 2000,
    location: { aisle: 'B3', shelf: 'S1', bin: 'B05' },
    description: 'High-tensile titanium bolts for structural assembly.',
    unitPrice: 1.25,
    lastUpdated: '2023-10-27T11:30:00Z'
  },
  {
    id: '3',
    sku: 'SF-KIT-02',
    name: 'Standard Safety Goggles',
    category: 'Safety',
    quantity: 85,
    minStock: 20,
    location: { aisle: 'C2', shelf: 'S2', bin: 'B01' },
    description: 'ANSI Z87.1 certified protective eyewear.',
    unitPrice: 8.99,
    lastUpdated: '2023-10-26T09:15:00Z'
  }
];

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    itemId: '1',
    itemName: 'Industrial Relay Switch',
    sku: 'EL-001-PRO',
    type: 'IN',
    quantityDelta: 50,
    reason: 'Restock from Vendor X',
    timestamp: '2023-10-27T10:00:00Z',
    user: 'admin@warehouse.com'
  }
];

export const INITIAL_RMAS: RMAEntry[] = [
  {
    id: 'rma-1',
    itemId: '1',
    itemName: 'Industrial Relay Switch',
    sku: 'EL-001-PRO',
    quantity: 2,
    reason: 'DEFECTIVE',
    status: 'PENDING',
    timestamp: '2023-10-28T08:00:00Z',
    notes: 'Coil failure reported by client.'
  }
];
