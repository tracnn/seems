import React from 'react'
import { ColumnDef } from '@/components/ui/data-table'

// Utility functions for DataTable

/**
 * Creates a text column definition
 */
export function createTextColumn<T>(
  id: string,
  header: string,
  accessorKey: keyof T,
  options?: {
    sortable?: boolean
    filterable?: boolean
    width?: string | number
    align?: 'left' | 'center' | 'right'
    className?: string
    formatter?: (value: any) => string
  }
): ColumnDef<T> {
  return {
    id,
    header,
    accessorKey,
    sortable: options?.sortable ?? true,
    filterable: options?.filterable ?? true,
    width: options?.width,
    align: options?.align ?? 'left',
    className: options?.className,
    cell: options?.formatter 
      ? ({ row }) => options.formatter!(row.original[accessorKey])
      : undefined,
  }
}

/**
 * Creates a number column definition
 */
export function createNumberColumn<T>(
  id: string,
  header: string,
  accessorKey: keyof T,
  options?: {
    sortable?: boolean
    filterable?: boolean
    width?: string | number
    align?: 'left' | 'center' | 'right'
    className?: string
    formatter?: (value: number) => string
  }
): ColumnDef<T> {
  return {
    id,
    header,
    accessorKey,
    sortable: options?.sortable ?? true,
    filterable: options?.filterable ?? true,
    width: options?.width,
    align: options?.align ?? 'right',
    className: options?.className,
    cell: options?.formatter 
      ? ({ row }) => options.formatter!(row.original[accessorKey] as number)
      : ({ row }) => {
          const value = row.original[accessorKey] as number
          return typeof value === 'number' ? value.toLocaleString() : value
        },
  }
}

/**
 * Creates a date column definition
 */
export function createDateColumn<T>(
  id: string,
  header: string,
  accessorKey: keyof T,
  options?: {
    sortable?: boolean
    filterable?: boolean
    width?: string | number
    align?: 'left' | 'center' | 'right'
    className?: string
    format?: 'date' | 'datetime' | 'time'
    locale?: string
  }
): ColumnDef<T> {
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    date: { year: 'numeric', month: 'long', day: 'numeric' },
    datetime: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    time: { hour: '2-digit', minute: '2-digit' },
  }

  return {
    id,
    header,
    accessorKey,
    sortable: options?.sortable ?? true,
    filterable: options?.filterable ?? true,
    width: options?.width,
    align: options?.align ?? 'left',
    className: options?.className,
    cell: ({ row }) => {
      const value = row.original[accessorKey]
      if (!value) return ''
      
      const date = new Date(value as string | number | Date)
      if (isNaN(date.getTime())) return String(value)
      
      return date.toLocaleDateString(
        options?.locale ?? 'vi-VN',
        formatOptions[options?.format ?? 'date']
      )
    },
  }
}

/**
 * Creates a currency column definition
 */
export function createCurrencyColumn<T>(
  id: string,
  header: string,
  accessorKey: keyof T,
  options?: {
    sortable?: boolean
    filterable?: boolean
    width?: string | number
    align?: 'left' | 'center' | 'right'
    className?: string
    currency?: string
    locale?: string
  }
): ColumnDef<T> {
  return {
    id,
    header,
    accessorKey,
    sortable: options?.sortable ?? true,
    filterable: options?.filterable ?? true,
    width: options?.width,
    align: options?.align ?? 'right',
    className: options?.className,
    cell: ({ row }) => {
      const value = row.original[accessorKey] as number
      if (typeof value !== 'number') return value
      
      return new Intl.NumberFormat(
        options?.locale ?? 'vi-VN',
        {
          style: 'currency',
          currency: options?.currency ?? 'VND',
        }
      ).format(value)
    },
  }
}

/**
 * Creates a status column definition with badge
 */
export function createStatusColumn<T>(
  id: string,
  header: string,
  accessorKey: keyof T,
  statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }>,
  options?: {
    sortable?: boolean
    filterable?: boolean
    width?: string | number
    align?: 'left' | 'center' | 'right'
    className?: string
  }
): ColumnDef<T> {
  return {
    id,
    header,
    accessorKey,
    sortable: options?.sortable ?? true,
    filterable: options?.filterable ?? true,
    width: options?.width,
    align: options?.align ?? 'center',
    className: options?.className,
    cell: ({ row }) => {
      const value = row.original[accessorKey] as string
      const status = statusMap[value]
      
      if (!status) {
        return <span className="text-muted-foreground">{value}</span>
      }
      
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status.variant === 'default' ? 'bg-primary text-primary-foreground' :
          status.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
          status.variant === 'destructive' ? 'bg-destructive text-destructive-foreground' :
          'border border-input bg-background text-foreground'
        }`}>
          {status.label}
        </span>
      )
    },
  }
}

/**
 * Creates an actions column definition
 */
export function createActionsColumn<T>(
  id: string,
  header: string,
  actions: (props: { row: { original: T } }) => React.ReactNode,
  options?: {
    sortable?: boolean
    filterable?: boolean
    width?: string | number
    align?: 'left' | 'center' | 'right'
    className?: string
  }
): ColumnDef<T> {
  return {
    id,
    header,
    accessorKey: undefined,
    sortable: options?.sortable ?? false,
    filterable: options?.filterable ?? false,
    width: options?.width ?? '100px',
    align: options?.align ?? 'center',
    className: options?.className,
    cell: actions,
  }
}

/**
 * Creates a custom column definition
 */
export function createCustomColumn<T>(
  id: string,
  header: string,
  cell: (props: { row: { original: T } }) => React.ReactNode,
  options?: {
    sortable?: boolean
    filterable?: boolean
    width?: string | number
    align?: 'left' | 'center' | 'right'
    className?: string
  }
): ColumnDef<T> {
  return {
    id,
    header,
    accessorKey: undefined,
    sortable: options?.sortable ?? false,
    filterable: options?.filterable ?? false,
    width: options?.width,
    align: options?.align ?? 'left',
    className: options?.className,
    cell,
  }
}

/**
 * Utility to get column by ID
 */
export function getColumnById<T>(columns: ColumnDef<T>[], id: string): ColumnDef<T> | undefined {
  return columns.find(column => column.id === id)
}

/**
 * Utility to check if column is sortable
 */
export function isColumnSortable<T>(columns: ColumnDef<T>[], id: string): boolean {
  const column = getColumnById(columns, id)
  return column?.sortable ?? false
}

/**
 * Utility to check if column is filterable
 */
export function isColumnFilterable<T>(columns: ColumnDef<T>[], id: string): boolean {
  const column = getColumnById(columns, id)
  return column?.filterable ?? false
}

/**
 * Utility to get sortable columns
 */
export function getSortableColumns<T>(columns: ColumnDef<T>[]): ColumnDef<T>[] {
  return columns.filter(column => column.sortable)
}

/**
 * Utility to get filterable columns
 */
export function getFilterableColumns<T>(columns: ColumnDef<T>[]): ColumnDef<T>[] {
  return columns.filter(column => column.filterable)
}

/**
 * Utility to format data for export
 */
export function formatDataForExport<T>(
  data: T[],
  columns: ColumnDef<T>[]
): Record<string, any>[] {
  return data.map(row => {
    const formattedRow: Record<string, any> = {}
    
    columns.forEach(column => {
      if (column.accessorKey) {
        const value = row[column.accessorKey]
        formattedRow[column.id] = value
      }
    })
    
    return formattedRow
  })
}

/**
 * Utility to get column headers for export
 */
export function getColumnHeadersForExport<T>(columns: ColumnDef<T>[]): string[] {
  return columns
    .filter(column => column.accessorKey) // Only include columns with data
    .map(column => {
      if (typeof column.header === 'string') {
        return column.header
      }
      return column.id
    })
}

/**
 * Utility to create search filter function
 */
export function createSearchFilter<T>(
  searchValue: string,
  searchableColumns: (keyof T)[]
): (item: T) => boolean {
  if (!searchValue.trim()) return () => true
  
  const searchLower = searchValue.toLowerCase()
  
  return (item: T) => {
    return searchableColumns.some(column => {
      const value = item[column]
      if (value == null) return false
      
      return String(value).toLowerCase().includes(searchLower)
    })
  }
}

/**
 * Utility to create sort function
 */
export function createSortFunction<T>(
  sortBy: keyof T,
  sortOrder: 'asc' | 'desc'
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortOrder === 'asc' ? -1 : 1
    if (bValue == null) return sortOrder === 'asc' ? 1 : -1
    
    // Handle different data types
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime()
    }
    
    // String comparison
    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    
    if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1
    if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1
    return 0
  }
}
