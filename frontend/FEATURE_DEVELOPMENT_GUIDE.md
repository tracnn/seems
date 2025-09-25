# Hướng dẫn phát triển tính năng mới - Frontend User

Tài liệu này hướng dẫn chi tiết cách thêm một tính năng mới vào ứng dụng Frontend User sử dụng React, TypeScript, TanStack Router, và Shadcn UI.

## 📋 Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Quy trình phát triển tính năng](#quy-trình-phát-triển-tính-năng)
3. [Ví dụ thực tế: Tính năng Quản lý Sản phẩm](#ví-dụ-thực-tế-tính-năng-quản-lý-sản-phẩm)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)
6. [Checklist phát triển](#checklist-phát-triển)

## 🏗️ Tổng quan kiến trúc

### Cấu trúc dự án

```
src/
├── components/           # UI Components tái sử dụng
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   │   ├── data/
│   │   │   └── sidebar-data.ts  # Cấu hình navigation
│   │   └── types.ts     # TypeScript types cho layout
│   └── ui/              # Shadcn UI components
├── features/            # Feature-based organization
│   ├── auth/           # Authentication features
│   ├── dashboard/      # Dashboard features
│   ├── settings/       # Settings features
│   └── [new-feature]/  # Tính năng mới của bạn
├── routes/             # TanStack Router routes
│   ├── _authenticated/ # Protected routes
│   ├── (auth)/         # Authentication routes
│   └── (errors)/       # Error pages
├── stores/             # Zustand stores cho state management
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── lib/                # Library configurations
```

### Tech Stack

- **Framework**: React 19 + TypeScript
- **Routing**: TanStack Router
- **State Management**: Zustand
- **UI Library**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Data Fetching**: TanStack Query
- **Icons**: Tabler Icons + Lucide React

## 🚀 Quy trình phát triển tính năng

### Bước 1: Phân tích và Lập kế hoạch

1. **Xác định yêu cầu tính năng**
   - Mô tả chi tiết chức năng
   - Xác định các API endpoints cần thiết
   - Thiết kế UI/UX mockup
   - Xác định permissions và roles

2. **Thiết kế cấu trúc dữ liệu**
   - Định nghĩa TypeScript interfaces
   - Thiết kế API contracts
   - Xác định validation rules

### Bước 2: Tạo cấu trúc thư mục

```bash
# Tạo thư mục cho tính năng mới
mkdir -p src/features/products
mkdir -p src/features/products/components
mkdir -p src/features/products/hooks
mkdir -p src/features/products/types
mkdir -p src/routes/_authenticated/products
```

### Bước 3: Định nghĩa Types và Interfaces

```typescript
// src/features/products/types/index.ts
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category: string
  status: 'active' | 'inactive' | 'draft'
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  category: string
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string
}

export interface ProductFilters {
  search?: string
  category?: string
  status?: Product['status']
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}
```

### Bước 4: Tạo API Service

```typescript
// src/features/products/services/productService.ts
import axios from 'axios'
import { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '../types'

const API_BASE = '/api/products'

export const productService = {
  // Lấy danh sách sản phẩm
  getProducts: async (filters: ProductFilters = {}): Promise<{
    data: Product[]
    total: number
    page: number
    limit: number
  }> => {
    const response = await axios.get(API_BASE, { params: filters })
    return response.data
  },

  // Lấy chi tiết sản phẩm
  getProduct: async (id: string): Promise<Product> => {
    const response = await axios.get(`${API_BASE}/${id}`)
    return response.data
  },

  // Tạo sản phẩm mới
  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await axios.post(API_BASE, data)
    return response.data
  },

  // Cập nhật sản phẩm
  updateProduct: async (data: UpdateProductRequest): Promise<Product> => {
    const { id, ...updateData } = data
    const response = await axios.put(`${API_BASE}/${id}`, updateData)
    return response.data
  },

  // Xóa sản phẩm
  deleteProduct: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE}/${id}`)
  },

  // Upload hình ảnh
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
}
```

### Bước 5: Tạo Custom Hooks

```typescript
// src/features/products/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productService } from '../services/productService'
import { ProductFilters, CreateProductRequest, UpdateProductRequest } from '../types'

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Sản phẩm đã được tạo thành công')
    },
    onError: (error) => {
      toast.error('Không thể tạo sản phẩm')
      console.error('Create product error:', error)
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProductRequest) => productService.updateProduct(data),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] })
      toast.success('Sản phẩm đã được cập nhật')
    },
    onError: (error) => {
      toast.error('Không thể cập nhật sản phẩm')
      console.error('Update product error:', error)
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Sản phẩm đã được xóa')
    },
    onError: (error) => {
      toast.error('Không thể xóa sản phẩm')
      console.error('Delete product error:', error)
    },
  })
}
```

### Bước 6: Tạo Components

#### Main Feature Component

```typescript
// src/features/products/index.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProductsTable } from './components/products-table'
import { ProductForm } from './components/product-form'
import { ProductFilters } from './components/product-filters'
import { useProducts } from './hooks/useProducts'
import { ProductFilters as ProductFiltersType } from './types'

export default function Products() {
  const [filters, setFilters] = useState<ProductFiltersType>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)

  const { data: productsData, isLoading, error } = useProducts(filters)

  const handleEdit = (productId: string) => {
    setEditingProduct(productId)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  return (
    <>
      <Header>
        <div className='flex items-center space-x-4'>
          <h1 className='text-lg font-semibold'>Quản lý Sản phẩm</h1>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Quản lý Sản phẩm</h1>
            <p className='text-muted-foreground'>
              Quản lý danh mục sản phẩm của bạn
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            Thêm sản phẩm
          </Button>
        </div>

        <div className='space-y-6'>
          <ProductFilters filters={filters} onFiltersChange={setFilters} />
          
          <Card>
            <CardHeader>
              <CardTitle>Danh sách sản phẩm</CardTitle>
              <CardDescription>
                Xem và quản lý tất cả sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsTable
                data={productsData?.data || []}
                loading={isLoading}
                error={error}
                onEdit={handleEdit}
                total={productsData?.total || 0}
                page={filters.page || 1}
                limit={filters.limit || 10}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
              />
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <ProductForm
            productId={editingProduct}
            onClose={handleFormClose}
          />
        )}
      </Main>
    </>
  )
}
```

#### Table Component

```typescript
// src/features/products/components/products-table.tsx
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { IconDots, IconEdit, IconTrash, IconEye } from '@tabler/icons-react'
import { Product } from '../types'
import { useDeleteProduct } from '../hooks/useProducts'
import { formatCurrency } from '@/utils/format'

interface ProductsTableProps {
  data: Product[]
  loading: boolean
  error: any
  onEdit: (id: string) => void
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
}

export function ProductsTable({
  data,
  loading,
  error,
  onEdit,
  total,
  page,
  limit,
  onPageChange
}: ProductsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteProduct = useDeleteProduct()

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProduct.mutateAsync(deleteId)
      setDeleteId(null)
    }
  }

  const getStatusVariant = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'draft':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return 'Hoạt động'
      case 'inactive':
        return 'Không hoạt động'
      case 'draft':
        return 'Bản nháp'
      default:
        return status
    }
  }

  if (loading) {
    return <div className='text-center py-8'>Đang tải...</div>
  }

  if (error) {
    return <div className='text-center py-8 text-red-500'>Có lỗi xảy ra khi tải dữ liệu</div>
  }

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className='text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product) => (
              <TableRow key={product.id}>
                <TableCell className='font-medium'>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(product.status)}>
                    {getStatusLabel(product.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm'>
                        <IconDots className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => onEdit(product.id)}>
                        <IconEdit className='mr-2 h-4 w-4' />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(product.id)}>
                        <IconTrash className='mr-2 h-4 w-4' />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between mt-4'>
        <div className='text-sm text-muted-foreground'>
          Hiển thị {((page - 1) * limit) + 1} đến {Math.min(page * limit, total)} trong tổng số {total} sản phẩm
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Trước
          </Button>
          <span className='text-sm'>Trang {page}</span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(page + 1)}
            disabled={page * limit >= total}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

#### Form Component

```typescript
// src/features/products/components/product-form.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateProduct, useUpdateProduct, useProduct } from '../hooks/useProducts'
import { CreateProductRequest } from '../types'

const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc').max(100, 'Tên sản phẩm không được quá 100 ký tự'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  category: z.string().min(1, 'Danh mục là bắt buộc'),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  productId?: string | null
  onClose: () => void
}

export function ProductForm({ productId, onClose }: ProductFormProps) {
  const isEditing = !!productId
  const { data: product } = useProduct(productId || '')
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
    },
  })

  useEffect(() => {
    if (product && isEditing) {
      form.reset({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category,
      })
    }
  }, [product, isEditing, form])

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditing && productId) {
        await updateProduct.mutateAsync({
          id: productId,
          ...data,
        })
      } else {
        await createProduct.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const isLoading = createProduct.isPending || updateProduct.isPending

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin sản phẩm.'
              : 'Thêm sản phẩm mới vào danh mục.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập tên sản phẩm' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Nhập mô tả sản phẩm'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Nhập giá sản phẩm'
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn danh mục' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='electronics'>Điện tử</SelectItem>
                      <SelectItem value='clothing'>Thời trang</SelectItem>
                      <SelectItem value='books'>Sách</SelectItem>
                      <SelectItem value='home'>Gia dụng</SelectItem>
                      <SelectItem value='sports'>Thể thao</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                Hủy
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading
                  ? isEditing
                    ? 'Đang cập nhật...'
                    : 'Đang tạo...'
                  : isEditing
                  ? 'Cập nhật'
                  : 'Tạo sản phẩm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

### Bước 7: Tạo Route

```typescript
// src/routes/_authenticated/products/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import Products from '@/features/products'

export const Route = createFileRoute('/_authenticated/products/')({
  component: Products,
})
```

### Bước 8: Cập nhật Navigation

```typescript
// src/components/layout/data/sidebar-data.ts
import {
  // ... existing imports
  IconPackage, // Thêm icon cho products
} from '@tabler/icons-react'

export const sidebarData: SidebarData = {
  // ... existing config
  navGroups: [
    {
      title: 'Main',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Sản phẩm', // Thêm mục mới
          url: '/products',
          icon: IconPackage,
        },
      ],
    },
    // ... rest of navigation
  ],
}
```

### Bước 9: Tạo Utility Functions

```typescript
// src/utils/format.ts
export const formatCurrency = (amount: number, currency = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
```

### Bước 10: Build và Test

```bash
# Build project để cập nhật route tree
pnpm run build

# Chạy development server
pnpm run dev

# Chạy linting
pnpm run lint

# Format code
pnpm run format
```

## 🎯 Best Practices

### 1. **Tổ chức Code**

- **Feature-based organization**: Nhóm code theo tính năng thay vì theo loại file
- **Separation of concerns**: Tách biệt UI, business logic, và data layer
- **Consistent naming**: Sử dụng naming convention nhất quán

### 2. **TypeScript**

```typescript
// Sử dụng strict typing
interface ProductFormProps {
  productId?: string | null
  onClose: () => void
  onSubmit?: (data: Product) => void
}

// Sử dụng generic types
interface ApiResponse<T> {
  data: T
  total: number
  page: number
  limit: number
}

// Sử dụng utility types
type CreateProductRequest = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
type UpdateProductRequest = Partial<CreateProductRequest> & { id: string }
```

### 3. **Error Handling**

```typescript
// Sử dụng error boundaries
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert" className="p-4 border border-red-200 rounded-md">
      <h2 className="text-lg font-semibold text-red-800">Có lỗi xảy ra!</h2>
      <pre className="text-red-600">{error.message}</pre>
      <button onClick={resetErrorBoundary} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">
        Thử lại
      </button>
    </div>
  )
}

// Wrap components với error boundary
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <ProductsTable />
</ErrorBoundary>
```

### 4. **Performance Optimization**

```typescript
// Sử dụng React.memo cho components
export const ProductCard = React.memo(({ product }: { product: Product }) => {
  return (
    <div>
      {/* Component content */}
    </div>
  )
})

// Sử dụng useMemo cho expensive calculations
const filteredProducts = useMemo(() => {
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
}, [products, searchTerm])

// Sử dụng useCallback cho event handlers
const handleEdit = useCallback((id: string) => {
  setEditingProduct(id)
  setShowForm(true)
}, [])
```

### 5. **Accessibility**

```typescript
// Sử dụng semantic HTML
<main role="main">
  <section aria-labelledby="products-heading">
    <h1 id="products-heading">Quản lý Sản phẩm</h1>
    {/* Content */}
  </section>
</main>

// Thêm ARIA labels
<Button
  aria-label="Thêm sản phẩm mới"
  onClick={() => setShowForm(true)}
>
  <IconPlus className="h-4 w-4" />
</Button>

// Keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    onClose()
  }
}
```

### 6. **Testing**

```typescript
// Unit test example
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductForm } from '../product-form'

describe('ProductForm', () => {
  it('should render form fields', () => {
    render(<ProductForm onClose={jest.fn()} />)
    
    expect(screen.getByLabelText('Tên sản phẩm')).toBeInTheDocument()
    expect(screen.getByLabelText('Giá')).toBeInTheDocument()
    expect(screen.getByLabelText('Danh mục')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(<ProductForm onClose={jest.fn()} />)
    
    fireEvent.click(screen.getByText('Tạo sản phẩm'))
    
    expect(await screen.findByText('Tên sản phẩm là bắt buộc')).toBeInTheDocument()
  })
})
```

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **Route không được nhận diện**
   ```bash
   # Chạy build để cập nhật route tree
   pnpm run build
   ```

2. **Import errors**
   - Kiểm tra đường dẫn import (sử dụng `@/` alias)
   - Đảm bảo file đã được tạo
   - Check TypeScript config trong `tsconfig.json`

3. **Styling issues**
   - Kiểm tra Tailwind classes
   - Đảm bảo component được import đúng từ `@/components/ui`
   - Check CSS conflicts

4. **State không cập nhật**
   - Kiểm tra TanStack Query cache keys
   - Verify component re-renders
   - Check dependency arrays trong useEffect

5. **Form validation errors**
   - Kiểm tra Zod schema
   - Verify form field names match schema
   - Check react-hook-form setup

### Debug Tips:

```typescript
// Sử dụng React DevTools
// Thêm console.log để debug
console.log('Debug info:', { products, loading, error })

// Sử dụng TanStack Router DevTools
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

// Sử dụng TanStack Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Check browser console cho errors
// Sử dụng Network tab để debug API calls
```

## ✅ Checklist phát triển

### Trước khi bắt đầu:
- [ ] Xác định rõ yêu cầu tính năng
- [ ] Thiết kế UI/UX mockup
- [ ] Xác định API endpoints cần thiết
- [ ] Lập kế hoạch cấu trúc dữ liệu

### Trong quá trình phát triển:
- [ ] Tạo TypeScript interfaces và types
- [ ] Implement API service layer
- [ ] Tạo custom hooks với TanStack Query
- [ ] Build UI components với Shadcn UI
- [ ] Implement form validation với Zod
- [ ] Add error handling và loading states
- [ ] Implement pagination và filtering
- [ ] Add accessibility features
- [ ] Write unit tests

### Sau khi hoàn thành:
- [ ] Test tính năng trên các trình duyệt khác nhau
- [ ] Kiểm tra responsive design
- [ ] Test accessibility với screen reader
- [ ] Performance testing
- [ ] Code review
- [ ] Update documentation
- [ ] Deploy và test trên staging

### Code Quality:
- [ ] Code được format với Prettier
- [ ] Không có ESLint errors
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling
- [ ] Loading states cho async operations
- [ ] Proper cleanup trong useEffect
- [ ] Memoization cho performance

---

**Lưu ý:** Tài liệu này sẽ được cập nhật khi có thay đổi trong project structure hoặc best practices mới. Hãy tham khảo các tài liệu chính thức của các thư viện được sử dụng để có thông tin mới nhất.
