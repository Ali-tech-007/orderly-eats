export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
}

export interface OrderModifier {
  id: string;
  name: string;
  price?: number;
}

export interface OrderItem extends MenuItem {
  quantity: number;
  modifiers?: string[];
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'dirty';

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  orderId?: string;
  position: { x: number; y: number };
  shape: 'square' | 'round' | 'rectangle';
}

export interface Order {
  id: string;
  tableId?: string;
  items: OrderItem[];
  status: 'active' | 'sent' | 'paid';
  createdAt: Date;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
}

export type PaymentMethod = 'cash' | 'card';

export interface TipOption {
  label: string;
  percentage: number;
}

export interface SplitBillPerson {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
  paymentMethod?: PaymentMethod;
}

export interface PaymentData {
  method: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  tip: number;
  total: number;
  splitBetween?: SplitBillPerson[];
  cashTendered?: number;
  change?: number;
  cardLastFour?: string;
}

export interface Receipt {
  id: string;
  orderItems: OrderItem[];
  payment: PaymentData;
  tableName?: string;
  timestamp: Date;
  orderNumber: string;
}
