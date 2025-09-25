import { apiClient } from '../index'
import type {
  Order,
  CreateOrderRequest,
  UpdateOrderRequest,
  QueryParams,
  ApiResponse,
  PaginatedResponse,
} from '../types'

export const orderService = {
  /**
   * Lấy danh sách đơn hàng với phân trang và tìm kiếm
   */
  getOrders: async (params?: QueryParams): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>('/orders', {
      params,
    })
    return response.data
  },

  /**
   * Lấy thông tin đơn hàng theo ID
   */
  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data.data
  },

  /**
   * Tạo đơn hàng mới
   */
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', orderData)
    return response.data.data
  },

  /**
   * Cập nhật đơn hàng
   */
  updateOrder: async (id: string, orderData: UpdateOrderRequest): Promise<Order> => {
    const response = await apiClient.put<ApiResponse<Order>>(
      `/orders/${id}`,
      orderData
    )
    return response.data.data
  },

  /**
   * Xóa đơn hàng
   */
  deleteOrder: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`)
  },

  /**
   * Lấy đơn hàng gần đây
   */
  getRecentOrders: async (limit: number = 10): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>(
      `/orders/recent?limit=${limit}`
    )
    return response.data.data
  },

  /**
   * Lấy thống kê đơn hàng
   */
  getOrderStats: async (): Promise<{
    total: number
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
    totalRevenue: number
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/orders/stats')
    return response.data.data
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  updateOrderStatus: async (
    id: string,
    status: string
  ): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${id}/status`,
      { status }
    )
    return response.data.data
  },

  /**
   * Xuất danh sách đơn hàng
   */
  exportOrders: async (params?: QueryParams): Promise<Blob> => {
    const response = await apiClient.get('/orders/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Import đơn hàng từ file
   */
  importOrders: async (file: File): Promise<{
    success: number
    failed: number
    errors: string[]
  }> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<{
      success: number
      failed: number
      errors: string[]
    }>>('/orders/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  /**
   * Lấy đơn hàng theo khách hàng
   */
  getOrdersByCustomer: async (
    customerEmail: string,
    params?: QueryParams
  ): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<PaginatedResponse<Order>>(
      `/orders/customer/${customerEmail}`,
      { params }
    )
    return response.data
  },

  /**
   * Gửi email xác nhận đơn hàng
   */
  sendOrderConfirmation: async (id: string): Promise<void> => {
    await apiClient.post(`/orders/${id}/send-confirmation`)
  },

  /**
   * Hủy đơn hàng
   */
  cancelOrder: async (id: string, reason?: string): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${id}/cancel`,
      { reason }
    )
    return response.data.data
  },
}
