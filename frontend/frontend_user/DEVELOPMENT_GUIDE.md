# Hướng dẫn phát triển - Thêm chức năng mới

Tài liệu này hướng dẫn cách thêm một chức năng mới vào Shadcn Auth Starter template.

## 📋 Mục lục

1. [Cấu trúc project](#cấu-trúc-project)
2. [Quy trình thêm chức năng mới](#quy-trình-thêm-chức-năng-mới)
3. [Ví dụ thực tế: Thêm chức năng Products](#ví-dụ-thực-tế-thêm-chức-năng-products)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

## 🏗️ Cấu trúc project

```
src/
├── components/
│   ├── layout/          # Layout components
│   │   ├── data/
│   │   │   └── sidebar-data.ts  # Navigation configuration
│   │   └── ...
│   └── ui/              # Shadcn UI components
├── features/            # Feature-based organization
│   ├── auth/           # Authentication
│   ├── dashboard/      # Dashboard
│   ├── settings/       # Settings
│   └── [new-feature]/  # Chức năng mới của bạn
├── routes/             # TanStack Router routes
│   ├── _authenticated/ # Protected routes
│   └── ...
├── stores/             # Zustand stores
└── lib/                # Utility functions
```

## 🚀 Quy trình thêm chức năng mới

### Bước 1: Tạo Feature Directory

Tạo thư mục cho chức năng mới trong `src/features/`:

```bash
mkdir src/features/products
```

### Bước 2: Tạo Components

Tạo các component cần thiết cho chức năng:

```bash
# Tạo component chính
touch src/features/products/index.tsx

# Tạo components con (nếu cần)
mkdir src/features/products/components
touch src/features/products/components/products-table.tsx
touch src/features/products/components/product-form.tsx
```

### Bước 3: Tạo Route

Tạo route trong `src/routes/_authenticated/`:

```bash
mkdir src/routes/_authenticated/products
touch src/routes/_authenticated/products/index.tsx
```

### Bước 4: Cập nhật Navigation

Thêm chức năng mới vào sidebar navigation trong `src/components/layout/data/sidebar-data.ts`.

### Bước 5: Tạo Store (nếu cần)

Nếu chức năng cần quản lý state, tạo store trong `src/stores/`.

### Bước 6: Test và Build

Chạy build để cập nhật route tree và kiểm tra lỗi.

## 📝 Ví dụ thực tế: Thêm chức năng Products

### Bước 1: Tạo Feature Structure

```bash
mkdir -p src/features/products/components
mkdir -p src/routes/_authenticated/products
```

### Bước 2: Tạo Main Component

**`src/features/products/index.tsx`**

```tsx
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProductsTable } from './components/products-table'
import { ProductForm } from './components/product-form'

export default function Products() {
  return (
    <>
      {/* Header */}
      <Header>
        <div className='flex items-center space-x-4'>
          <h1 className='text-lg font-semibold'>Products</h1>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* Main Content */}
      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Products Management</h1>
            <p className='text-muted-foreground'>
              Manage your product catalog
            </p>
          </div>
          <Button>
            Add Product
          </Button>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Products List</CardTitle>
              <CardDescription>
                View and manage all your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsTable />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
```

### Bước 3: Tạo Components

**`src/features/products/components/products-table.tsx`**

```tsx
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

// Mock data - thay thế bằng API call thực tế
const products = [
  {
    id: 1,
    name: 'Laptop Pro',
    price: 1299,
    category: 'Electronics',
    status: 'active',
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    price: 29,
    category: 'Accessories',
    status: 'active',
  },
]

export function ProductsTable() {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className='font-medium'>{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status}
                </Badge>
              </TableCell>
              <TableCell className='text-right'>
                <Button variant='outline' size='sm'>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

**`src/features/products/components/product-form.tsx`**

```tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
})

type ProductFormData = z.infer<typeof productSchema>

export function ProductForm() {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: 0,
      category: '',
    },
  })

  const onSubmit = (data: ProductFormData) => {
    console.log('Product data:', data)
    // Implement API call here
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter product name' {...field} />
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
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='Enter price'
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='electronics'>Electronics</SelectItem>
                  <SelectItem value='clothing'>Clothing</SelectItem>
                  <SelectItem value='books'>Books</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit'>Create Product</Button>
      </form>
    </Form>
  )
}
```

### Bước 4: Tạo Route

**`src/routes/_authenticated/products/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import Products from '@/features/products'

export const Route = createFileRoute('/_authenticated/products/')({
  component: Products,
})
```

### Bước 5: Cập nhật Navigation

**`src/components/layout/data/sidebar-data.ts`**

```tsx
// Thêm import icon mới
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
          title: 'Products', // Thêm mục mới
          url: '/products',
          icon: IconPackage,
        },
      ],
    },
    // ... rest of navigation
  ],
}
```

### Bước 6: Tạo Store (Optional)

**`src/stores/productsStore.ts`**

```tsx
import { create } from 'zustand'

interface Product {
  id: number
  name: string
  price: number
  category: string
  status: 'active' | 'inactive'
}

interface ProductsStore {
  products: Product[]
  loading: boolean
  fetchProducts: () => Promise<void>
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: number, product: Partial<Product>) => void
  deleteProduct: (id: number) => void
}

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true })
    try {
      // API call here
      const response = await fetch('/api/products')
      const products = await response.json()
      set({ products, loading: false })
    } catch (error) {
      console.error('Failed to fetch products:', error)
      set({ loading: false })
    }
  },

  addProduct: (product) => {
    const newProduct = {
      ...product,
      id: Date.now(), // Temporary ID
    }
    set((state) => ({
      products: [...state.products, newProduct],
    }))
  },

  updateProduct: (id, updatedProduct) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? { ...product, ...updatedProduct } : product
      ),
    }))
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    }))
  },
}))
```

### Bước 7: Build và Test

```bash
# Build project để cập nhật route tree
pnpm run build

# Chạy development server
pnpm run dev
```

## 🎯 Best Practices

### 1. **Tổ chức Code**

- Sử dụng feature-based organization
- Tách biệt components, hooks, và utilities
- Đặt tên file rõ ràng và nhất quán

### 2. **TypeScript**

- Định nghĩa types/interfaces cho data
- Sử dụng type safety cho props và state
- Tận dụng Zod cho validation

### 3. **State Management**

- Sử dụng Zustand cho global state
- Local state với useState cho component-specific data
- Tách biệt business logic khỏi UI components

### 4. **API Integration**

```tsx
// Tạo custom hook cho API calls
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  return { products, loading, error, fetchProducts }
}
```

### 5. **Error Handling**

```tsx
// Sử dụng error boundaries và proper error handling
import { toast } from 'sonner'

const handleSubmit = async (data: FormData) => {
  try {
    await createProduct(data)
    toast.success('Product created successfully')
  } catch (error) {
    toast.error('Failed to create product')
    console.error(error)
  }
}
```

### 6. **Accessibility**

- Sử dụng semantic HTML
- Thêm proper ARIA labels
- Đảm bảo keyboard navigation
- Test với screen readers

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **Route không được nhận diện**
   ```bash
   # Chạy build để cập nhật route tree
   pnpm run build
   ```

2. **Import errors**
   - Kiểm tra đường dẫn import
   - Đảm bảo file đã được tạo
   - Check TypeScript config

3. **Styling issues**
   - Kiểm tra Tailwind classes
   - Đảm bảo component được import đúng
   - Check CSS conflicts

4. **State không cập nhật**
   - Kiểm tra Zustand store setup
   - Verify component re-renders
   - Check dependency arrays trong useEffect

### Debug Tips:

```tsx
// Sử dụng React DevTools
// Thêm console.log để debug
// Sử dụng TanStack Router DevTools
// Check browser console cho errors
```

## 📚 Tài liệu tham khảo

- [TanStack Router Docs](https://tanstack.com/router/latest)
- [Shadcn UI Components](https://ui.shadcn.com)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

---

**Lưu ý:** Tài liệu này sẽ được cập nhật khi có thay đổi trong project structure hoặc best practices mới.
