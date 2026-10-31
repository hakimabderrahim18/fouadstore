export interface ProductVariant {
  sizes?: string[];
  colors?: { name: string; hex?: string }[];
}

export interface Product {
  _id: string;
  name: string;
  nameAr?: string;
  slug?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  promoPrice?: number;
  images: string[];
  stock: number;
  category?: string;
  variants?: ProductVariant;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  nameAr?: string;
  price: number;
  promoPrice?: number;
  effectivePrice: number;
  image: string;
  stock: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type DeliveryMode = "domicile" | "bureau";

export interface OrderCustomer {
  fullName: string;
  phone: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  address: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image: string;
  itemTotal: number;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  customer: OrderCustomer;
  deliveryMode: DeliveryMode;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: "en attente" | "confirmée" | "expédiée" | "livrée" | "annulée";
  createdAt?: string;
  updatedAt?: string;
}

export interface Wilaya {
  code: string;
  name: string;
  nameAr: string;
  homeDeliveryFee: number;
  deskDeliveryFee: number;
  communes: string[];
}
