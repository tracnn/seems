// Common API Types
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  deletedAt?: string | null
}

// User Types
export interface User extends BaseEntity {
  accountNo: string
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  phone?: string
  avatar?: string
  role: string[]
  isActive: boolean
  lastLoginAt?: string
}

export interface CreateUserRequest {
  accountNo: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Auth Types
export interface LoginRequest {
  usernameOrEmail: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  user: {
    id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Order Types (for dashboard example)
export interface Order extends BaseEntity {
  orderNumber: string
  customerName: string
  customerEmail: string
  product: string
  quantity: number
  unitPrice: number
  totalAmount: number
  status: OrderStatus
  priority: OrderPriority
  orderDate: string
  deliveryDate?: string
  notes?: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface CreateOrderRequest {
  customerName: string
  customerEmail: string
  product: string
  quantity: number
  unitPrice: number
  priority?: OrderPriority
  notes?: string
}

export interface UpdateOrderRequest {
  status?: OrderStatus
  deliveryDate?: string
  notes?: string
}

// Product Types (for data table example)
export interface Product extends BaseEntity {
  name: string
  description?: string
  price: number
  category: string
  stock: number
  sku: string
  image?: string
  isActive: boolean
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  category: string
  stock: number
  sku: string
  image?: string
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  category?: string
  stock?: number
  image?: string
  isActive?: boolean
}

// Query Parameters
export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams {
  search?: string
  searchFields?: string[]
}

export interface FilterParams {
  [key: string]: any
}

export interface QueryParams extends PaginationParams, SortParams, SearchParams {
  filters?: FilterParams
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  message?: string
  status: number
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

// Form Types
export interface FormFieldError {
  field: string
  message: string
}

export interface ValidationError {
  message: string
  errors: FormFieldError[]
}
