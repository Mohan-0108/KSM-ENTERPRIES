import { AppData, Product, Contact, Transaction, TransactionType } from '../types';

const STORAGE_KEY = 'stockflow_data_v1';

const SEED_DATA: AppData = {
  products: [
    { id: 'p1', name: 'Wireless Mouse', sku: 'TECH-001', category: 'Electronics', description: 'Ergonomic wireless mouse', defaultBuyPrice: 15, defaultSellPrice: 35, currentStock: 120 },
    { id: 'p2', name: 'Mechanical Keyboard', sku: 'TECH-002', category: 'Electronics', description: 'RGB Mechanical Keyboard', defaultBuyPrice: 45, defaultSellPrice: 120, currentStock: 45 },
    { id: 'p3', name: 'Office Chair', sku: 'FUR-001', category: 'Furniture', description: 'Mesh back office chair', defaultBuyPrice: 80, defaultSellPrice: 199, currentStock: 12 },
    { id: 'p4', name: 'USB-C Cable', sku: 'ACC-001', category: 'Accessories', description: '2m Braided Cable', defaultBuyPrice: 2, defaultSellPrice: 10, currentStock: 500 },
  ],
  contacts: [
    { id: 'c1', name: 'TechSuppliers Inc.', type: 'SELLER', email: 'sales@techsuppliers.com' },
    { id: 'c2', name: 'Global Importers Ltd.', type: 'SELLER', email: 'orders@global.com' },
    { id: 'c3', name: 'Alice Smith', type: 'BUYER', email: 'alice@example.com' },
    { id: 'c4', name: 'Bob Jones', type: 'BUYER', email: 'bob@example.com' },
  ],
  transactions: [
    // Seed some history for the chart
    {
      id: 't1',
      date: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
      type: TransactionType.OUTWARD,
      contactId: 'c3',
      contactName: 'Alice Smith',
      totalAmount: 155,
      items: [
        { productId: 'p1', productName: 'Wireless Mouse', quantity: 1, priceAtTransaction: 35 },
        { productId: 'p2', productName: 'Mechanical Keyboard', quantity: 1, priceAtTransaction: 120 }
      ]
    },
    {
      id: 't2',
      date: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
      type: TransactionType.OUTWARD,
      contactId: 'c4',
      contactName: 'Bob Jones',
      totalAmount: 70,
      items: [
        { productId: 'p1', productName: 'Wireless Mouse', quantity: 2, priceAtTransaction: 35 }
      ]
    }
  ]
};

export const getAppData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return SEED_DATA;
};

export const saveAppData = (data: AppData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addTransaction = (transaction: Transaction, currentData: AppData): AppData => {
  const newData = { ...currentData };
  newData.transactions = [transaction, ...newData.transactions];

  // Update stock levels
  transaction.items.forEach(item => {
    const productIndex = newData.products.findIndex(p => p.id === item.productId);
    if (productIndex > -1) {
      const product = newData.products[productIndex];
      if (transaction.type === TransactionType.INWARD) {
        product.currentStock += item.quantity;
      } else {
        product.currentStock -= item.quantity;
      }
    }
  });

  saveAppData(newData);
  return newData;
};