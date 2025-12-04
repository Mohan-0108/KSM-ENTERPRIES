export enum TransactionType {
  INWARD = 'INWARD',
  OUTWARD = 'OUTWARD'
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  defaultBuyPrice: number;
  defaultSellPrice: number;
  currentStock: number;
}

export interface Contact {
  id: string;
  name: string;
  type: 'BUYER' | 'SELLER';
  email?: string;
  phone?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtTransaction: number;
}

export interface Transaction {
  id: string;
  date: number; // timestamp
  type: TransactionType;
  contactId: string;
  contactName: string;
  items: CartItem[];
  totalAmount: number;
  notes?: string;
}

export interface AppData {
  products: Product[];
  contacts: Contact[];
  transactions: Transaction[];
}