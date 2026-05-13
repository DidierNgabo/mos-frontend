export interface PharmacyStock {
  id: string;
  outreach: { id: string; name: string };
  medicationName: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  quantityInStock: number;
  lowStockThreshold: number;
  unitOfMeasure: string;
  category: string | null;
  manufacturer: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  isActive: boolean;
  isLowStock: boolean;
  lastUpdatedBy: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  transactionType: 'RESTOCK' | 'DISPENSE' | 'ADJUSTMENT' | 'EXPIRY_REMOVAL' | 'RETURN';
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  notes: string | null;
  performedBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface PharmacyStockState {
  list: PharmacyStock[];
  totalNumItems: number;
  isLoadingPharmacyStocks: boolean;
  isCreatingPharmacyStock: boolean;
  isUpdatingPharmacyStock: boolean;
  isDeletingPharmacyStock: boolean;
  pharmacyStockError: string | null;
}
