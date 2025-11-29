import { DataTable, ColumnDef } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { 
  createTextColumn, 
  createNumberColumn, 
  createDateColumn, 
  createCurrencyColumn,
  createStatusColumn,
  createActionsColumn 
} from '@/utils/data-table-utils'
import { useDataTable } from '@/hooks/use-data-table'
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react'

// Sample data type
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

// Sample data
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro 15"',
    category: 'Electronics',
    price: 25000000,
    stock: 50,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    category: 'Accessories',
    price: 500000,
    stock: 200,
    status: 'active',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T16:20:00Z',
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    category: 'Accessories',
    price: 1200000,
    stock: 0,
    status: 'inactive',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-12T13:30:00Z',
  },
  {
    id: '4',
    name: 'Gaming Chair',
    category: 'Furniture',
    price: 3500000,
    stock: 15,
    status: 'draft',
    createdAt: '2024-01-20T08:45:00Z',
    updatedAt: '2024-01-22T10:15:00Z',
  },
  {
    id: '5',
    name: 'Monitor 4K 27"',
    category: 'Electronics',
    price: 8000000,
    stock: 25,
    status: 'active',
    createdAt: '2024-01-18T14:20:00Z',
    updatedAt: '2024-01-25T09:30:00Z',
  },
]

// Mock API function
const fetchProducts = async (params: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const { page, pageSize, sortBy, sortOrder, searchValue, filters } = params
  
  // Filter data
  let filteredData = [...sampleProducts]
  
  // Search filter
  if (searchValue) {
    filteredData = filteredData.filter(product =>
      product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.category.toLowerCase().includes(searchValue.toLowerCase())
    )
  }
  
  // Status filter
  if (filters.status) {
    filteredData = filteredData.filter(product => product.status === filters.status)
  }
  
  // Category filter
  if (filters.category) {
    filteredData = filteredData.filter(product => product.category === filters.category)
  }
  
  // Sort data
  if (sortBy) {
    filteredData.sort((a, b) => {
      const aValue = a[sortBy as keyof Product]
      const bValue = b[sortBy as keyof Product]
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }
  
  // Paginate data
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)
  
  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      total: filteredData.length,
      totalPages: Math.ceil(filteredData.length / pageSize),
    },
  }
}

// Column definitions
const columns: ColumnDef<Product>[] = [
  createTextColumn<Product>(
    'name',
    'Tên sản phẩm',
    'name',
    {
      sortable: true,
      filterable: true,
      width: '200px',
    }
  ),
  
  createTextColumn<Product>(
    'category',
    'Danh mục',
    'category',
    {
      sortable: true,
      filterable: true,
      width: '150px',
    }
  ),
  
  createCurrencyColumn<Product>(
    'price',
    'Giá',
    'price',
    {
      sortable: true,
      filterable: true,
      width: '120px',
      currency: 'VND',
    }
  ),
  
  createNumberColumn<Product>(
    'stock',
    'Tồn kho',
    'stock',
    {
      sortable: true,
      filterable: true,
      width: '100px',
      formatter: (value) => value.toLocaleString(),
    }
  ),
  
  createStatusColumn<Product>(
    'status',
    'Trạng thái',
    'status',
    {
      active: { label: 'Hoạt động', variant: 'default' },
      inactive: { label: 'Không hoạt động', variant: 'secondary' },
      draft: { label: 'Bản nháp', variant: 'outline' },
    },
    {
      sortable: true,
      filterable: true,
      width: '120px',
    }
  ),
  
  createDateColumn<Product>(
    'createdAt',
    'Ngày tạo',
    'createdAt',
    {
      sortable: true,
      filterable: true,
      width: '120px',
      format: 'date',
    }
  ),
  
  createActionsColumn<Product>(
    'actions',
    'Thao tác',
    () => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <IconEye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <IconEdit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    ),
    {
      width: '120px',
    }
  ),
]

// Main component
export function DataTableExample() {
  const dataTable = useDataTable<Product>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    initialPageSize: 10,
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
  })

  const handleAddProduct = () => {
    console.log('Add new product')
  }

  const handleExport = () => {
    console.log('Export data')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ví dụ DataTable</h1>
          <p className="text-muted-foreground">
            Component DataTable với lazy loading, pagination, sorting và filtering
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            Xuất dữ liệu
          </Button>
          <Button onClick={handleAddProduct}>
            Thêm sản phẩm
          </Button>
        </div>
      </div>

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
        emptyMessage="Không tìm thấy sản phẩm nào"
        loadingRows={5}
      />

      {/* Debug info */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <pre className="text-sm">
          {JSON.stringify({
            page: dataTable.state.page,
            pageSize: dataTable.state.pageSize,
            sortBy: dataTable.state.sortBy,
            sortOrder: dataTable.state.sortOrder,
            searchValue: dataTable.state.searchValue,
            filters: dataTable.state.filters,
            total: dataTable.total,
            dataLength: dataTable.data.length,
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default DataTableExample
