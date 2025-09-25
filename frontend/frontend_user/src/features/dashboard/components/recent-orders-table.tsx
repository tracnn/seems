import { DataTable, ColumnDef } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  createTextColumn, 
  createDateColumn, 
  createCurrencyColumn,
  createStatusColumn,
  createActionsColumn 
} from '@/utils/data-table-utils'
import { useDataTable } from '@/hooks/use-data-table'
import { IconEye, IconEdit, IconTrash } from '@tabler/icons-react'

// Sample data type
interface Order {
  id: string
  customerName: string
  product: string
  amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  priority: 'low' | 'medium' | 'high'
}

// Sample data
const sampleOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Nguyễn Văn A',
    product: 'Laptop Dell XPS 13',
    amount: 25000000,
    status: 'processing',
    orderDate: '2024-01-25T10:30:00Z',
    priority: 'high',
  },
  {
    id: 'ORD-002',
    customerName: 'Trần Thị B',
    product: 'iPhone 15 Pro',
    amount: 32000000,
    status: 'shipped',
    orderDate: '2024-01-24T14:20:00Z',
    priority: 'medium',
  },
  {
    id: 'ORD-003',
    customerName: 'Lê Văn C',
    product: 'Samsung Galaxy S24',
    amount: 28000000,
    status: 'delivered',
    orderDate: '2024-01-23T09:15:00Z',
    priority: 'low',
  },
  {
    id: 'ORD-004',
    customerName: 'Phạm Thị D',
    product: 'MacBook Air M3',
    amount: 35000000,
    status: 'pending',
    orderDate: '2024-01-22T16:45:00Z',
    priority: 'high',
  },
  {
    id: 'ORD-005',
    customerName: 'Hoàng Văn E',
    product: 'iPad Pro 12.9"',
    amount: 22000000,
    status: 'cancelled',
    orderDate: '2024-01-21T11:30:00Z',
    priority: 'medium',
  },
  {
    id: 'ORD-006',
    customerName: 'Vũ Thị F',
    product: 'AirPods Pro 2',
    amount: 5500000,
    status: 'delivered',
    orderDate: '2024-01-20T13:20:00Z',
    priority: 'low',
  },
  {
    id: 'ORD-007',
    customerName: 'Đặng Văn G',
    product: 'Apple Watch Series 9',
    amount: 12000000,
    status: 'processing',
    orderDate: '2024-01-19T08:10:00Z',
    priority: 'medium',
  },
  {
    id: 'ORD-008',
    customerName: 'Bùi Thị H',
    product: 'Sony WH-1000XM5',
    amount: 8500000,
    status: 'shipped',
    orderDate: '2024-01-18T15:30:00Z',
    priority: 'low',
  },
]

// API function using the new API structure
const fetchOrders = async (params: any) => {
  // For now, we'll use mock data but with the same structure as the real API
  // In production, this would call: return await orderService.getOrders(params)
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const { page, pageSize, sortBy, sortOrder, searchValue, filters } = params
  
  // Filter data
  let filteredData = [...sampleOrders]
  
  // Search filter
  if (searchValue) {
    filteredData = filteredData.filter(order =>
      order.customerName.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.product.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.id.toLowerCase().includes(searchValue.toLowerCase())
    )
  }
  
  // Status filter
  if (filters.status) {
    filteredData = filteredData.filter(order => order.status === filters.status)
  }
  
  // Priority filter
  if (filters.priority) {
    filteredData = filteredData.filter(order => order.priority === filters.priority)
  }
  
  // Sort data
  if (sortBy) {
    filteredData.sort((a, b) => {
      const aValue = a[sortBy as keyof Order]
      const bValue = b[sortBy as keyof Order]
      
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
const columns: ColumnDef<Order>[] = [
  createTextColumn<Order>(
    'id',
    'Mã đơn hàng',
    'id',
    {
      sortable: true,
      filterable: true,
      width: '120px',
      className: 'font-mono text-sm',
    }
  ),
  
  createTextColumn<Order>(
    'customerName',
    'Khách hàng',
    'customerName',
    {
      sortable: true,
      filterable: true,
      width: '150px',
    }
  ),
  
  createTextColumn<Order>(
    'product',
    'Sản phẩm',
    'product',
    {
      sortable: true,
      filterable: true,
      width: '200px',
    }
  ),
  
  createCurrencyColumn<Order>(
    'amount',
    'Giá trị',
    'amount',
    {
      sortable: true,
      filterable: true,
      width: '120px',
      currency: 'VND',
    }
  ),
  
  createStatusColumn<Order>(
    'status',
    'Trạng thái',
    'status',
    {
      pending: { label: 'Chờ xử lý', variant: 'outline' },
      processing: { label: 'Đang xử lý', variant: 'default' },
      shipped: { label: 'Đã gửi', variant: 'default' },
      delivered: { label: 'Đã giao', variant: 'default' },
      cancelled: { label: 'Đã hủy', variant: 'destructive' },
    },
    {
      sortable: true,
      filterable: true,
      width: '120px',
    }
  ),
  
  createDateColumn<Order>(
    'orderDate',
    'Ngày đặt',
    'orderDate',
    {
      sortable: true,
      filterable: true,
      width: '120px',
      format: 'date',
    }
  ),
  
  createActionsColumn<Order>(
    'actions',
    'Thao tác',
    () => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <IconEye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <IconEdit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    ),
    {
      width: '100px',
    }
  ),
]

// Main component
export function RecentOrdersTable() {
  const dataTable = useDataTable<Order>({
    queryKey: ['recent-orders'],
    queryFn: fetchOrders,
    initialPageSize: 5,
    initialSortBy: 'orderDate',
    initialSortOrder: 'desc',
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Đơn hàng gần đây</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý và theo dõi các đơn hàng mới nhất
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {dataTable.total} đơn hàng
          </Badge>
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
        searchPlaceholder="Tìm kiếm đơn hàng..."
        emptyMessage="Không có đơn hàng nào"
        loadingRows={3}
      />
    </div>
  )
}

export default RecentOrdersTable
