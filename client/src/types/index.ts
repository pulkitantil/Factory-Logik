export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified?: boolean;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  featured: boolean;
  productCount?: number;
}

export interface ProductImage {
  id?: string;
  url: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  sku: string;
  description: string;
  price: number;
  mrp: number;
  discount: number;
  stock: number;
  rating: number;
  numReviews: number;
  featured: boolean;
  active: boolean;
  warranty?: string;
  specifications?: string;
  features?: string;
  whatsInTheBox?: string;
  primaryImage: string;
  images?: ProductImage[];
  category?: Category;
  parsedSpecs?: { [key: string]: string };
  parsedFeatures?: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: number;
    mrp: number;
    discount: number;
    stock: number;
    primaryImage: string;
  };
  itemTotal: number;
  mrpTotal: number;
}

export interface CartSummary {
  totalItems: number;
  mrpTotal: number;
  itemDiscount: number;
  subtotal: number;
  gstAmount: number;
  shippingFee: number;
  platformFee: number;
  finalAmount: number;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED' | string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate?: string;
  active: boolean;
  usageLimit?: number;
}

export interface TrackingEvent {
  id: string;
  status: string;
  city: string;
  location: string;
  description: string;
  timestamp: string;
}

export interface TrackingMilestone {
  key: string;
  label: string;
  completed: boolean;
  current: boolean;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  currentStatus: string;
  currentCity?: string;
  estimatedDelivery: string;
  updatedAt: string;
  events: TrackingEvent[];
  milestones: TrackingMilestone[];
  order?: {
    id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    deliverySpeed: string;
    estimatedDelivery: string;
    finalAmount: number;
    paymentMethod: string;
    items: {
      id: string;
      name: string;
      brand: string;
      image: string;
      price: number;
      quantity: number;
    }[];
    address?: {
      fullName: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  image?: string;
  price: number;
  mrp: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  deliverySpeed: string;
  estimatedDelivery: string;
  mrpTotal: number;
  itemDiscount: number;
  subtotal: number;
  gstAmount: number;
  shippingFee: number;
  platformFee: number;
  couponDiscount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  isGstClaimed: boolean;
  gstin?: string;
  businessName?: string;
  items: OrderItem[];
  address?: Address;
  tracking?: {
    trackingNumber: string;
    currentStatus: string;
    currentCity?: string;
    carrier: string;
    events: TrackingEvent[];
  };
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  user: {
    name: string;
  };
}
