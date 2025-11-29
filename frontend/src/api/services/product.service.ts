import { apiClient } from '../index'
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  QueryParams,
  ApiResponse,
  PaginatedResponse,
} from '../types'

export const productService = {
  /**
   * Lấy danh sách sản phẩm với phân trang và tìm kiếm
   */
  getProducts: async (params?: QueryParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
      params,
    })
    return response.data
  },

  /**
   * Lấy thông tin sản phẩm theo ID
   */
  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data.data
  },

  /**
   * Tạo sản phẩm mới
   */
  createProduct: async (productData: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', productData)
    return response.data.data
  },

  /**
   * Cập nhật sản phẩm
   */
  updateProduct: async (id: string, productData: UpdateProductRequest): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(
      `/products/${id}`,
      productData
    )
    return response.data.data
  },

  /**
   * Xóa sản phẩm (soft delete)
   */
  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },

  /**
   * Khôi phục sản phẩm đã xóa
   */
  restoreProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>(
      `/products/${id}/restore`
    )
    return response.data.data
  },

  /**
   * Cập nhật hình ảnh sản phẩm
   */
  updateProductImage: async (id: string, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiClient.post<ApiResponse<{ imageUrl: string }>>(
      `/products/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data
  },

  /**
   * Xóa hình ảnh sản phẩm
   */
  deleteProductImage: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}/image`)
  },

  /**
   * Lấy sản phẩm theo danh mục
   */
  getProductsByCategory: async (
    category: string,
    params?: QueryParams
  ): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      `/products/category/${category}`,
      { params }
    )
    return response.data
  },

  /**
   * Tìm kiếm sản phẩm
   */
  searchProducts: async (query: string, params?: QueryParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      '/products/search',
      {
        params: {
          ...params,
          q: query,
        },
      }
    )
    return response.data
  },

  /**
   * Lấy sản phẩm nổi bật
   */
  getFeaturedProducts: async (limit: number = 10): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/products/featured?limit=${limit}`
    )
    return response.data.data
  },

  /**
   * Lấy sản phẩm mới nhất
   */
  getLatestProducts: async (limit: number = 10): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `/products/latest?limit=${limit}`
    )
    return response.data.data
  },

  /**
   * Cập nhật trạng thái sản phẩm
   */
  toggleProductStatus: async (id: string): Promise<Product> => {
    const response = await apiClient.patch<ApiResponse<Product>>(
      `/products/${id}/toggle-status`
    )
    return response.data.data
  },

  /**
   * Cập nhật số lượng tồn kho
   */
  updateStock: async (id: string, quantity: number): Promise<Product> => {
    const response = await apiClient.patch<ApiResponse<Product>>(
      `/products/${id}/stock`,
      { quantity }
    )
    return response.data.data
  },

  /**
   * Lấy thống kê sản phẩm
   */
  getProductStats: async (): Promise<{
    total: number
    active: number
    inactive: number
    lowStock: number
    outOfStock: number
    totalValue: number
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/products/stats')
    return response.data.data
  },

  /**
   * Xuất danh sách sản phẩm
   */
  exportProducts: async (params?: QueryParams): Promise<Blob> => {
    const response = await apiClient.get('/products/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Import sản phẩm từ file
   */
  importProducts: async (file: File): Promise<{
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
    }>>('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  /**
   * Lấy danh sách danh mục
   */
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/products/categories')
    return response.data.data
  },
}
