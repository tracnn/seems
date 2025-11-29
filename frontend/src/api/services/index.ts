// Export all API services
export { authService } from './auth.service'
export { userService } from './user.service'
export { orderService } from './order.service'
export { productService } from './product.service'

// Re-export types for convenience
export type {
  // Common types
  BaseEntity,
  ApiResponse,
  PaginatedResponse,
  ApiError,
  QueryParams,
  PaginationParams,
  SortParams,
  SearchParams,
  FilterParams,
  
  // User types
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  
  // Auth types
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  
  // Order types
  Order,
  OrderStatus,
  OrderPriority,
  CreateOrderRequest,
  UpdateOrderRequest,
  
  // Product types
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  
  // Form types
  FormFieldError,
  ValidationError,
} from '../types'
