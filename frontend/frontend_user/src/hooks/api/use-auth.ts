import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/api/services'
import type { LoginRequest, LoginResponse } from '@/api/types'

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
}

/**
 * Hook để lấy thông tin người dùng hiện tại
 */
export function useCurrentUser() {
  const { user, isAuthenticated } = useAuthStore()
  
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated && !user, // Chỉ fetch khi đã đăng nhập nhưng chưa có user data
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}

/**
 * Hook để đăng nhập
 */
export function useLogin() {
  const queryClient = useQueryClient()
  const { login } = useAuthStore()
  
  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<LoginResponse> => {
      return await login(credentials)
    },
    onSuccess: (data) => {
      // Invalidate và refetch current user
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
      
      // Set user data in query cache
      queryClient.setQueryData(authKeys.currentUser(), data.user)
    },
    onError: (error) => {
      console.error('Login failed:', error)
    },
  })
}

/**
 * Hook để đăng xuất
 */
export function useLogout() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()
  
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Logout failed:', error)
    },
  })
}

/**
 * Hook để làm mới token
 */
export function useRefreshToken() {
  const { refreshAccessToken } = useAuthStore()
  
  return useMutation({
    mutationFn: refreshAccessToken,
    onError: (error) => {
      console.error('Token refresh failed:', error)
    },
  })
}

/**
 * Hook để quên mật khẩu
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      // Có thể thêm toast notification ở đây
    },
  })
}

/**
 * Hook để đặt lại mật khẩu
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
    onSuccess: () => {
      // Có thể thêm toast notification ở đây
    },
  })
}

/**
 * Hook để xác thực OTP
 */
export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyOtp(email, otp),
  })
}

/**
 * Hook để gửi lại OTP
 */
export function useResendOtp() {
  return useMutation({
    mutationFn: authService.resendOtp,
  })
}

/**
 * Hook để đăng nhập với Google
 */
export function useGoogleLogin() {
  const queryClient = useQueryClient()
  const { setTokens, setUser } = useAuthStore()
  
  return useMutation({
    mutationFn: authService.loginWithGoogle,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      queryClient.setQueryData(authKeys.currentUser(), data.user)
    },
  })
}

/**
 * Hook để đăng nhập với Facebook
 */
export function useFacebookLogin() {
  const queryClient = useQueryClient()
  const { setTokens, setUser } = useAuthStore()
  
  return useMutation({
    mutationFn: authService.loginWithFacebook,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      queryClient.setQueryData(authKeys.currentUser(), data.user)
    },
  })
}

/**
 * Hook để đăng nhập với GitHub
 */
export function useGitHubLogin() {
  const queryClient = useQueryClient()
  const { setTokens, setUser } = useAuthStore()
  
  return useMutation({
    mutationFn: authService.loginWithGitHub,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken)
      setUser(data.user)
      queryClient.setQueryData(authKeys.currentUser(), data.user)
    },
  })
}
