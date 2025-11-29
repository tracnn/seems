import { apiClient } from '../index'
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  ApiResponse,
} from '../types'

export const authService = {
  /**
   * Đăng nhập người dùng
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
      '/api/v1/auth/login',
      credentials
    )
    
    // API trả về trực tiếp object LoginResponse
    return response.data
  },

  /**
   * Đăng xuất người dùng
   */
  logout: async (): Promise<void> => {
    await apiClient.post('api/v1/auth/logout')
  },

  /**
   * Làm mới access token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
      '/api/v1/auth/refresh-token',
      { refreshToken }
    )
    // API trả về format ApiResponse, cần lấy data.data
    return response.data.data
  },

  /**
   * Quên mật khẩu
   */
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/forgot-password', { email })
  },

  /**
   * Đặt lại mật khẩu
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/reset-password', {
      token,
      password: newPassword,
    })
  },

  /**
   * Xác thực OTP
   */
  verifyOtp: async (email: string, otp: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/verify-otp', { email, otp })
  },

  /**
   * Gửi lại OTP
   */
  resendOtp: async (email: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/resend-otp', { email })
  },

  /**
   * Lấy thông tin người dùng hiện tại
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/v1/auth/me')
    return response.data.data
  },

  /**
   * Đăng nhập với Google
   */
  loginWithGoogle: async (googleToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/v1/auth/google',
      { token: googleToken }
    )
    // API trả về format ApiResponse, cần lấy data.data
    return response.data.data
  },

  /**
   * Đăng nhập với Facebook
   */
  loginWithFacebook: async (facebookToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/v1/auth/facebook',
      { token: facebookToken }
    )
    // API trả về format ApiResponse, cần lấy data.data
    return response.data.data
  },

  /**
   * Đăng nhập với GitHub
   */
  loginWithGitHub: async (githubToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/v1/auth/github',
      { token: githubToken }
    )
    // API trả về format ApiResponse, cần lấy data.data
    return response.data.data
  },
}
