import api from '../../../lib/axios';
import { Product } from '../../../types';

export interface CreateTransactionItemPayload {
  productId: number;
  quantity: number;
}

export interface CreateTransactionPayload {
  paymentMethod: string;
  amountTendered: number;
  items: CreateTransactionItemPayload[];
}

export interface TransactionItemResult {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface TransactionResult {
  id: number;
  transactionNumber: string;
  paymentMethod: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountTendered: number;
  change: number;
  status: string;
  transactionDate: string;
  items: TransactionItemResult[];
}

// Map backend ProductDto fields → frontend Product type
export const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<{ data: any[] }>('inventory/products');
  return data.data.map((p) => ({
    id: String(p.id),
    name: p.name,
    category: p.category,
    price: p.sellingPrice,
    stock: p.stock,
    sku: p.sku,
  }));
};

export const createTransaction = async (payload: CreateTransactionPayload): Promise<TransactionResult> => {
  const { data } = await api.post<{ data: TransactionResult }>('transaction', payload);
  return data.data;
};

export const getMyTodayTransactions = async (): Promise<TransactionResult[]> => {
  const { data } = await api.get<{ data: TransactionResult[] }>('transaction/my-today');
  return data.data ?? [];
};
