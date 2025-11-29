import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
const API_TIMEOUT = 10000 // 10 seconds

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().auth.accessToken
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      })
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }
    
    return response
  },
  (error) => {
    const { response } = error
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: response?.status,
        data: response?.data,
        message: error.message,
      })
    }
    
    // Handle specific error cases
    if (response) {
      switch (response.status) {
        case 401:
          toast.error('Phiên đăng nhập đã hết hạn')
          useAuthStore.getState().auth.reset()
          // Redirect to login will be handled by the app
          break
        case 403:
          toast.error('Bạn không có quyền truy cập')
          break
        case 404:
          toast.error('Không tìm thấy dữ liệu')
          break
        case 422:
          // Validation errors - handled by forms
          break
        case 429:
          toast.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
          break
        case 500:
          toast.error('Lỗi máy chủ. Vui lòng thử lại sau')
          break
        default:
          toast.error(response.data?.message || 'Đã xảy ra lỗi không xác định')
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Yêu cầu quá thời gian. Vui lòng thử lại')
    } else if (error.message === 'Network Error') {
      toast.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối')
    }
    
    return Promise.reject(error)
  }
)

// Export types
export type ApiResponse<T = any> = {
  data: T
  message?: string
  status: number
}

export type PaginatedResponse<T = any> = {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  message?: string
  status: number
}

export type ApiError = {
  message: string
  status: number
  errors?: Record<string, string[]>
}

// Export API client as default
export default apiClient
