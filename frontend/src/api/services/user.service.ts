import { apiClient } from '../index'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  QueryParams,
  ApiResponse,
  PaginatedResponse,
  IamUser,
  IamUsersResponse,
  IamUserDetail,
  UpdateIamUserRequest,
} from '../types'
import type { FetchParams, FetchResult } from '@/components/ui/server-select'

export const userService = {
  /**
   * Lấy danh sách người dùng với phân trang và tìm kiếm
   */
  getUsers: async (params?: QueryParams): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', {
      params,
    })
    return response.data
  },

  /**
   * Lấy thông tin người dùng theo ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
    return response.data.data
  },

  /**
   * Tạo người dùng mới
   */
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', userData)
    return response.data.data
  },

  /**
   * Cập nhật thông tin người dùng
   */
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `/users/${id}`,
      userData
    )
    return response.data.data
  },

  /**
   * Xóa người dùng (soft delete)
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },

  /**
   * Khôi phục người dùng đã xóa
   */
  restoreUser: async (id: string): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      `/users/${id}/restore`
    )
    return response.data.data
  },

  /**
   * Thay đổi mật khẩu
   */
  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/users/change-password', passwordData)
  },

  /**
   * Cập nhật avatar
   */
  updateAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
      '/users/avatar',
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
   * Xóa avatar
   */
  deleteAvatar: async (): Promise<void> => {
    await apiClient.delete('/users/avatar')
  },

  /**
   * Lấy thông tin profile của người dùng hiện tại
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/profile')
    return response.data.data
  },

  /**
   * Cập nhật profile của người dùng hiện tại
   */
  updateProfile: async (profileData: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      '/users/profile',
      profileData
    )
    return response.data.data
  },

  /**
   * Kích hoạt/tắt tài khoản
   */
  toggleUserStatus: async (id: string): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(
      `/users/${id}/toggle-status`
    )
    return response.data.data
  },

  /**
   * Gửi email xác thực
   */
  sendVerificationEmail: async (): Promise<void> => {
    await apiClient.post('/users/send-verification-email')
  },

  /**
   * Xác thực email
   */
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/users/verify-email', { token })
  },

  /**
   * Lấy danh sách người dùng từ IAM API với phân trang
   * Sử dụng endpoint /api/v1/iam/users
   */
  getIamUsers: async (params?: { page?: number; limit?: number }): Promise<IamUsersResponse> => {
    const response = await apiClient.get<IamUsersResponse>('/api/v1/iam/users', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
      },
    })
    return response.data
  },

  /**
   * Fetcher function cho ServerSelect component
   * Chuyển đổi từ FetchParams sang format API và trả về FetchResult
   */
  fetchIamUsersForSelect: async (params: FetchParams): Promise<FetchResult> => {
    const response = await apiClient.get<IamUsersResponse>('/api/v1/iam/users', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
      },
    })

    // Chuyển đổi pagination format từ API sang format của ServerSelect
    return {
      data: response.data.data,
      pagination: {
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        pageCount: response.data.pagination.totalPages,
        hasNext: response.data.pagination.hasNext,
        hasPrev: response.data.pagination.hasPrev,
      },
    }
  },

  /**
   * Lấy thông tin chi tiết người dùng từ IAM API theo ID
   * Sử dụng endpoint /api/v1/iam/users/{id}
   */
  getIamUserById: async (id: string): Promise<IamUserDetail> => {
    const response = await apiClient.get<IamUserDetail>(
      `/api/v1/iam/users/${id}`
    )
    return response.data
  },

  /**
   * Cập nhật thông tin người dùng từ IAM API
   * Sử dụng endpoint /api/v1/iam/users/{id}
   */
  updateIamUser: async (
    id: string,
    userData: UpdateIamUserRequest
  ): Promise<IamUserDetail> => {
    const response = await apiClient.put<IamUserDetail>(
      `/api/v1/iam/users/${id}`,
      userData
    )
    return response.data
  },
}
