export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
