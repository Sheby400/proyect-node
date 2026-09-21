export type Role = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  meta?: {
    count?: number
    requestId?: string
  }
}

export interface ApiErrorBody {
  success?: false
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
  message?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string
  price: number
  stock: number
  active: boolean
  categoryId?: string
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ProductPayload {
  sku: string
  name: string
  description: string
  price: number
  stock: number
  active: boolean
  categoryId?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  active: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CategoryPayload {
  name: string
  slug: string
  active: boolean
}

export interface CartItem {
  productId: string
  sku: string
  name: string
  price: number
  quantity: number
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  total: number
}

export interface OrderItem {
  productId: string
  sku: string
  name: string
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: string
  userId: string
  status: 'CREATED' | 'PAID' | 'CANCELLED' | string
  items: OrderItem[]
  total: number
  createdAt?: string | null
  updatedAt?: string | null
}
