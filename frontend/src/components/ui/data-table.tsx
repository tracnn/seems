import * as React from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

// Types
export interface ColumnDef<T> {
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

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  error?: string | null
  // Pagination
  total?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  // Sorting
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  // Filtering
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  // Actions
  actions?: React.ReactNode
  // Styling
  className?: string
  emptyMessage?: string
  loadingRows?: number
}

export interface PaginationInfo {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
}

// Utility functions
const getPaginationInfo = (
  total: number,
  page: number,
  pageSize: number
): PaginationInfo => {
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, total)

  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    startIndex,
    endIndex,
  }
}

// Sort icons component
const SortIcon = ({ 
  sortBy, 
  columnId, 
  sortOrder 
}: { 
  sortBy?: string
  columnId: string
  sortOrder?: 'asc' | 'desc'
}) => {
  if (sortBy !== columnId) {
    return <ChevronsUpDown className="h-4 w-4 opacity-50" />
  }
  
  return sortOrder === 'asc' 
    ? <ChevronUp className="h-4 w-4" />
    : <ChevronDown className="h-4 w-4" />
}

// Loading skeleton row
const LoadingRow = ({ columns }: { columns: ColumnDef<any>[] }) => (
  <TableRow>
    {columns.map((column, index) => (
      <TableCell key={column.id || index} className={column.className}>
        <Skeleton className="h-4 w-full" />
      </TableCell>
    ))}
  </TableRow>
)

// Main DataTable component
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  total = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder,
  onSortChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  actions,
  className,
  emptyMessage = 'Không có dữ liệu',
  loadingRows = 5,
}: DataTableProps<T>) {
  const paginationInfo = getPaginationInfo(total, page, pageSize)

  const handleSort = (columnId: string) => {
    if (!onSortChange) return
    
    const column = columns.find(col => col.id === columnId)
    if (!column?.sortable) return

    let newSortOrder: 'asc' | 'desc' = 'asc'
    if (sortBy === columnId && sortOrder === 'asc') {
      newSortOrder = 'desc'
    }
    
    onSortChange(columnId, newSortOrder)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value)
  }

  const clearSearch = () => {
    onSearchChange?.('')
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-8 pr-8"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    'whitespace-nowrap',
                    column.className,
                    column.sortable && 'cursor-pointer select-none hover:bg-muted/50',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className={cn(
                    'flex items-center gap-2',
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end'
                  )}>
                    {column.header}
                    {column.sortable && (
                      <SortIcon
                        sortBy={sortBy}
                        columnId={column.id}
                        sortOrder={sortOrder}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state
              Array.from({ length: loadingRows }).map((_, index) => (
                <LoadingRow key={index} columns={columns} />
              ))
            ) : error ? (
              // Error state
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-destructive"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-sm font-medium">Có lỗi xảy ra</div>
                    <div className="text-xs text-muted-foreground">{error}</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        column.className,
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.cell ? (
                        column.cell({ row: { original: row } })
                      ) : column.accessorKey ? (
                        row[column.accessorKey]
                      ) : (
                        ''
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Hiển thị {paginationInfo.startIndex} đến {paginationInfo.endIndex} trong tổng số {total} mục
            </span>
            <div className="flex items-center gap-2">
              <span>Số mục mỗi trang:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => onPageSizeChange?.(parseInt(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={!paginationInfo.hasPreviousPage}
            >
              Trước
            </Button>
            
            <div className="flex items-center gap-1">
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                let pageNum: number
                if (paginationInfo.totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= paginationInfo.totalPages - 2) {
                  pageNum = paginationInfo.totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => onPageChange?.(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={!paginationInfo.hasNextPage}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export utility types and functions
export { getPaginationInfo }
