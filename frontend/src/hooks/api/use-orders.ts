import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderService } from '@/api/services'
import type { 
  UpdateOrderRequest,
  QueryParams
} from '@/api/types'

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  recent: (limit: number) => [...orderKeys.all, 'recent', limit] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
  byCustomer: (email: string, params: QueryParams) => 
    [...orderKeys.all, 'customer', email, params] as const,
}

/**
 * Hook để lấy danh sách đơn hàng với phân trang
 */
export function useOrders(params?: QueryParams) {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: () => orderService.getOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook để lấy thông tin đơn hàng theo ID
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook để lấy đơn hàng gần đây
 */
export function useRecentOrders(limit: number = 10) {
  return useQuery({
    queryKey: orderKeys.recent(limit),
    queryFn: () => orderService.getRecentOrders(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Hook để lấy thống kê đơn hàng
 */
export function useOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: orderService.getOrderStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook để lấy đơn hàng theo khách hàng
 */
export function useOrdersByCustomer(customerEmail: string, params?: QueryParams) {
  return useQuery({
    queryKey: orderKeys.byCustomer(customerEmail, params || {}),
    queryFn: () => orderService.getOrdersByCustomer(customerEmail, params),
    enabled: !!customerEmail,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook để tạo đơn hàng mới
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: (newOrder) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      
      // Add new order to cache
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder)
      
      // Invalidate recent orders
      queryClient.invalidateQueries({ queryKey: orderKeys.recent(10) })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() })
    },
  })
}

/**
 * Hook để cập nhật đơn hàng
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderRequest }) =>
      orderService.updateOrder(id, data),
    onSuccess: (updatedOrder, { id }) => {
      // Update order in cache
      queryClient.setQueryData(orderKeys.detail(id), updatedOrder)
      
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      
      // Invalidate recent orders
      queryClient.invalidateQueries({ queryKey: orderKeys.recent(10) })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() })
    },
  })
}

/**
 * Hook để xóa đơn hàng
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: orderService.deleteOrder,
    onSuccess: (_, orderId) => {
      // Remove order from cache
      queryClient.removeQueries({ queryKey: orderKeys.detail(orderId) })
      
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      
      // Invalidate recent orders
      queryClient.invalidateQueries({ queryKey: orderKeys.recent(10) })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() })
    },
  })
}

/**
 * Hook để cập nhật trạng thái đơn hàng
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      // Update order in cache
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder)
      
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      
      // Invalidate recent orders
      queryClient.invalidateQueries({ queryKey: orderKeys.recent(10) })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() })
    },
  })
}

/**
 * Hook để hủy đơn hàng
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      orderService.cancelOrder(id, reason),
    onSuccess: (cancelledOrder) => {
      // Update order in cache
      queryClient.setQueryData(orderKeys.detail(cancelledOrder.id), cancelledOrder)
      
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      
      // Invalidate recent orders
      queryClient.invalidateQueries({ queryKey: orderKeys.recent(10) })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() })
    },
  })
}

/**
 * Hook để gửi email xác nhận đơn hàng
 */
export function useSendOrderConfirmation() {
  return useMutation({
    mutationFn: orderService.sendOrderConfirmation,
  })
}

/**
 * Hook để xuất danh sách đơn hàng
 */
export function useExportOrders() {
  return useMutation({
    mutationFn: orderService.exportOrders,
  })
}

/**
 * Hook để import đơn hàng từ file
 */
export function useImportOrders() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: orderService.importOrders,
    onSuccess: () => {
      // Invalidate orders list after import
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() })
    },
  })
}
