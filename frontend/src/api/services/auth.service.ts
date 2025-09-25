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
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    )
    return response.data.data
  },

  /**
   * Đăng xuất người dùng
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  /**
   * Làm mới access token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
      '/auth/refresh',
      { refreshToken }
    )
    return response.data.data
  },

  /**
   * Quên mật khẩu
   */
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email })
  },

  /**
   * Đặt lại mật khẩu
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', {
      token,
      password: newPassword,
    })
  },

  /**
   * Xác thực OTP
   */
  verifyOtp: async (email: string, otp: string): Promise<void> => {
    await apiClient.post('/auth/verify-otp', { email, otp })
  },

  /**
   * Gửi lại OTP
   */
  resendOtp: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-otp', { email })
  },

  /**
   * Lấy thông tin người dùng hiện tại
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data.data
  },

  /**
   * Đăng nhập với Google
   */
  loginWithGoogle: async (googleToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/google',
      { token: googleToken }
    )
    return response.data.data
  },

  /**
   * Đăng nhập với Facebook
   */
  loginWithFacebook: async (facebookToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/facebook',
      { token: facebookToken }
    )
    return response.data.data
  },

  /**
   * Đăng nhập với GitHub
   */
  loginWithGitHub: async (githubToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/github',
      { token: githubToken }
    )
    return response.data.data
  },
}
