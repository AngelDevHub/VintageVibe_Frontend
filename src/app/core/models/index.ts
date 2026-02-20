// ==================== AUTH ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// ==================== PRODUCT ====================
export interface ProductVariant {
  id: number;
  sku: string;
  size: string;
  color: string;
  material: string;
  price: number;
  discountPrice: number;
  stock: number;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  altText: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  conditionId: number;
  conditionName: string;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ==================== CATEGORY ====================
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

// ==================== BRAND ====================
export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
}

// ==================== CONDITION ====================
export interface ProductCondition {
  id: number;
  name: string;
  description: string;
}

// ==================== CART ====================
export interface CartItem {
  id: number;
  variantId: number;
  productName: string;
  variantSku: string;
  size: string;
  color: string;
  imageUrl: string;
  price: number;
  quantity: number;
  subtotal: number;
  stock: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface AddCartItemRequest {
  variantId: number;
  quantity: number;
}

// ==================== ORDER ====================
export interface OrderItem {
  id: number;
  variantId: number;
  productName: string;
  variantSku: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  subtotal: number;
  totalAmount: number;
  discountAmount: number;
  shippingCost: number;
  shippingFullName: string;
  shippingCity: string;
  shippingCountry: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CheckoutRequest {
  addressId: number;
  couponCode?: string;
  paymentMethod: string;
}

// ==================== ADDRESS ====================
export interface Address {
  id: number;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  addressType: string;
  isDefault: boolean;
}

// ==================== REVIEW ====================
export interface Review {
  id: number;
  userId: number;
  userName: string;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewRequest {
  productId: number;
  rating: number;
  comment: string;
}

// ==================== COUPON ====================
export interface Coupon {
  id: number;
  code: string;
  discount: number;
  percentage: boolean;
  expirationDate: string;
  active: boolean;
  minPurchaseAmount: number;
}

// ==================== PAYMENT ====================
export interface Payment {
  id: number;
  orderId: number;
  method: string;
  transactionId: string;
  status: string;
  amount: number;
  paidAt: string;
}

export interface PaymentRequest {
  orderId: number;
  method: string;
  transactionId: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

// ==================== DASHBOARD ====================
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}
