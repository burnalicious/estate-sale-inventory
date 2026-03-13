export type SaleStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
export type ItemStatus = 'AVAILABLE' | 'SOLD' | 'WITHDRAWN';
export type ItemCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

export interface Sale {
  id: number;
  name: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zipCode: string;
  saleDate: string;
  status: SaleStatus;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaleCreate {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  saleDate: string;
  status: SaleStatus;
}

export interface Item {
  id: number;
  saleId: number;
  name: string;
  description: string | null;
  category: string | null;
  condition: ItemCondition | null;
  price: number;
  status: ItemStatus;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCreate {
  name: string;
  description?: string;
  category?: string;
  condition?: ItemCondition;
  price: number;
  status: ItemStatus;
  photoUrl?: string;
}
