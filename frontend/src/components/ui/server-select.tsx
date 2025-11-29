import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { ChevronDown, X, Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

// Types
export type Row = Record<string, any>

export interface FetchParams {
  page: number
  limit: number
  search?: string
  sortField?: string
  sortOrder?: 1 | -1
  filters?: Record<string, any>
}

export interface BackendPagination {
  total: number
  page: number
  limit: number
  pageCount: number
  hasNext: boolean
  hasPrev: boolean
}

export interface FetchResult {
  data: Row[]
  pagination: BackendPagination
}

export interface ColumnDef {
  field: string
  header: string
  width?: string
}

export interface ServerSelectProps {
  value?: any | any[]
  onChange?: (value: any | any[]) => void
  onSelected?: (rows: Row | Row[]) => void
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
  pageSize?: number
  overlayWidth?: string | number
  optionLabel?: string | ((row: Row) => string)
  optionValue?: string | ((row: Row) => any)
  dataKeyField?: string
  ensureSelectedVisible?: boolean
  columns: ColumnDef[]
  fetcher: (params: FetchParams) => Promise<FetchResult>
  resolveByValue?: (value: any | any[]) => Promise<Row | Row[] | null>
  showSearch?: boolean
  showClear?: boolean
  dropdownIcon?: React.ReactNode
  className?: string
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}

export const ServerSelect: React.FC<ServerSelectProps> = ({
  value,
  onChange,
  onSelected,
  multiple = false,
  placeholder = 'Chọn...',
  disabled = false,
  pageSize = 20,
  overlayWidth = '720px',
  optionLabel = 'name',
  optionValue = 'id',
  dataKeyField = 'id',
  ensureSelectedVisible = false,
  columns,
  fetcher,
  resolveByValue,
  showSearch = true,
  showClear = true,
  dropdownIcon,
  className,
}) => {
  // State
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Row[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(pageSize)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<1 | -1 | undefined>(undefined)
  const [selectedRows, setSelectedRows] = useState<Row[]>([])

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMobile = useIsMobile()
  const debouncedSearch = useDebounce(search, 600)

  // Computed values
  const resolvedDataKeyField = useMemo(() => {
    if (typeof optionValue === 'string') return optionValue
    return dataKeyField
  }, [optionValue, dataKeyField])

  const selectedList = useMemo(() => {
    if (multiple) return selectedRows
    return selectedRows.length > 0 ? [selectedRows[0]] : []
  }, [selectedRows, multiple])

  const displayText = useMemo(() => {
    if (selectedList.length === 0) return ''
    return selectedList.map(getLabel).join(', ')
  }, [selectedList])

  const showClearButton = useMemo(() => {
    return showClear && !disabled && selectedList.length > 0
  }, [showClear, disabled, selectedList.length])

  // Helper functions
  const getValue = useCallback((row: Row) => {
    if (!row) return row
    if (typeof optionValue === 'function') return optionValue(row)
    if (typeof optionValue === 'string') return row[optionValue]
    return row[resolvedDataKeyField]
  }, [optionValue, resolvedDataKeyField])

  const getLabel = useCallback((row: Row) => {
    if (!row) return ''
    if (typeof optionLabel === 'function') return optionLabel(row)
    if (typeof optionLabel === 'string') return row[optionLabel]
    return row.name ?? row.label ?? row.title ?? `${getValue(row)}`
  }, [optionLabel, getValue])

  // API functions
  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const result = await fetcher({
        page,
        limit,
        search: debouncedSearch?.trim() || undefined,
        sortField,
        sortOrder,
      })

      const newItems = Array.isArray(result?.data) ? result.data : []
      const pagination = result?.pagination ?? { total: 0, page: 1, limit: 20 }

      setItems(newItems)
      setTotalRecords(pagination?.total ?? 0)
      if (typeof pagination?.page === 'number') setPage(pagination.page)
      if (typeof pagination?.limit === 'number') setLimit(pagination.limit)

      if (ensureSelectedVisible) {
        pinSelectedToTop(newItems)
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error loading data:', error)
      }
      setItems([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }, [page, limit, debouncedSearch, sortField, sortOrder, fetcher, ensureSelectedVisible])

  const pinSelectedToTop = useCallback((newItems: Row[]) => {
    if (!ensureSelectedVisible || selectedList.length === 0) return

    const seen = new Set<any>()
    const pinned = selectedList.filter((row) => {
      const key = getValue(row)
      if (key == null || seen.has(key)) return false
      seen.add(key)
      return true
    })

    const rest = newItems.filter((row) => !seen.has(getValue(row)))
    setItems([...pinned, ...rest])
  }, [ensureSelectedVisible, selectedList, getValue])

  // Sync selection from external value
  const syncFromValue = useCallback(async () => {
    if (value == null || (Array.isArray(value) && value.length === 0)) {
      setSelectedRows([])
      return
    }

    const mapByValue = (rows: Row[], val: any) => rows.find((r) => getValue(r) === val)

    if (multiple && Array.isArray(value)) {
      const found: Row[] = []
      value.forEach((val) => {
        const row = mapByValue(items, val)
        if (row) found.push(row)
      })
      if (found.length === value.length) {
        setSelectedRows(found)
        return
      }
    } else {
      const row = mapByValue(items, value)
      if (row) {
        setSelectedRows([row])
        return
      }
    }

    // Try to resolve by value if not found in current items
    if (resolveByValue) {
      try {
        const resolved = await resolveByValue(value)
        if (Array.isArray(resolved)) {
          setSelectedRows(multiple ? resolved : resolved.slice(0, 1))
        } else if (resolved) {
          setSelectedRows(multiple ? [resolved] : [resolved])
        }
      } catch (error) {
        console.error('Error resolving value:', error)
      }
    }
  }, [value, multiple, items, getValue, resolveByValue])

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 1 ? -1 : 1)
    } else {
      setSortField(field)
      setSortOrder(1)
    }
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowSelect = (row: Row) => {
    if (multiple) {
      const isSelected = selectedRows.some((r) => getValue(r) === getValue(row))
      if (isSelected) {
        setSelectedRows(selectedRows.filter((r) => getValue(r) !== getValue(row)))
      } else {
        setSelectedRows([...selectedRows, row])
      }
    } else {
      setSelectedRows([row])
    }
  }

  const handleRowDoubleClick = (row: Row) => {
    if (!multiple) {
      setSelectedRows([row])
      applySelection([row])
    }
  }

  const applySelection = (rows?: Row[]) => {
    const finalRows = rows || selectedList
    if (multiple) {
      const values = finalRows.map(getValue)
      onChange?.(values)
      onSelected?.(finalRows)
    } else {
      const row = finalRows[0] || null
      const val = row ? getValue(row) : null
      onChange?.(val)
      if (row) onSelected?.(row)
    }
    setOpen(false)
  }

  const clearSelection = () => {
    setSelectedRows([])
    if (multiple) {
      onChange?.([])
      onSelected?.([])
    } else {
      onChange?.(null)
    }
  }

  const isRowSelected = (row: Row) => {
    return selectedRows.some((r) => getValue(r) === getValue(row))
  }

  // Effects
  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    syncFromValue()
  }, [syncFromValue])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Render helpers
  const renderPagination = () => {
    const totalPages = Math.ceil(totalRecords / limit)
    const startItem = (page - 1) * limit + 1
    const endItem = Math.min(page * limit, totalRecords)

    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between px-4 py-2 border-t">
        <div className="text-sm text-muted-foreground">
          Hiển thị {startItem}-{endItem} trong {totalRecords} kết quả
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            Trước
          </Button>
          <span className="text-sm">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Sau
          </Button>
        </div>
      </div>
    )
  }

  const overlayStyle = useMemo(() => ({
    width: isMobile
      ? '96vw'
      : typeof overlayWidth === 'number'
        ? `${overlayWidth}px`
        : overlayWidth,
    maxWidth: '98vw',
    maxHeight: isMobile ? '85vh' : '80vh',
  }), [isMobile, overlayWidth])

  return (
    <div className={cn('w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between',
              !displayText && 'text-muted-foreground',
              disabled && 'opacity-60 pointer-events-none'
            )}
            disabled={disabled}
          >
            <span className="truncate">
              {displayText || placeholder}
            </span>
            <div className="flex items-center gap-1">
              {showClearButton && (
                <X
                  className="h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearSelection()
                  }}
                />
              )}
              {dropdownIcon || <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          style={overlayStyle}
          align="start"
        >
          <div className="flex flex-col">
            {/* Header / Search */}
            {showSearch && (
              <div className="flex items-center gap-2 p-3 border-b">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm..."
                    value={search}
                    onChange={handleSearchChange}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {/* Table */}
            <div className="flex-1">
              <ScrollArea className="h-[380px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {multiple && (
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedList.length > 0 && selectedList.length === items.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedRows([...items])
                              } else {
                                setSelectedRows([])
                              }
                            }}
                          />
                        </TableHead>
                      )}
                      {columns.map((col) => (
                        <TableHead
                          key={col.field}
                          className={cn(
                            'cursor-pointer hover:bg-muted/50',
                            col.width && `w-[${col.width}]`
                          )}
                          onClick={() => handleSort(col.field)}
                        >
                          <div className="flex items-center gap-2">
                            {col.header}
                            {sortField === col.field && (
                              <span className="text-xs">
                                {sortOrder === 1 ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {multiple && (
                            <TableCell>
                              <Skeleton className="h-4 w-4" />
                            </TableCell>
                          )}
                          {columns.map((col) => (
                            <TableCell key={col.field}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length + (multiple ? 1 : 0)}
                          className="text-center text-muted-foreground py-8"
                        >
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((row, index) => (
                        <TableRow
                          key={getValue(row) || index}
                          className={cn(
                            'cursor-pointer hover:bg-muted/50',
                            isRowSelected(row) && 'bg-muted'
                          )}
                          onClick={() => handleRowSelect(row)}
                          onDoubleClick={() => handleRowDoubleClick(row)}
                        >
                          {multiple && (
                            <TableCell>
                              <Checkbox
                                checked={isRowSelected(row)}
                                onChange={() => handleRowSelect(row)}
                              />
                            </TableCell>
                          )}
                          {columns.map((col) => (
                            <TableCell key={col.field} className="truncate">
                              {row[col.field]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            {/* Pagination */}
            {renderPagination()}

            {/* Footer */}
            <div className="flex justify-end gap-2 p-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Đóng
              </Button>
              <Button
                size="sm"
                disabled={selectedList.length === 0}
                onClick={() => applySelection()}
              >
                <Check className="h-4 w-4 mr-2" />
                Chọn
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
