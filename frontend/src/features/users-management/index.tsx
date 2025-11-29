import { useState } from 'react'
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
import { DataTable, type ColumnDef } from '@/components/ui/data-table'
import { useDataTable } from '@/hooks/use-data-table'
import { userService } from '@/api/services'
import type { IamUser } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  createTextColumn,
  createCustomColumn,
} from '@/utils/data-table-utils'
import { IconEye, IconEdit } from '@tabler/icons-react'
import { UserDialog } from './components/user-dialog'

// Query function for DataTable
const fetchIamUsers = async (params: {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  searchValue: string
  filters: Record<string, any>
}) => {
  const response = await userService.getIamUsers({
    page: params.page,
    limit: params.pageSize,
  })

  // Apply client-side search if needed (API might not support search yet)
  let filteredData = response.data
  if (params.searchValue) {
    const searchLower = params.searchValue.toLowerCase()
    filteredData = filteredData.filter(
      (user) =>
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchLower))
    )
  }

  // Apply client-side sorting if needed
  if (params.sortBy) {
    filteredData = [...filteredData].sort((a, b) => {
      const aValue = a[params.sortBy as keyof IamUser]
      const bValue = b[params.sortBy as keyof IamUser]

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return params.sortOrder === 'asc' ? -1 : 1
      if (bValue == null) return params.sortOrder === 'asc' ? 1 : -1

      if (aValue < bValue) return params.sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return params.sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  return {
    data: filteredData,
    pagination: {
      page: response.pagination.page,
      pageSize: response.pagination.limit,
      total: params.searchValue ? filteredData.length : response.pagination.total,
      totalPages: params.searchValue
        ? Math.ceil(filteredData.length / params.pageSize)
        : response.pagination.totalPages,
    },
  }
}

// Component for actions cell to access handlers
function UserActionsCell({ 
  userId, 
  onView, 
  onEdit 
}: { 
  userId: string
  onView: (id: string) => void
  onEdit: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0"
        onClick={() => onView(userId)}
        title="Xem chi tiết"
      >
        <IconEye className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 w-8 p-0"
        onClick={() => onEdit(userId)}
        title="Chỉnh sửa"
      >
        <IconEdit className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Column definitions factory
const createColumns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void
): ColumnDef<IamUser>[] => [
  createTextColumn<IamUser>('username', 'Tên đăng nhập', 'username', {
    sortable: true,
    filterable: true,
    width: '150px',
  }),
  createTextColumn<IamUser>('email', 'Email', 'email', {
    sortable: true,
    filterable: true,
    width: '200px',
  }),
  createTextColumn<IamUser>('firstName', 'Họ', 'firstName', {
    sortable: true,
    filterable: true,
    width: '120px',
    formatter: (value) => value || '-',
  }),
  createTextColumn<IamUser>('lastName', 'Tên', 'lastName', {
    sortable: true,
    filterable: true,
    width: '120px',
    formatter: (value) => value || '-',
  }),
  createTextColumn<IamUser>('phone', 'Số điện thoại', 'phone', {
    sortable: true,
    filterable: true,
    width: '130px',
    formatter: (value) => value || '-',
  }),
  createCustomColumn<IamUser>(
    'isActive',
    'Trạng thái',
    ({ row }) => (
      <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
        {row.original.isActive ? 'Hoạt động' : 'Không hoạt động'}
      </Badge>
    ),
    {
      sortable: true,
      filterable: true,
      width: '120px',
    }
  ),
  createCustomColumn<IamUser>(
    'isEmailVerified',
    'Xác thực email',
    ({ row }) => (
      <Badge variant={row.original.isEmailVerified ? 'default' : 'outline'}>
        {row.original.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
      </Badge>
    ),
    {
      sortable: true,
      filterable: true,
      width: '130px',
    }
  ),
  createCustomColumn<IamUser>(
    'lastLoginAt',
    'Đăng nhập lần cuối',
    ({ row }) => {
      if (!row.original.lastLoginAt) {
        return <span className="text-muted-foreground">Chưa đăng nhập</span>
      }
      return new Date(row.original.lastLoginAt).toLocaleString('vi-VN')
    },
    {
      sortable: true,
      filterable: true,
      width: '180px',
    }
  ),
  createCustomColumn<IamUser>(
    'actions',
    'Thao tác',
    ({ row }) => (
      <UserActionsCell userId={row.original.id} onView={onView} onEdit={onEdit} />
    ),
    {
      width: '100px',
    }
  ),
]

export default function UsersManagement() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view')

  const dataTable = useDataTable<IamUser>({
    queryKey: ['iam-users'],
    queryFn: fetchIamUsers,
    initialPageSize: 10,
    initialSortBy: 'createdAt',
    initialSortOrder: 'desc',
  })

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId)
    setDialogMode('view')
    setDialogOpen(true)
  }

  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const columns = createColumns(handleViewUser, handleEditUser)

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='flex items-center space-x-4'>
          <h1 className='text-lg font-semibold'>Quản lý người dùng</h1>
        </div>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold tracking-tight'>Quản lý người dùng</h1>
          <p className='text-muted-foreground'>
            Quản lý và xem thông tin người dùng trong hệ thống
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng</CardTitle>
            <CardDescription>
              Quản lý và xem thông tin tất cả người dùng trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              searchPlaceholder="Tìm kiếm người dùng..."
              emptyMessage="Không có người dùng nào"
              loadingRows={5}
            />
          </CardContent>
        </Card>

        {/* User Dialog */}
        <UserDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          userId={selectedUserId}
          mode={dialogMode}
        />
      </Main>
    </>
  )
}

