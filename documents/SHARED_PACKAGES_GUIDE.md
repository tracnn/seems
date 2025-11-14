# Hướng Dẫn Shared Packages cho Dự Án Microservices

## Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc Tổng Thể](#kiến-trúc-tổng-thể)
3. [Các Packages Cần Thiết](#các-packages-cần-thiết)
4. [Setup & Configuration](#setup--configuration)
5. [Implementation Chi Tiết](#implementation-chi-tiết)
6. [Versioning & Publishing](#versioning--publishing)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Tổng Quan

### Shared Packages là gì?

**Shared Packages** là các thư viện dùng chung giữa các microservices trong hệ thống, giúp:

- ✅ **Tránh duplicate code**: Không phải viết lại cùng một logic ở nhiều nơi
- ✅ **Đảm bảo consistency**: Tất cả services sử dụng cùng chuẩn
- ✅ **Type-safe**: TypeScript types được chia sẻ giữa các services
- ✅ **Dễ maintain**: Sửa một chỗ, cập nhật mọi nơi
- ✅ **Faster development**: Developers tập trung vào business logic

### Khi nào cần Shared Packages?

```
✅ NÊN DÙNG khi:
├── Hệ thống có 3+ microservices
├── Cần API contracts chuẩn hóa
├── Cần error handling nhất quán
├── Team có 5+ developers
└── Dự án dài hạn (1+ năm)

⚠️ CÓ THỂ BỎ QUA khi:
├── Chỉ có 1-2 services
├── Prototype/MVP nhanh
├── Team < 3 người
└── Mỗi service dùng tech stack khác nhau
```

---

## Kiến Trúc Tổng Thể

### Cấu Trúc Repository

```
your-company-microservices/
│
├── shared-packages/                    (Git Repository 1: Monorepo cho packages)
│   ├── packages/
│   │   ├── shared-types/              # Common types, interfaces, enums
│   │   ├── shared-dto/                # Data Transfer Objects
│   │   ├── shared-entities/           # Base entities
│   │   ├── shared-exceptions/         # Custom exceptions
│   │   ├── shared-decorators/         # Custom decorators
│   │   ├── shared-guards/             # Auth guards
│   │   ├── shared-interceptors/       # HTTP interceptors
│   │   ├── shared-filters/            # Exception filters
│   │   ├── shared-utils/              # Utility functions
│   │   ├── shared-events/             # Event definitions
│   │   └── shared-validators/         # Custom validators
│   ├── pnpm-workspace.yaml
│   ├── package.json
│   └── tsconfig.base.json
│
├── api-gateway/                        (Git Repository 2)
│   ├── package.json
│   │   └── dependencies:
│   │       - @your-company/shared-types: ^1.0.0
│   │       - @your-company/shared-dto: ^1.0.0
│   └── src/
│
├── auth-service/                       (Git Repository 3)
│   ├── package.json
│   │   └── dependencies:
│   │       - @your-company/shared-types: ^1.0.0
│   │       - @your-company/shared-dto: ^1.0.0
│   │       - @your-company/shared-entities: ^1.0.0
│   └── src/
│
└── order-service/                      (Git Repository 4)
    └── ... (tương tự)
```

### Dependency Graph

```
                    Microservices
                    ┌──────────────────┐
                    │  API Gateway     │
                    │  Auth Service    │
                    │  Order Service   │
                    │  Payment Service │
                    └────────┬─────────┘
                             │ depends on
                             ▼
                    ┌──────────────────┐
                    │ Shared Packages  │
                    │                  │
                    │ - shared-types   │
                    │ - shared-dto     │
                    │ - shared-utils   │
                    │ - ... etc        │
                    └──────────────────┘
                             │
                             ▼
                    Published to npm registry
                    (GitHub Packages / npm)
```

---

## Các Packages Cần Thiết

### Priority Matrix

| Package | Priority | Dependencies | Use Case |
|---------|----------|--------------|----------|
| **shared-types** | ⭐⭐⭐⭐⭐ Critical | None | Base types, enums, interfaces |
| **shared-dto** | ⭐⭐⭐⭐⭐ Critical | shared-types, class-validator | API contracts |
| **shared-exceptions** | ⭐⭐⭐⭐⭐ Critical | shared-types | Error handling |
| **shared-decorators** | ⭐⭐⭐⭐ High | shared-types | Code reusability |
| **shared-guards** | ⭐⭐⭐⭐ High | shared-types | Authentication |
| **shared-interceptors** | ⭐⭐⭐⭐ High | None | Cross-cutting concerns |
| **shared-filters** | ⭐⭐⭐⭐ High | shared-exceptions | Error formatting |
| **shared-utils** | ⭐⭐⭐⭐ High | None | Helper functions |
| **shared-entities** | ⭐⭐⭐⭐ High | typeorm | Database models |
| **shared-events** | ⭐⭐⭐ Medium | shared-types | Event-driven architecture |
| **shared-validators** | ⭐⭐⭐ Medium | class-validator | Custom validations |
| **shared-config** | ⭐⭐ Low | None | Configuration utilities |
| **shared-testing** | ⭐⭐ Low | jest | Test utilities |

### Development Timeline

**Week 1: Foundation (Critical packages)**
```bash
Day 1-2: shared-types          # 2 days
Day 3-4: shared-dto            # 2 days  
Day 5:   shared-exceptions     # 1 day
```

**Week 2: Core Features (High priority)**
```bash
Day 1:   shared-decorators     # 1 day
Day 2:   shared-guards         # 1 day
Day 3-4: shared-interceptors   # 2 days
Day 5:   shared-filters        # 1 day
```

**Week 3: Utilities (High priority)**
```bash
Day 1-2: shared-utils          # 2 days
Day 3:   shared-entities       # 1 day
Day 4-5: shared-events         # 2 days
```

**Week 4+: Optional (Medium/Low priority)**
```bash
- shared-validators
- shared-config
- shared-testing
- Additional packages as needed
```

---

## Setup & Configuration

### Bước 1: Tạo Shared Packages Repository

#### 1.1. Initialize Repository

```bash
# Tạo thư mục và khởi tạo git
mkdir shared-packages
cd shared-packages
git init

# Initialize pnpm workspace
pnpm init

# Tạo cấu trúc packages
mkdir -p packages/shared-types/src
mkdir -p packages/shared-dto/src
mkdir -p packages/shared-entities/src
mkdir -p packages/shared-exceptions/src
mkdir -p packages/shared-decorators/src
mkdir -p packages/shared-guards/src
mkdir -p packages/shared-interceptors/src
mkdir -p packages/shared-filters/src
mkdir -p packages/shared-utils/src
mkdir -p packages/shared-events/src
```

#### 1.2. Root package.json

```json
{
  "name": "@your-company/shared-packages",
  "version": "1.0.0",
  "private": true,
  "description": "Shared packages for microservices architecture",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "pnpm -r run build",
    "clean": "pnpm -r run clean && rm -rf node_modules packages/*/node_modules",
    "test": "pnpm -r run test",
    "test:watch": "pnpm -r run test:watch",
    "lint": "eslint 'packages/**/src/**/*.ts'",
    "lint:fix": "eslint 'packages/**/src/**/*.ts' --fix",
    "format": "prettier --write 'packages/**/src/**/*.{ts,json}'",
    "version:patch": "pnpm -r exec npm version patch",
    "version:minor": "pnpm -r exec npm version minor",
    "version:major": "pnpm -r exec npm version major",
    "publish:all": "pnpm -r publish --access restricted",
    "check-updates": "pnpm -r exec npm outdated"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "rimraf": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

#### 1.3. pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
```

#### 1.4. tsconfig.base.json

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

#### 1.5. .npmrc (cho GitHub Packages)

```ini
# GitHub Packages configuration
@your-company:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

# Hoặc nếu dùng npm private packages:
# registry=https://registry.npmjs.org/
# //registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

#### 1.6. .gitignore

```
# Dependencies
node_modules/
packages/*/node_modules/

# Build outputs
dist/
packages/*/dist/
*.tsbuildinfo

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Testing
coverage/
.nyc_output/
```

#### 1.7. .eslintrc.js

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prettier/prettier': 'error',
  },
};
```

#### 1.8. .prettierrc

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

## Implementation Chi Tiết

### Package 1: @your-company/shared-types ⭐⭐⭐⭐⭐

**Mục đích:** Foundation package chứa tất cả types, interfaces, enums cơ bản. Package này KHÔNG có dependencies.

#### Structure

```
packages/shared-types/
├── src/
│   ├── index.ts                    # Export tất cả
│   ├── enums/
│   │   ├── index.ts
│   │   ├── service-name.enum.ts
│   │   ├── error-code.enum.ts
│   │   ├── user-role.enum.ts
│   │   ├── order-status.enum.ts
│   │   ├── payment-status.enum.ts
│   │   └── event-type.enum.ts
│   ├── interfaces/
│   │   ├── index.ts
│   │   ├── base-response.interface.ts
│   │   ├── pagination.interface.ts
│   │   ├── jwt-payload.interface.ts
│   │   ├── event.interface.ts
│   │   └── audit-log.interface.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── utility-types.ts
│   └── constants/
│       ├── index.ts
│       ├── http-status.constant.ts
│       ├── pagination.constant.ts
│       └── token-config.constant.ts
├── package.json
├── tsconfig.json
└── README.md
```

#### package.json

```json
{
  "name": "@your-company/shared-types",
  "version": "1.0.0",
  "description": "Shared types, interfaces, enums and constants",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rimraf dist",
    "prepublishOnly": "pnpm run clean && pnpm run build"
  },
  "keywords": [
    "microservices",
    "types",
    "typescript",
    "shared"
  ],
  "author": "Your Company",
  "license": "UNLICENSED",
  "publishConfig": {
    "access": "restricted",
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-company/shared-packages"
  },
  "files": [
    "dist",
    "README.md"
  ],
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

#### tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

#### src/enums/service-name.enum.ts

```typescript
/**
 * Service names trong hệ thống microservices
 * Sử dụng để identify services trong logs, tracing, và communication
 */
export enum ServiceName {
  API_GATEWAY = 'api-gateway',
  AUTH_SERVICE = 'auth-service',
  IAM_SERVICE = 'iam-service',
  CATALOG_SERVICE = 'catalog-service',
  ORDER_SERVICE = 'order-service',
  PAYMENT_SERVICE = 'payment-service',
  SHIPPING_SERVICE = 'shipping-service',
  NOTIFICATION_SERVICE = 'notification-service',
  ANALYTICS_SERVICE = 'analytics-service',
  INVENTORY_SERVICE = 'inventory-service',
  CUSTOMER_SERVICE = 'customer-service',
}
```

#### src/enums/error-code.enum.ts

```typescript
/**
 * Standardized error codes across all services
 * Format: {SERVICE_PREFIX}_{ERROR_NAME}
 * 
 * Prefixes:
 * - CMN: Common errors (dùng cho tất cả services)
 * - AUTH: Authentication/Authorization errors
 * - ORD: Order service errors
 * - PAY: Payment service errors
 * - SHP: Shipping service errors
 * - INV: Inventory service errors
 */
export enum ErrorCode {
  // ============ Common Errors (CMN_) ============
  CMN_INTERNAL_SERVER_ERROR = 'CMN_INTERNAL_SERVER_ERROR',
  CMN_VALIDATION_ERROR = 'CMN_VALIDATION_ERROR',
  CMN_NOT_FOUND = 'CMN_NOT_FOUND',
  CMN_BAD_REQUEST = 'CMN_BAD_REQUEST',
  CMN_UNAUTHORIZED = 'CMN_UNAUTHORIZED',
  CMN_FORBIDDEN = 'CMN_FORBIDDEN',
  CMN_CONFLICT = 'CMN_CONFLICT',
  CMN_TOO_MANY_REQUESTS = 'CMN_TOO_MANY_REQUESTS',
  CMN_SERVICE_UNAVAILABLE = 'CMN_SERVICE_UNAVAILABLE',
  CMN_TIMEOUT = 'CMN_TIMEOUT',

  // ============ Auth Service Errors (AUTH_) ============
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  AUTH_ACCOUNT_LOCKED = 'AUTH_ACCOUNT_LOCKED',
  AUTH_ACCOUNT_NOT_ACTIVATED = 'AUTH_ACCOUNT_NOT_ACTIVATED',
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_USERNAME_ALREADY_EXISTS = 'AUTH_USERNAME_ALREADY_EXISTS',
  AUTH_WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
  AUTH_PASSWORD_MISMATCH = 'AUTH_PASSWORD_MISMATCH',
  AUTH_REFRESH_TOKEN_INVALID = 'AUTH_REFRESH_TOKEN_INVALID',
  AUTH_EMAIL_NOT_VERIFIED = 'AUTH_EMAIL_NOT_VERIFIED',

  // ============ IAM Service Errors (IAM_) ============
  IAM_PERMISSION_DENIED = 'IAM_PERMISSION_DENIED',
  IAM_ROLE_NOT_FOUND = 'IAM_ROLE_NOT_FOUND',
  IAM_INSUFFICIENT_PERMISSIONS = 'IAM_INSUFFICIENT_PERMISSIONS',
  IAM_ROLE_ALREADY_EXISTS = 'IAM_ROLE_ALREADY_EXISTS',
  IAM_CANNOT_DELETE_DEFAULT_ROLE = 'IAM_CANNOT_DELETE_DEFAULT_ROLE',

  // ============ Order Service Errors (ORD_) ============
  ORD_ORDER_NOT_FOUND = 'ORD_ORDER_NOT_FOUND',
  ORD_INVALID_STATUS = 'ORD_INVALID_STATUS',
  ORD_CANNOT_CANCEL = 'ORD_CANNOT_CANCEL',
  ORD_ALREADY_CANCELLED = 'ORD_ALREADY_CANCELLED',
  ORD_ALREADY_COMPLETED = 'ORD_ALREADY_COMPLETED',
  ORD_OUT_OF_STOCK = 'ORD_OUT_OF_STOCK',
  ORD_INVALID_QUANTITY = 'ORD_INVALID_QUANTITY',
  ORD_MINIMUM_ORDER_NOT_MET = 'ORD_MINIMUM_ORDER_NOT_MET',

  // ============ Payment Service Errors (PAY_) ============
  PAY_PAYMENT_FAILED = 'PAY_PAYMENT_FAILED',
  PAY_INSUFFICIENT_FUNDS = 'PAY_INSUFFICIENT_FUNDS',
  PAY_INVALID_CARD = 'PAY_INVALID_CARD',
  PAY_CARD_EXPIRED = 'PAY_CARD_EXPIRED',
  PAY_PAYMENT_METHOD_NOT_FOUND = 'PAY_PAYMENT_METHOD_NOT_FOUND',
  PAY_REFUND_FAILED = 'PAY_REFUND_FAILED',
  PAY_ALREADY_REFUNDED = 'PAY_ALREADY_REFUNDED',
  PAY_TRANSACTION_NOT_FOUND = 'PAY_TRANSACTION_NOT_FOUND',

  // ============ Shipping Service Errors (SHP_) ============
  SHP_INVALID_ADDRESS = 'SHP_INVALID_ADDRESS',
  SHP_SHIPPING_NOT_AVAILABLE = 'SHP_SHIPPING_NOT_AVAILABLE',
  SHP_TRACKING_NOT_FOUND = 'SHP_TRACKING_NOT_FOUND',
  SHP_DELIVERY_FAILED = 'SHP_DELIVERY_FAILED',

  // ============ Inventory Service Errors (INV_) ============
  INV_PRODUCT_NOT_FOUND = 'INV_PRODUCT_NOT_FOUND',
  INV_INSUFFICIENT_STOCK = 'INV_INSUFFICIENT_STOCK',
  INV_PRODUCT_DISCONTINUED = 'INV_PRODUCT_DISCONTINUED',
  INV_INVALID_SKU = 'INV_INVALID_SKU',
}
```

#### src/enums/user-role.enum.ts

```typescript
/**
 * User roles in the system
 * Ordered by permission level (highest to lowest)
 */
export enum UserRole {
  /** Super admin - Full system access */
  SUPER_ADMIN = 'SUPER_ADMIN',
  
  /** Admin - Administrative access */
  ADMIN = 'ADMIN',
  
  /** Moderator - Content moderation */
  MODERATOR = 'MODERATOR',
  
  /** Regular user */
  USER = 'USER',
  
  /** Guest user - Limited access */
  GUEST = 'GUEST',
}

/**
 * Role hierarchy for permission checking
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 80,
  [UserRole.MODERATOR]: 60,
  [UserRole.USER]: 40,
  [UserRole.GUEST]: 20,
};
```

#### src/enums/order-status.enum.ts

```typescript
/**
 * Order status lifecycle
 */
export enum OrderStatus {
  /** Order created, waiting for payment */
  PENDING = 'PENDING',
  
  /** Payment confirmed */
  CONFIRMED = 'CONFIRMED',
  
  /** Order is being processed */
  PROCESSING = 'PROCESSING',
  
  /** Order has been shipped */
  SHIPPED = 'SHIPPED',
  
  /** Order delivered successfully */
  DELIVERED = 'DELIVERED',
  
  /** Order cancelled by user or system */
  CANCELLED = 'CANCELLED',
  
  /** Order refunded */
  REFUNDED = 'REFUNDED',
}

/**
 * Valid status transitions
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};
```

#### src/enums/payment-status.enum.ts

```typescript
/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

/**
 * Payment methods
 */
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  E_WALLET = 'E_WALLET',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}
```

#### src/enums/event-type.enum.ts

```typescript
/**
 * Event types for event-driven architecture
 * Format: {DOMAIN}.{ACTION}
 */
export enum EventType {
  // ============ User Events ============
  USER_REGISTERED = 'user.registered',
  USER_ACTIVATED = 'user.activated',
  USER_DEACTIVATED = 'user.deactivated',
  USER_DELETED = 'user.deleted',
  USER_PASSWORD_CHANGED = 'user.password_changed',
  USER_EMAIL_VERIFIED = 'user.email_verified',
  USER_PROFILE_UPDATED = 'user.profile_updated',

  // ============ Order Events ============
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_CONFIRMED = 'order.confirmed',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_COMPLETED = 'order.completed',
  ORDER_SHIPPED = 'order.shipped',
  ORDER_DELIVERED = 'order.delivered',

  // ============ Payment Events ============
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_PROCESSING = 'payment.processing',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',

  // ============ Inventory Events ============
  INVENTORY_UPDATED = 'inventory.updated',
  INVENTORY_LOW_STOCK = 'inventory.low_stock',
  INVENTORY_OUT_OF_STOCK = 'inventory.out_of_stock',

  // ============ Notification Events ============
  NOTIFICATION_EMAIL_SENT = 'notification.email_sent',
  NOTIFICATION_SMS_SENT = 'notification.sms_sent',
  NOTIFICATION_PUSH_SENT = 'notification.push_sent',
}
```

#### src/interfaces/base-response.interface.ts

```typescript
/**
 * Standard API response format
 * All API endpoints should return this format
 */
export interface BaseResponse<T = any> {
  /** HTTP status code */
  statusCode: number;

  /** Human-readable message */
  message: string;

  /** Response data (optional) */
  data?: T;

  /** Error details (only present on errors) */
  error?: ErrorDetail;

  /** ISO timestamp */
  timestamp: string;

  /** Request path */
  path?: string;

  /** Correlation ID for distributed tracing */
  correlationId?: string;
}

/**
 * Error detail structure
 */
export interface ErrorDetail {
  /** Error code from ErrorCode enum */
  code: string;

  /** Detailed error message */
  message: string;

  /** Additional error details */
  details?: Record<string, any>;

  /** Stack trace (only in development) */
  stack?: string;
}
```

#### src/interfaces/pagination.interface.ts

```typescript
/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  /** Page number (1-based) */
  page: number;

  /** Items per page */
  limit: number;

  /** Sort field */
  sort?: string;

  /** Sort order */
  order?: 'ASC' | 'DESC';
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Total number of items */
  total: number;

  /** Current page number */
  page: number;

  /** Items per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there is a next page */
  hasNextPage: boolean;

  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  data: T[];

  /** Pagination metadata */
  meta: PaginationMeta;
}
```

#### src/interfaces/jwt-payload.interface.ts

```typescript
import { UserRole } from '../enums';

/**
 * JWT token payload structure
 */
export interface JwtPayload {
  /** User ID (subject) */
  sub: string;

  /** Username */
  username: string;

  /** Email address */
  email: string;

  /** User roles */
  roles: UserRole[];

  /** Specific permissions (optional) */
  permissions?: string[];

  /** Issued at (Unix timestamp) */
  iat?: number;

  /** Expiration time (Unix timestamp) */
  exp?: number;

  /** Issuer (which service issued the token) */
  iss?: string;

  /** Audience (intended recipient) */
  aud?: string;

  /** Token ID (for revocation) */
  jti?: string;
}

/**
 * Refresh token payload
 */
export interface RefreshTokenPayload {
  /** User ID */
  sub: string;

  /** Token ID */
  jti: string;

  /** Issued at */
  iat?: number;

  /** Expiration time */
  exp?: number;
}
```

#### src/interfaces/event.interface.ts

```typescript
import { EventType, ServiceName } from '../enums';

/**
 * Base event structure for event-driven architecture
 */
export interface BaseEvent<T = any> {
  /** Event type */
  type: EventType;

  /** Event data */
  data: T;

  /** Event timestamp */
  timestamp: Date;

  /** Correlation ID for tracing */
  correlationId: string;

  /** User ID who triggered the event (optional) */
  userId?: string;

  /** Service that emitted the event */
  serviceId: ServiceName;

  /** Event schema version */
  version: string;

  /** Event metadata */
  metadata?: Record<string, any>;
}

/**
 * Event handler interface
 */
export interface IEventHandler<T extends BaseEvent> {
  handle(event: T): Promise<void>;
}
```

#### src/interfaces/audit-log.interface.ts

```typescript
/**
 * Audit log entry for tracking changes
 */
export interface AuditLog {
  /** Unique ID */
  id: string;

  /** Entity type (e.g., 'User', 'Order') */
  entityType: string;

  /** Entity ID */
  entityId: string;

  /** Action performed */
  action: AuditAction;

  /** User who performed the action */
  userId: string;

  /** Username */
  userName: string;

  /** Changes made (before/after) */
  changes?: AuditChanges;

  /** IP address */
  ipAddress?: string;

  /** User agent */
  userAgent?: string;

  /** Timestamp */
  timestamp: Date;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Audit actions
 */
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

/**
 * Audit changes structure
 */
export interface AuditChanges {
  /** Previous values */
  before?: Record<string, any>;

  /** New values */
  after?: Record<string, any>;
}
```

#### src/types/utility-types.ts

```typescript
/**
 * Utility types for TypeScript
 */

/** Makes all properties nullable */
export type Nullable<T> = T | null;

/** Makes all properties optional */
export type Optional<T> = T | undefined;

/** Makes all properties nullable or undefined */
export type Maybe<T> = T | null | undefined;

/** Deep partial type */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Deep readonly type */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/** Extract keys of T where value is of type U */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/** Make specific keys required */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Make specific keys optional */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Entity ID type (UUID) */
export type EntityId = string;

/** Timestamp type */
export type Timestamp = Date | string;

/** Omit multiple keys */
export type OmitMultiple<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/** Constructor type */
export type Constructor<T = any> = new (...args: any[]) => T;

/** Function type */
export type AnyFunction = (...args: any[]) => any;

/** Async function type */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

/** Value of object type */
export type ValueOf<T> = T[keyof T];
```

#### src/constants/http-status.constant.ts

```typescript
/**
 * HTTP status codes constants
 */
export const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
```

#### src/constants/pagination.constant.ts

```typescript
/**
 * Default pagination configuration
 */
export const DEFAULT_PAGINATION = {
  /** Default page number */
  PAGE: 1,

  /** Default items per page */
  LIMIT: 10,

  /** Maximum items per page */
  MAX_LIMIT: 100,

  /** Default sort order */
  ORDER: 'DESC' as const,
} as const;
```

#### src/constants/token-config.constant.ts

```typescript
/**
 * Token expiration configuration
 */
export const TOKEN_CONFIG = {
  /** Access token expiration (15 minutes) */
  ACCESS_TOKEN_EXPIRY: '15m',

  /** Refresh token expiration (7 days) */
  REFRESH_TOKEN_EXPIRY: '7d',

  /** Reset password token expiration (1 hour) */
  RESET_PASSWORD_TOKEN_EXPIRY: '1h',

  /** Email verification token expiration (24 hours) */
  EMAIL_VERIFICATION_TOKEN_EXPIRY: '24h',

  /** Remember me token expiration (30 days) */
  REMEMBER_ME_TOKEN_EXPIRY: '30d',
} as const;
```

#### src/index.ts

```typescript
// Export all enums
export * from './enums';

// Export all interfaces
export * from './interfaces';

// Export all types
export * from './types';

// Export all constants
export * from './constants';
```

#### README.md

```markdown
# @your-company/shared-types

Shared types, interfaces, enums, and constants for microservices architecture.

## Installation

```bash
npm install @your-company/shared-types
# or
pnpm add @your-company/shared-types
```

## Usage

```typescript
import {
  ServiceName,
  ErrorCode,
  UserRole,
  BaseResponse,
  JwtPayload,
  HTTP_STATUS,
} from '@your-company/shared-types';

// Use enums
const serviceName = ServiceName.AUTH_SERVICE;
const errorCode = ErrorCode.AUTH_USER_NOT_FOUND;

// Use interfaces
const response: BaseResponse<User> = {
  statusCode: HTTP_STATUS.OK,
  message: 'Success',
  data: user,
  timestamp: new Date().toISOString(),
};

// Use JWT payload
const payload: JwtPayload = {
  sub: userId,
  username: 'john.doe',
  email: 'john@example.com',
  roles: [UserRole.USER],
};
```

## Features

- ✅ Zero dependencies
- ✅ Full TypeScript support
- ✅ Comprehensive type definitions
- ✅ Standardized error codes
- ✅ Event types for event-driven architecture
- ✅ Utility types

## Versioning

This package follows [Semantic Versioning](https://semver.org/).

## License

UNLICENSED - Private package
```

---

### Package 2: @your-company/shared-dto ⭐⭐⭐⭐⭐

**Mục đích:** API contracts với validation rules. Package này define tất cả DTOs được sử dụng trong communication giữa services.

#### Structure

```
packages/shared-dto/
├── src/
│   ├── index.ts
│   ├── common/                      # Common DTOs
│   │   ├── index.ts
│   │   ├── pagination.dto.ts
│   │   ├── id-param.dto.ts
│   │   ├── search.dto.ts
│   │   └── date-range.dto.ts
│   ├── auth/                        # Auth domain DTOs
│   │   ├── index.ts
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   ├── change-password.dto.ts
│   │   ├── forgot-password.dto.ts
│   │   ├── reset-password.dto.ts
│   │   ├── verify-email.dto.ts
│   │   └── responses/
│   │       ├── auth-response.dto.ts
│   │       └── user-response.dto.ts
│   ├── user/                        # User management DTOs
│   │   ├── index.ts
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── activate-user.dto.ts
│   │   └── responses/
│   │       └── user-detail-response.dto.ts
│   ├── order/                       # Order domain DTOs
│   │   ├── index.ts
│   │   ├── create-order.dto.ts
│   │   ├── update-order.dto.ts
│   │   ├── cancel-order.dto.ts
│   │   ├── order-item.dto.ts
│   │   └── responses/
│   │       ├── order-response.dto.ts
│   │       └── order-list-response.dto.ts
│   ├── payment/                     # Payment domain DTOs
│   │   ├── index.ts
│   │   ├── create-payment.dto.ts
│   │   ├── refund-payment.dto.ts
│   │   └── responses/
│   │       └── payment-response.dto.ts
│   └── catalog/                     # Catalog domain DTOs
│       ├── index.ts
│       ├── create-product.dto.ts
│       ├── update-product.dto.ts
│       └── responses/
│           └── product-response.dto.ts
├── package.json
├── tsconfig.json
└── README.md
```

#### package.json

```json
{
  "name": "@your-company/shared-dto",
  "version": "1.0.0",
  "description": "Shared Data Transfer Objects with validation",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rimraf dist",
    "prepublishOnly": "pnpm run clean && pnpm run build"
  },
  "keywords": [
    "microservices",
    "dto",
    "validation",
    "typescript"
  ],
  "author": "Your Company",
  "license": "UNLICENSED",
  "publishConfig": {
    "access": "restricted",
    "registry": "https://npm.pkg.github.com"
  },
  "files": [
    "dist",
    "README.md"
  ],
  "dependencies": {
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  },
  "peerDependencies": {
    "@nestjs/swagger": "^11.0.0",
    "@your-company/shared-types": "^1.0.0"
  },
  "devDependencies": {
    "@nestjs/swagger": "^11.0.0",
    "@your-company/shared-types": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### src/common/pagination.dto.ts

```typescript
import { IsInt, Min, Max, IsOptional, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DEFAULT_PAGINATION } from '@your-company/shared-types';

/**
 * Standard pagination DTO
 * Sử dụng cho tất cả endpoints có pagination
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: DEFAULT_PAGINATION.PAGE,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = DEFAULT_PAGINATION.PAGE;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: DEFAULT_PAGINATION.MAX_LIMIT,
    default: DEFAULT_PAGINATION.LIMIT,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(DEFAULT_PAGINATION.MAX_LIMIT, {
    message: `Limit must not exceed ${DEFAULT_PAGINATION.MAX_LIMIT}`,
  })
  limit?: number = DEFAULT_PAGINATION.LIMIT;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: DEFAULT_PAGINATION.ORDER,
    example: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: 'Order must be either ASC or DESC' })
  order?: 'ASC' | 'DESC' = DEFAULT_PAGINATION.ORDER;
}
```

#### src/common/id-param.dto.ts

```typescript
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for UUID path parameters
 */
export class IdParamDto {
  @ApiProperty({
    description: 'Entity UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID phải là UUID v4 hợp lệ' })
  id: string;
}

/**
 * DTO for user ID path parameter
 */
export class UserIdParamDto {
  @ApiProperty({
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'User ID phải là UUID v4 hợp lệ' })
  userId: string;
}
```

#### src/common/search.dto.ts

```typescript
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';

/**
 * Search với pagination
 */
export class SearchDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search query',
    minLength: 2,
    maxLength: 100,
    example: 'laptop',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Search query phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Search query không được vượt quá 100 ký tự' })
  q?: string;
}
```

#### src/auth/register.dto.ts

```typescript
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for user registration
 */
export class RegisterRequestDto {
  @ApiProperty({
    description: 'Username (unique)',
    example: 'john.doe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3, { message: 'Username phải có ít nhất 3 ký tự' })
  @MaxLength(50, { message: 'Username không được vượt quá 50 ký tự' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username chỉ được chứa chữ cái, số, dấu gạch dưới và gạch ngang',
  })
  username: string;

  @ApiProperty({
    description: 'Email address (unique)',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự' })
  email: string;

  @ApiProperty({
    description: 'Password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @MaxLength(100, { message: 'Mật khẩu không được vượt quá 100 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'First name không được vượt quá 50 ký tự' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Last name không được vượt quá 50 ký tự' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number (Vietnam format)',
    example: '+84987654321',
  })
  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ' })
  phoneNumber?: string;
}
```

#### src/auth/login.dto.ts

```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for user login
 */
export class LoginRequestDto {
  @ApiProperty({
    description: 'Username or email address',
    example: 'john.doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username hoặc email không được để trống' })
  usernameOrEmail: string;

  @ApiProperty({
    description: 'Password',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
}
```

#### src/auth/responses/auth-response.dto.ts

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

/**
 * DTO for authentication response (login, register)
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 900,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}
```

#### src/auth/responses/user-response.dto.ts

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@your-company/shared-types';

/**
 * DTO for user response (không bao gồm sensitive data)
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'john.doe',
  })
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+84987654321',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Account active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Email verification status',
    example: false,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'User roles',
    enum: UserRole,
    isArray: true,
    example: [UserRole.USER],
  })
  roles: UserRole[];

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Last login date',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastLoginAt?: Date;
}
```

#### src/order/create-order.dto.ts

```typescript
import {
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@your-company/shared-types';

/**
 * Order item DTO
 */
export class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Laptop Dell XPS 13',
  })
  @IsString()
  @MaxLength(200)
  productName: string;

  @ApiProperty({
    description: 'Quantity',
    minimum: 1,
    example: 2,
  })
  @IsNumber()
  @Min(1, { message: 'Quantity phải lớn hơn 0' })
  quantity: number;

  @ApiProperty({
    description: 'Unit price',
    minimum: 0,
    example: 25000000,
  })
  @IsNumber()
  @Min(0, { message: 'Unit price không được âm' })
  unitPrice: number;
}

/**
 * DTO for creating new order
 */
export class CreateOrderDto {
  @ApiProperty({
    description: 'Order items',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Shipping address',
    example: '123 Nguyen Hue St, District 1, Ho Chi Minh City',
  })
  @IsString()
  @MaxLength(500)
  shippingAddress: string;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Order notes',
    example: 'Please deliver between 9AM - 5PM',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
```

#### src/index.ts

```typescript
// Export common DTOs
export * from './common';

// Export auth DTOs
export * from './auth';

// Export user DTOs
export * from './user';

// Export order DTOs
export * from './order';

// Export payment DTOs
export * from './payment';

// Export catalog DTOs
export * from './catalog';
```

---

### Package 3: @your-company/shared-exceptions ⭐⭐⭐⭐⭐

**Mục đích:** Custom exceptions chuẩn hóa error handling across services

#### Structure

```
packages/shared-exceptions/
├── src/
│   ├── index.ts
│   ├── base/
│   │   ├── index.ts
│   │   └── base.exception.ts
│   ├── auth/
│   │   ├── index.ts
│   │   ├── user-not-found.exception.ts
│   │   ├── invalid-credentials.exception.ts
│   │   ├── token-expired.exception.ts
│   │   └── account-not-activated.exception.ts
│   ├── order/
│   │   ├── index.ts
│   │   ├── order-not-found.exception.ts
│   │   ├── out-of-stock.exception.ts
│   │   └── invalid-order-status.exception.ts
│   └── common/
│       ├── index.ts
│       ├── validation.exception.ts
│       └── not-found.exception.ts
├── package.json
├── tsconfig.json
└── README.md
```

#### src/base/base.exception.ts

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@your-company/shared-types';

/**
 * Base exception class
 * Tất cả custom exceptions nên extend class này
 */
export class BaseException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly details?: any,
  ) {
    super(
      {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}
```

#### src/auth/user-not-found.exception.ts

```typescript
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@your-company/shared-types';
import { BaseException } from '../base';

/**
 * Exception khi không tìm thấy user
 */
export class UserNotFoundException extends BaseException {
  constructor(identifier: string) {
    super(
      ErrorCode.AUTH_USER_NOT_FOUND,
      `User not found: ${identifier}`,
      HttpStatus.NOT_FOUND,
      { identifier },
    );
  }
}
```

#### src/auth/invalid-credentials.exception.ts

```typescript
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@your-company/shared-types';
import { BaseException } from '../base';

/**
 * Exception khi credentials không đúng
 */
export class InvalidCredentialsException extends BaseException {
  constructor() {
    super(
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      'Invalid username or password',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
```

#### src/auth/token-expired.exception.ts

```typescript
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@your-company/shared-types';
import { BaseException } from '../base';

/**
 * Exception khi token đã hết hạn
 */
export class TokenExpiredException extends BaseException {
  constructor(tokenType: string = 'Token') {
    super(
      ErrorCode.AUTH_TOKEN_EXPIRED,
      `${tokenType} has expired`,
      HttpStatus.UNAUTHORIZED,
      { tokenType },
    );
  }
}
```

#### src/auth/account-not-activated.exception.ts

```typescript
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@your-company/shared-types';
import { BaseException } from '../base';

/**
 * Exception khi account chưa được kích hoạt
 */
export class AccountNotActivatedException extends BaseException {
  constructor(userId: string) {
    super(
      ErrorCode.AUTH_ACCOUNT_NOT_ACTIVATED,
      'Account has not been activated',
      HttpStatus.FORBIDDEN,
      { userId },
    );
  }
}
```

#### src/order/order-not-found.exception.ts

```typescript
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@your-company/shared-types';
import { BaseException } from '../base';

/**
 * Exception khi không tìm thấy order
 */
export class OrderNotFoundException extends BaseException {
  constructor(orderId: string) {
    super(
      ErrorCode.ORD_ORDER_NOT_FOUND,
      `Order not found: ${orderId}`,
      HttpStatus.NOT_FOUND,
      { orderId },
    );
  }
}
```

#### src/order/out-of-stock.exception.ts

```typescript
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@your-company/shared-types';
import { BaseException } from '../base';

/**
 * Exception khi sản phẩm hết hàng
 */
export class OutOfStockException extends BaseException {
  constructor(productId: string, available: number, requested: number) {
    super(
      ErrorCode.ORD_OUT_OF_STOCK,
      `Product ${productId} is out of stock. Available: ${available}, Requested: ${requested}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
      { productId, available, requested },
    );
  }
}
```

#### package.json

```json
{
  "name": "@your-company/shared-exceptions",
  "version": "1.0.0",
  "description": "Shared custom exceptions",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rimraf dist",
    "prepublishOnly": "pnpm run clean && pnpm run build"
  },
  "peerDependencies": {
    "@nestjs/common": "^11.0.0",
    "@your-company/shared-types": "^1.0.0"
  },
  "devDependencies": {
    "@nestjs/common": "^11.0.0",
    "@your-company/shared-types": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

### Package 4: @your-company/shared-decorators ⭐⭐⭐⭐

**Mục đích:** Custom decorators để reuse logic across services

#### src/current-user.decorator.ts

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@your-company/shared-types';

/**
 * Decorator để lấy current user từ request
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 * 
 * @Get('user-id')
 * async getUserId(@CurrentUser('sub') userId: string) {
 *   return userId;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    return data ? user?.[data] : user;
  },
);
```

#### src/roles.decorator.ts

```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@your-company/shared-types';

export const ROLES_KEY = 'roles';

/**
 * Decorator để check user roles
 * 
 * @example
 * ```typescript
 * @Roles(UserRole.ADMIN, UserRole.MODERATOR)
 * @Delete(':id')
 * async deleteUser(@Param('id') id: string) {
 *   // Only ADMIN or MODERATOR can access
 * }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

#### src/public.decorator.ts

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator để mark endpoint là public (không cần authentication)
 * 
 * @example
 * ```typescript
 * @Public()
 * @Post('login')
 * async login(@Body() dto: LoginDto) {
 *   // Public endpoint, không cần JWT token
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### src/api-paginated-response.decorator.ts

```typescript
import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * Swagger decorator cho paginated responses
 * 
 * @example
 * ```typescript
 * @ApiPaginatedResponse(UserDto)
 * @Get('users')
 * async findAll(@Query() pagination: PaginationDto) {
 *   // Returns paginated users
 * }
 * ```
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Paginated response',
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'number', example: 100 },
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 10 },
                  totalPages: { type: 'number', example: 10 },
                  hasNextPage: { type: 'boolean', example: true },
                  hasPreviousPage: { type: 'boolean', example: false },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
```

---

### Package 5: @your-company/shared-guards ⭐⭐⭐⭐

#### src/jwt-auth.guard.ts

```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@your-company/shared-decorators';

/**
 * JWT Authentication Guard
 * Kiểm tra JWT token trong request headers
 * Skip nếu endpoint được mark là @Public()
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if endpoint is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

#### src/roles.guard.ts

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@your-company/shared-decorators';
import { UserRole, JwtPayload } from '@your-company/shared-types';

/**
 * Roles Guard
 * Kiểm tra user có role phù hợp không
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException('User does not have required roles');
    }

    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Requires one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
```

---

### Package 6: @your-company/shared-interceptors ⭐⭐⭐⭐

#### src/logging.interceptor.ts

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging Interceptor
 * Log tất cả requests và responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = headers['x-forwarded-for'] || request.ip;
    const now = Date.now();

    this.logger.log(
      `[${method}] ${url} - User-Agent: ${userAgent} - IP: ${ip}`,
    );

    // Log request body (exclude sensitive data)
    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.logger.log(
            `[${method}] ${url} ${response.statusCode} - ${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `[${method}] ${url} ${error.status || 500} - ${delay}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken'];
    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}
```

#### src/transform.interceptor.ts

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse } from '@your-company/shared-types';

/**
 * Transform Interceptor
 * Transform response thành BaseResponse format
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, BaseResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();

        // Nếu data đã là BaseResponse format, return as is
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data;
        }

        // Transform thành BaseResponse
        return {
          statusCode: response.statusCode,
          message: data?.message || 'Success',
          data: data?.data !== undefined ? data.data : data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
```

#### src/timeout.interceptor.ts

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

/**
 * Timeout Interceptor
 * Set timeout cho requests
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs: number = 30000) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `Request timeout after ${this.timeoutMs}ms`,
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
```

---

### Package 7: @your-company/shared-filters ⭐⭐⭐⭐

#### src/all-exceptions.filter.ts

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '@your-company/shared-types';

/**
 * Global Exception Filter
 * Catch tất cả exceptions và format thành chuẩn
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ErrorCode.CMN_INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any;
    let stack: string | undefined;

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        code = (exceptionResponse as any).code || code;
        message = (exceptionResponse as any).message || message;
        details = (exceptionResponse as any).details;
      } else {
        message = exceptionResponse as string;
      }
    }
    // Handle standard errors
    else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    // Log error
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Send response
    const errorResponse = {
      statusCode: status,
      error: {
        code,
        message,
        details,
        ...(process.env.NODE_ENV === 'development' && stack ? { stack } : {}),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId: request.headers['x-correlation-id'] as string,
    };

    response.status(status).json(errorResponse);
  }
}
```

---

### Package 8: @your-company/shared-utils ⭐⭐⭐⭐

#### src/hash.helper.ts

```typescript
import * as bcrypt from 'bcrypt';

/**
 * Hash utilities
 */
export class HashHelper {
  /**
   * Hash plain text
   */
  static async hash(plainText: string, rounds = 10): Promise<string> {
    return bcrypt.hash(plainText, rounds);
  }

  /**
   * Compare plain text with hash
   */
  static async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }

  /**
   * Generate salt
   */
  static async generateSalt(rounds = 10): Promise<string> {
    return bcrypt.genSalt(rounds);
  }
}
```

#### src/pagination.helper.ts

```typescript
import { PaginationMeta, PaginationQuery } from '@your-company/shared-types';

/**
 * Pagination utilities
 */
export class PaginationHelper {
  /**
   * Calculate offset for database query
   */
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Calculate total pages
   */
  static calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  /**
   * Build pagination metadata
   */
  static buildMeta(
    total: number,
    page: number,
    limit: number,
  ): PaginationMeta {
    const totalPages = this.calculateTotalPages(total, limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Validate pagination query
   */
  static validateQuery(query: PaginationQuery): void {
    if (query.page < 1) {
      throw new Error('Page must be at least 1');
    }
    if (query.limit < 1) {
      throw new Error('Limit must be at least 1');
    }
    if (query.limit > 100) {
      throw new Error('Limit must not exceed 100');
    }
  }
}
```

#### src/string.helper.ts

```typescript
/**
 * String utilities
 */
export class StringHelper {
  /**
   * Convert string to slug
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Truncate string
   */
  static truncate(text: string, length: number, suffix = '...'): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + suffix;
  }

  /**
   * Generate random string
   */
  static random(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Mask sensitive data
   */
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const visibleChars = Math.min(3, Math.floor(username.length / 2));
    const masked = username.slice(0, visibleChars) + '***';
    return `${masked}@${domain}`;
  }

  /**
   * Mask phone number
   */
  static maskPhone(phone: string): string {
    const visible = 4;
    return phone.slice(0, visible) + '***' + phone.slice(-visible);
  }
}
```

---

### Package 9: @your-company/shared-entities ⭐⭐⭐⭐

#### src/base.entity.ts

```typescript
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  VersionColumn,
} from 'typeorm';

/**
 * Base Entity
 * Tất cả entities nên extend class này
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: 'Thời gian tạo record',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    comment: 'Thời gian update record',
  })
  updatedAt: Date;

  @Column({
    name: 'created_by',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User ID tạo record',
  })
  createdBy?: string;

  @Column({
    name: 'updated_by',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User ID update record',
  })
  updatedBy?: string;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Thời gian xóa (soft delete)',
  })
  deletedAt?: Date;

  @VersionColumn({
    name: 'version',
    comment: 'Version cho optimistic locking',
  })
  version: number;

  @BeforeInsert()
  protected setCreatedAt() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  protected setUpdatedAt() {
    this.updatedAt = new Date();
  }
}
```

---

### Package 10: @your-company/shared-events ⭐⭐⭐

#### src/user.events.ts

```typescript
import { BaseEvent, EventType } from '@your-company/shared-types';

/**
 * User Registered Event
 */
export interface UserRegisteredEvent extends BaseEvent {
  type: EventType.USER_REGISTERED;
  data: {
    userId: string;
    username: string;
    email: string;
    registeredAt: Date;
  };
}

/**
 * User Activated Event
 */
export interface UserActivatedEvent extends BaseEvent {
  type: EventType.USER_ACTIVATED;
  data: {
    userId: string;
    activatedBy: string;
    activatedAt: Date;
  };
}
```

---

## Versioning & Publishing

### Semantic Versioning Strategy

**Format:** `MAJOR.MINOR.PATCH`

```
1.0.0 → Initial release
1.0.1 → Bug fixes (backward compatible)
1.1.0 → New features (backward compatible)
2.0.0 → Breaking changes
```

### Versioning Rules

#### PATCH (1.0.0 → 1.0.1)
- Bug fixes
- Documentation updates
- Internal code refactoring (no API changes)

```bash
# Example: Fix typo in error message
cd packages/shared-exceptions
npm version patch
# 1.0.0 → 1.0.1
```

#### MINOR (1.0.1 → 1.1.0)
- New features (backward compatible)
- New DTOs, enums, interfaces
- Deprecations (with warnings)

```bash
# Example: Add new OrderStatus enum value
cd packages/shared-types
npm version minor
# 1.0.1 → 1.1.0
```

#### MAJOR (1.1.0 → 2.0.0)
- Breaking changes
- Removed deprecated features
- Changed interfaces/types
- Renamed exports

```bash
# Example: Rename LoginDto to LoginRequestDto
cd packages/shared-dto
npm version major
# 1.1.0 → 2.0.0
```

### Publishing Workflow

#### Manual Publishing

```bash
# 1. Build tất cả packages
pnpm run build

# 2. Test
pnpm run test

# 3. Bump version
cd packages/shared-types
npm version patch  # or minor, or major

# 4. Publish
npm publish

# 5. Tag và push
git add .
git commit -m "chore: release shared-types@1.0.1"
git tag shared-types-v1.0.1
git push origin main --tags
```

#### Automated Publishing với GitHub Actions

```yaml
# .github/workflows/publish.yml
name: Publish Packages

on:
  push:
    branches:
      - main
    paths:
      - 'packages/**'

jobs:
  publish:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@your-company'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build packages
        run: pnpm run build
      
      - name: Run tests
        run: pnpm run test
      
      - name: Publish packages
        run: pnpm run publish:all
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Best Practices

### 1. Package Design Principles

#### ✅ DO

```typescript
// ✅ GOOD: Single responsibility
// shared-types chỉ chứa types, không có logic
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// ✅ GOOD: No external dependencies trong shared-types
// (Trừ devDependencies như typescript)

// ✅ GOOD: Export rõ ràng
export * from './enums';
export * from './interfaces';

// ✅ GOOD: Document đầy đủ
/**
 * User registration DTO
 * @example
 * const dto = new RegisterDto();
 * dto.username = 'john';
 */
export class RegisterDto { }
```

#### ❌ DON'T

```typescript
// ❌ BAD: Business logic trong shared package
export class UserService {
  async createUser() {
    // Database calls, business logic
    // → Nên ở service riêng!
  }
}

// ❌ BAD: Service-specific logic
export class AuthUtils {
  async hashPassword() { } // OK - utility
  async saveToDatabase() { } // BAD - service specific
}

// ❌ BAD: Heavy dependencies
import { SomeHeavyLibrary } from 'heavy-lib'; // 50MB
// → Làm tất cả services phải install heavy-lib
```

### 2. Breaking Changes Policy

#### Khi có Breaking Change

```typescript
// Version 1.x.x
export interface User {
  id: string;
  name: string;
}

// Version 2.0.0 (Breaking change)
export interface User {
  id: string;
  firstName: string;  // ← name → firstName (breaking!)
  lastName: string;
}
```

**Process:**
1. **Create RFC (Request for Comments)**
2. **Announce to all teams**
3. **Create migration guide**
4. **Bump major version**
5. **Update all services**

#### Backward Compatible Changes

```typescript
// Version 1.0.0
export interface User {
  id: string;
  name: string;
}

// Version 1.1.0 (Backward compatible)
export interface User {
  id: string;
  name: string;
  email?: string;  // ← Optional field (safe!)
}
```

### 3. Dependency Management

```json
// ✅ GOOD: Peer dependencies cho framework packages
{
  "peerDependencies": {
    "@nestjs/common": "^11.0.0",
    "class-validator": "^0.14.0"
  }
}

// ❌ BAD: Regular dependencies cho framework
{
  "dependencies": {
    "@nestjs/common": "^11.0.0"  // Forces version!
  }
}
```

### 4. Testing Strategy

```typescript
// shared-dto/src/auth/register.dto.spec.ts
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should validate correct data', async () => {
    const dto = new RegisterDto();
    dto.username = 'john';
    dto.email = 'john@example.com';
    dto.password = 'Password123!';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid email', async () => {
    const dto = new RegisterDto();
    dto.username = 'john';
    dto.email = 'invalid-email';
    dto.password = 'Password123!';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });
});
```

---

## Troubleshooting

### Issue 1: "Cannot find module '@your-company/shared-types'"

**Nguyên nhân:** Package chưa được publish hoặc chưa install

**Giải pháp:**
```bash
# Check package đã publish chưa
npm view @your-company/shared-types

# Install lại
cd your-service
npm install @your-company/shared-types@latest

# Clear cache nếu cần
npm cache clean --force
pnpm store prune
```

### Issue 2: Type conflicts giữa services

**Nguyên nhân:** Services dùng versions khác nhau của shared packages

**Giải pháp:**
```bash
# Check versions
cd auth-service
npm list @your-company/shared-types

cd ../order-service
npm list @your-company/shared-types

# Update tất cả về cùng version
npm install @your-company/shared-types@^1.2.0
```

### Issue 3: Circular dependencies

**Nguyên nhân:** Packages import lẫn nhau

```typescript
// ❌ BAD
// shared-dto imports from shared-exceptions
// shared-exceptions imports from shared-dto
// → Circular dependency!
```

**Giải pháp:** Restructure để avoid circular deps
```
shared-types (no deps)
    ↑
    ├── shared-dto (depends on types)
    ├── shared-exceptions (depends on types)
    └── shared-decorators (depends on types)
```

---

## FAQ

### Q: Khi nào nên tạo shared package mới?

**A:** Tạo khi:
- Code được dùng bởi 3+ services
- Logic stable, ít thay đổi
- Có value rõ ràng (không chỉ để "share")

### Q: Có nên share business logic không?

**A:** **KHÔNG**. Chỉ share:
- Types, interfaces, enums
- DTOs (data contracts)
- Utilities (pure functions)
- Infrastructure code (guards, interceptors)

### Q: Làm sao quản lý breaking changes?

**A:**
1. Announce trước 1-2 sprint
2. Provide migration guide
3. Support old version song song (nếu có thể)
4. Coordinate với tất cả teams

### Q: Nên dùng monorepo hay polyrepo cho shared packages?

**A:** 
- **Monorepo (khuyến nghị)**: Dễ manage, test, và release
- **Polyrepo**: Nếu có lý do đặc biệt (security, team structure)

---

## Checklist cho Tech Lead

### Setup Phase ✅

- [ ] Tạo shared-packages repository
- [ ] Setup pnpm workspaces
- [ ] Configure TypeScript
- [ ] Setup ESLint & Prettier
- [ ] Configure npm registry (GitHub Packages)
- [ ] Create initial packages structure
- [ ] Write README cho mỗi package
- [ ] Setup CI/CD pipeline

### Development Phase ✅

- [ ] Implement shared-types
- [ ] Implement shared-dto
- [ ] Implement shared-exceptions
- [ ] Implement shared-decorators
- [ ] Implement shared-guards
- [ ] Implement shared-interceptors
- [ ] Implement shared-filters
- [ ] Implement shared-utils
- [ ] Write tests cho tất cả packages
- [ ] Document usage examples

### Publishing Phase ✅

- [ ] Test packages locally
- [ ] Publish to registry
- [ ] Update services để use packages
- [ ] Create migration guide
- [ ] Train team về usage
- [ ] Monitor adoption

### Maintenance Phase ✅

- [ ] Setup automated testing
- [ ] Monitor for issues
- [ ] Review PRs
- [ ] Handle breaking changes carefully
- [ ] Keep documentation updated
- [ ] Regular dependency updates

---

## Tài Liệu Tham Khảo

### Liên Quan Nội Bộ
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Hướng dẫn phát triển Auth Service
- Architecture Decision Records (ADRs)
- Service-specific documentation

### External Resources
- [Semantic Versioning](https://semver.org/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [GitHub Packages Documentation](https://docs.github.com/en/packages)

---

## Kết Luận

Shared Packages là **nền tảng quan trọng** cho kiến trúc microservices quy mô lớn. Một shared packages system tốt sẽ:

✅ **Tăng tốc độ phát triển**: Developers không mất thời gian viết lại code
✅ **Đảm bảo consistency**: Tất cả services follow cùng chuẩn
✅ **Giảm bugs**: Shared code được test kỹ hơn
✅ **Dễ maintain**: Sửa 1 chỗ, cập nhật mọi nơi
✅ **Type-safe**: TypeScript types shared across services

**Vai trò của Tech Lead:**
- 🎯 Setup foundation ban đầu
- 📐 Define standards và best practices
- 🛡️ Review và approve changes
- 📚 Document và train team
- 🔄 Maintain và evolve theo thời gian

**Remember:** Shared packages là **investment dài hạn**. Dành thời gian setup đúng từ đầu sẽ save rất nhiều công sức sau này!

---

**Document Version:** 1.0.0  
**Last Updated:** 2024  
**Maintained by:** Tech Lead / Architecture Team  
**Questions?** Contact: tech-lead@your-company.com

---

## Changelog

### [1.0.0] - 2024-11-14
- ✅ Initial documentation
- ✅ Complete package specifications
- ✅ Setup & configuration guide
- ✅ Best practices
- ✅ Troubleshooting guide

