# DataTable Component - Hướng dẫn sử dụng

DataTable là một component mạnh mẽ với đầy đủ tính năng lazy loading, pagination, sorting, filtering và search được xây dựng trên Shadcn UI và TanStack Query.

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Cài đặt và Import](#cài-đặt-và-import)
3. [Cấu trúc cơ bản](#cấu-trúc-cơ-bản)
4. [Định nghĩa Columns](#định-nghĩa-columns)
5. [Sử dụng với TanStack Query](#sử-dụng-với-tanstack-query)
6. [Tính năng nâng cao](#tính-năng-nâng-cao)
7. [Ví dụ thực tế](#ví-dụ-thực-tế)
8. [API Reference](#api-reference)
9. [Best Practices](#best-practices)

## 🎯 Tổng quan

DataTable component cung cấp:

- ✅ **Lazy Loading**: Tải dữ liệu theo trang
- ✅ **Pagination**: Phân trang với điều hướng
- ✅ **Sorting**: Sắp xếp theo cột
- ✅ **Search**: Tìm kiếm toàn văn
- ✅ **Filtering**: Lọc dữ liệu
- ✅ **Loading States**: Trạng thái loading
- ✅ **Error Handling**: Xử lý lỗi
- ✅ **Responsive**: Tương thích mobile
- ✅ **Accessibility**: Hỗ trợ accessibility
- ✅ **TypeScript**: Type safety đầy đủ

## 🚀 Cài đặt và Import

```typescript
// Import component chính
import { DataTable, ColumnDef } from '@/components/ui/data-table'

// Import hooks
import { useDataTable } from '@/hooks/use-data-table'

// Import utilities
import { 
  createTextColumn, 
  createNumberColumn, 
  createDateColumn,
  createCurrencyColumn,
  createStatusColumn,
  createActionsColumn 
} from '@/utils/data-table-utils'
```

## 🏗️ Cấu trúc cơ bản

### 1. Định nghĩa kiểu dữ liệu

```typescript
interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: 'active' | 'inactive' | 'draft'
  createdAt: string
  updatedAt: string
}
```

### 2. Tạo API function

```typescript
const fetchProducts = async (params: {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  searchValue: string
  filters: Record<string, any>
}) => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  
  return response.json()
}
```

### 3. Sử dụng hook

```typescript
const dataTable = useDataTable<Product>({
  queryKey: ['products'],
  queryFn: fetchProducts,
  initialPageSize: 10,
  initialSortBy: 'createdAt',
  initialSortOrder: 'desc',
})
```

### 4. Render component

```typescript
<DataTable
  data={dataTable.data}
  columns={columns}
  loading={dataTable.isLoading}
  error={dataTable.error}
  total={dataTable.total}
  page={dataTable.state.page}
  pageSize={dataTable.state.pageSize}
  onPageChange={dataTable.setPage}
  onPageSizeChange={dataTable.setPageSize}
  sortBy={dataTable.state.sortBy}
  sortOrder={dataTable.state.sortOrder}
  onSortChange={dataTable.setSorting}
  searchValue={dataTable.state.searchValue}
  onSearchChange={dataTable.setSearch}
  searchPlaceholder="Tìm kiếm sản phẩm..."
/>
```

## 📊 Định nghĩa Columns

### 1. Text Column

```typescript
const nameColumn = createTextColumn<Product>(
  'name',           // ID
  'Tên sản phẩm',   // Header
  'name',           // Accessor key
  {
    sortable: true,
    filterable: true,
    width: '200px',
    align: 'left',
  }
)
```

### 2. Number Column

```typescript
const priceColumn = createNumberColumn<Product>(
  'price',
  'Giá',
  'price',
  {
    sortable: true,
    align: 'right',
    formatter: (value) => value.toLocaleString(),
  }
)
```

### 3. Currency Column

```typescript
const priceColumn = createCurrencyColumn<Product>(
  'price',
  'Giá',
  'price',
  {
    sortable: true,
    currency: 'VND',
    locale: 'vi-VN',
  }
)
```

### 4. Date Column

```typescript
const dateColumn = createDateColumn<Product>(
  'createdAt',
  'Ngày tạo',
  'createdAt',
  {
    sortable: true,
    format: 'date', // 'date' | 'datetime' | 'time'
    locale: 'vi-VN',
  }
)
```

### 5. Status Column

```typescript
const statusColumn = createStatusColumn<Product>(
  'status',
  'Trạng thái',
  'status',
  {
    active: { label: 'Hoạt động', variant: 'default' },
    inactive: { label: 'Không hoạt động', variant: 'secondary' },
    draft: { label: 'Bản nháp', variant: 'outline' },
  }
)
```

### 6. Actions Column

```typescript
const actionsColumn = createActionsColumn<Product>(
  'actions',
  'Thao tác',
  ({ row }) => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm">
        <IconEdit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm">
        <IconTrash className="h-4 w-4" />
      </Button>
    </div>
  ),
  {
    width: '120px',
  }
)
```

### 7. Custom Column

```typescript
const customColumn: ColumnDef<Product> = {
  id: 'custom',
  header: 'Custom',
  accessorKey: 'name',
  cell: ({ row }) => (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={row.original.avatar} />
        <AvatarFallback>{row.original.name[0]}</AvatarFallback>
      </Avatar>
      <span>{row.original.name}</span>
    </div>
  ),
  sortable: true,
  filterable: true,
}
```

## 🔄 Sử dụng với TanStack Query

### 1. Cấu hình Query

```typescript
const dataTable = useDataTable<Product>({
  queryKey: ['products'],
  queryFn: fetchProducts,
  initialPageSize: 10,
  initialSortBy: 'createdAt',
  initialSortOrder: 'desc',
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
})
```

### 2. Debounced Search

```typescript
import { useDataTableWithDebounce } from '@/hooks/use-data-table'

const dataTable = useDataTableWithDebounce<Product>(
  {
    queryKey: ['products'],
    queryFn: fetchProducts,
  },
  300 // 300ms delay
)
```

### 3. Manual Refetch

```typescript
const { refetch } = useQuery({
  queryKey: ['products', dataTable.state],
  queryFn: () => fetchProducts(dataTable.state),
})

// Refetch when needed
const handleRefresh = () => {
  refetch()
}
```

## ⚡ Tính năng nâng cao

### 1. Custom Filters

```typescript
const [filters, setFilters] = useState({
  status: '',
  category: '',
  priceRange: { min: 0, max: 1000000 }
})

// Update filters
const handleFilterChange = (newFilters: any) => {
  setFilters(newFilters)
  dataTable.setFilters(newFilters)
}
```

### 2. Export Data

```typescript
import { formatDataForExport, getColumnHeadersForExport } from '@/utils/data-table-utils'

const handleExport = () => {
  const headers = getColumnHeadersForExport(columns)
  const data = formatDataForExport(dataTable.data, columns)
  
  // Export to CSV, Excel, etc.
  exportToCSV(data, headers, 'products.csv')
}
```

### 3. Bulk Actions

```typescript
const [selectedRows, setSelectedRows] = useState<string[]>([])

const handleBulkDelete = async () => {
  await Promise.all(
    selectedRows.map(id => deleteProduct(id))
  )
  dataTable.refetch()
  setSelectedRows([])
}
```

### 4. Inline Editing

```typescript
const [editingRow, setEditingRow] = useState<string | null>(null)

const editableColumn: ColumnDef<Product> = {
  id: 'name',
  header: 'Tên sản phẩm',
  accessorKey: 'name',
  cell: ({ row }) => {
    const isEditing = editingRow === row.original.id
    
    if (isEditing) {
      return (
        <Input
          defaultValue={row.original.name}
          onBlur={(e) => {
            updateProduct(row.original.id, { name: e.target.value })
            setEditingRow(null)
          }}
          autoFocus
        />
      )
    }
    
    return (
      <span 
        className="cursor-pointer hover:bg-muted p-1 rounded"
        onClick={() => setEditingRow(row.original.id)}
      >
        {row.original.name}
      </span>
    )
  },
}
```

## 📝 Ví dụ thực tế

### 1. Products Management

```typescript
import React from 'react'
import { DataTable, ColumnDef } from '@/components/ui/data-table'
import { useDataTable } from '@/hooks/use-data-table'
import { createTextColumn, createCurrencyColumn, createStatusColumn } from '@/utils/data-table-utils'

interface Product {
  id: string
  name: string
  category: string
  price: number
  status: 'active' | 'inactive'
  createdAt: string
}

const columns: ColumnDef<Product>[] = [
  createTextColumn<Product>('name', 'Tên sản phẩm', 'name'),
  createTextColumn<Product>('category', 'Danh mục', 'category'),
  createCurrencyColumn<Product>('price', 'Giá', 'price', { currency: 'VND' }),
  createStatusColumn<Product>(
    'status',
    'Trạng thái',
    'status',
    {
      active: { label: 'Hoạt động', variant: 'default' },
      inactive: { label: 'Không hoạt động', variant: 'secondary' },
    }
  ),
]

export function ProductsTable() {
  const dataTable = useDataTable<Product>({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  return (
    <DataTable
      data={dataTable.data}
      columns={columns}
      loading={dataTable.isLoading}
      error={dataTable.error}
      total={dataTable.total}
      page={dataTable.state.page}
      pageSize={dataTable.state.pageSize}
      onPageChange={dataTable.setPage}
      onPageSizeChange={dataTable.setPageSize}
      sortBy={dataTable.state.sortBy}
      sortOrder={dataTable.state.sortOrder}
      onSortChange={dataTable.setSorting}
      searchValue={dataTable.state.searchValue}
      onSearchChange={dataTable.setSearch}
      searchPlaceholder="Tìm kiếm sản phẩm..."
    />
  )
}
```

### 2. Users Management với Actions

```typescript
const userColumns: ColumnDef<User>[] = [
  createTextColumn<User>('name', 'Tên', 'name'),
  createTextColumn<User>('email', 'Email', 'email'),
  createDateColumn<User>('createdAt', 'Ngày tạo', 'createdAt'),
  createActionsColumn<User>(
    'actions',
    'Thao tác',
    ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          <IconEdit className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="text-destructive">
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    )
  ),
]
```

## 📚 API Reference

### DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | `[]` | Dữ liệu hiển thị |
| `columns` | `ColumnDef<T>[]` | `[]` | Định nghĩa cột |
| `loading` | `boolean` | `false` | Trạng thái loading |
| `error` | `string \| null` | `null` | Thông báo lỗi |
| `total` | `number` | `0` | Tổng số bản ghi |
| `page` | `number` | `1` | Trang hiện tại |
| `pageSize` | `number` | `10` | Số bản ghi mỗi trang |
| `onPageChange` | `(page: number) => void` | - | Callback khi thay đổi trang |
| `onPageSizeChange` | `(pageSize: number) => void` | - | Callback khi thay đổi page size |
| `sortBy` | `string` | - | Cột đang sắp xếp |
| `sortOrder` | `'asc' \| 'desc'` | - | Thứ tự sắp xếp |
| `onSortChange` | `(sortBy: string, sortOrder: 'asc' \| 'desc') => void` | - | Callback khi thay đổi sort |
| `searchValue` | `string` | `''` | Giá trị tìm kiếm |
| `onSearchChange` | `(value: string) => void` | - | Callback khi thay đổi search |
| `searchPlaceholder` | `string` | `'Tìm kiếm...'` | Placeholder cho search |
| `actions` | `React.ReactNode` | - | Actions bổ sung |
| `className` | `string` | - | CSS class |
| `emptyMessage` | `string` | `'Không có dữ liệu'` | Thông báo khi không có dữ liệu |
| `loadingRows` | `number` | `5` | Số dòng loading |

### ColumnDef Interface

```typescript
interface ColumnDef<T> {
  id: string
  header: string | React.ReactNode
  accessorKey?: keyof T
  cell?: (props: { row: { original: T } }) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  className?: string
}
```

### useDataTable Hook

```typescript
interface UseDataTableReturn<T> {
  // Data
  data: T[]
  total: number
  isLoading: boolean
  error: string | null
  
  // State
  state: DataTableState
  
  // Actions
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  setSearch: (searchValue: string) => void
  setFilters: (filters: Record<string, any>) => void
  resetFilters: () => void
  
  // Computed
  paginationInfo: PaginationInfo
}
```

## 🎯 Best Practices

### 1. Performance

```typescript
// Sử dụng React.memo cho cell components
const ProductCell = React.memo(({ product }: { product: Product }) => (
  <div>{product.name}</div>
))

// Debounce search để tránh quá nhiều API calls
const dataTable = useDataTableWithDebounce(config, 300)

// Sử dụng useMemo cho expensive calculations
const filteredData = useMemo(() => {
  return data.filter(item => item.status === 'active')
}, [data])
```

### 2. Error Handling

```typescript
// Xử lý lỗi trong API function
const fetchProducts = async (params: any) => {
  try {
    const response = await api.get('/products', { params })
    return response.data
  } catch (error) {
    throw new Error('Không thể tải danh sách sản phẩm')
  }
}

// Hiển thị lỗi trong UI
{dataTable.error && (
  <Alert variant="destructive">
    <AlertDescription>{dataTable.error}</AlertDescription>
  </Alert>
)}
```

### 3. Accessibility

```typescript
// Thêm ARIA labels
<DataTable
  // ... other props
  className="data-table"
  emptyMessage="Không tìm thấy dữ liệu phù hợp"
/>

// Keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    // Navigate to next row
  }
}
```

### 4. Testing

```typescript
// Test component
import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from '@/components/ui/data-table'

test('renders data table with data', () => {
  const mockData = [{ id: '1', name: 'Test Product' }]
  const mockColumns = [
    { id: 'name', header: 'Name', accessorKey: 'name' }
  ]
  
  render(
    <DataTable data={mockData} columns={mockColumns} />
  )
  
  expect(screen.getByText('Test Product')).toBeInTheDocument()
})

test('handles pagination', () => {
  const onPageChange = jest.fn()
  
  render(
    <DataTable
      data={[]}
      columns={[]}
      total={100}
      page={1}
      onPageChange={onPageChange}
    />
  )
  
  fireEvent.click(screen.getByText('Sau'))
  expect(onPageChange).toHaveBeenCalledWith(2)
})
```

### 5. Customization

```typescript
// Custom styling
const customDataTable = (
  <DataTable
    // ... props
    className="custom-data-table"
  />
)

// Custom CSS
.custom-data-table {
  .table-header {
    background-color: var(--primary);
    color: var(--primary-foreground);
  }
  
  .table-row:hover {
    background-color: var(--muted);
  }
}
```

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **Data không hiển thị**
   - Kiểm tra `accessorKey` trong column definition
   - Verify data structure matches interface
   - Check API response format

2. **Sorting không hoạt động**
   - Đảm bảo `sortable: true` trong column
   - Check `onSortChange` callback
   - Verify API supports sorting

3. **Pagination không cập nhật**
   - Check `onPageChange` callback
   - Verify `total` prop được cập nhật
   - Ensure API returns correct pagination info

4. **Search không hoạt động**
   - Check `onSearchChange` callback
   - Verify API supports search
   - Ensure debounce is configured correctly

### Debug Tips:

```typescript
// Log state changes
useEffect(() => {
  console.log('DataTable state:', dataTable.state)
}, [dataTable.state])

// Log API calls
const fetchProducts = async (params: any) => {
  console.log('Fetching products with params:', params)
  const result = await api.get('/products', { params })
  console.log('API response:', result.data)
  return result.data
}
```

---

**Lưu ý:** DataTable component được thiết kế để hoạt động tốt với TanStack Query và tuân thủ các best practices của React. Hãy đảm bảo API backend hỗ trợ pagination, sorting và filtering để có trải nghiệm tốt nhất.
