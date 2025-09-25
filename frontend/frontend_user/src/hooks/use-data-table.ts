import React, { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
export interface DataTableState {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  searchValue: string
  filters: Record<string, any>
}

export interface DataTableConfig<T> {
  queryKey: string[]
  queryFn: (params: DataTableParams) => Promise<{
    data: T[]
    total: number
    page: number
    pageSize: number
  } | {
    data: T[]
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
  }>
  initialPageSize?: number
  initialSortBy?: string
  initialSortOrder?: 'asc' | 'desc'
  staleTime?: number
  refetchOnWindowFocus?: boolean
}

export interface DataTableParams {
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  searchValue: string
  filters: Record<string, any>
}

export interface UseDataTableReturn<T> {
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
  paginationInfo: {
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    startIndex: number
    endIndex: number
  }
}

// Main hook
export function useDataTable<T>(config: DataTableConfig<T>): UseDataTableReturn<T> {
  const {
    queryKey,
    queryFn,
    initialPageSize = 10,
    initialSortBy = '',
    initialSortOrder = 'asc',
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = false,
  } = config

  // State management
  const [state, setState] = useState<DataTableState>({
    page: 1,
    pageSize: initialPageSize,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
    searchValue: '',
    filters: {},
  })

  // Query parameters
  const queryParams = useMemo((): DataTableParams => ({
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    searchValue: state.searchValue,
    filters: state.filters,
  }), [state])

  // TanStack Query
  const {
    data: rawQueryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => queryFn(queryParams),
    staleTime,
    refetchOnWindowFocus,
    retry: (failureCount) => {
      if (failureCount >= 3) {
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại.')
        return false
      }
      return true
    },
  })

  // Normalize response data to handle both old and new API structures
  const queryData = useMemo(() => {
    if (!rawQueryData) return null
    
    // Check if response has pagination object (new API structure)
    if ('pagination' in rawQueryData) {
      return {
        data: rawQueryData.data,
        total: rawQueryData.pagination.total,
        page: rawQueryData.pagination.page,
        pageSize: rawQueryData.pagination.pageSize,
      }
    }
    
    // Return as-is for old API structure
    return rawQueryData
  }, [rawQueryData])

  // Actions
  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({ ...prev, pageSize, page: 1 })) // Reset to first page
  }, [])

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortBy, sortOrder, page: 1 })) // Reset to first page
  }, [])

  const setSearch = useCallback((searchValue: string) => {
    setState(prev => ({ ...prev, searchValue, page: 1 })) // Reset to first page
  }, [])

  const setFilters = useCallback((filters: Record<string, any>) => {
    setState(prev => ({ ...prev, filters, page: 1 })) // Reset to first page
  }, [])

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchValue: '',
      filters: {},
      page: 1,
    }))
  }, [])

  // Computed values
  const paginationInfo = useMemo(() => {
    const total = queryData?.total || 0
    const totalPages = Math.ceil(total / state.pageSize)
    const startIndex = (state.page - 1) * state.pageSize + 1
    const endIndex = Math.min(state.page * state.pageSize, total)

    return {
      totalPages,
      hasNextPage: state.page < totalPages,
      hasPreviousPage: state.page > 1,
      startIndex,
      endIndex,
    }
  }, [queryData?.total, state.page, state.pageSize])

  return {
    // Data
    data: queryData?.data || [],
    total: queryData?.total || 0,
    isLoading,
    error: error?.message || null,
    
    // State
    state,
    
    // Actions
    setPage,
    setPageSize,
    setSorting,
    setSearch,
    setFilters,
    resetFilters,
    
    // Computed
    paginationInfo,
  }
}

// Utility hook for debounced search
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Utility hook for data table with debounced search
export function useDataTableWithDebounce<T>(
  config: DataTableConfig<T>,
  searchDelay: number = 300
): UseDataTableReturn<T> {
  const dataTable = useDataTable(config)
  const debouncedSearchValue = useDebouncedValue(dataTable.state.searchValue, searchDelay)

  // Override search value with debounced version
  const debouncedState = useMemo(() => ({
    ...dataTable.state,
    searchValue: debouncedSearchValue,
  }), [dataTable.state, debouncedSearchValue])

  return {
    ...dataTable,
    state: debouncedState,
  }
}
