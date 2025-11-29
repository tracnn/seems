import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/api/services'
import type { 
  User, 
  UpdateUserRequest, 
  QueryParams
} from '@/api/types'

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
}

/**
 * Hook để lấy danh sách người dùng với phân trang
 */
export function useUsers(params?: QueryParams) {
  return useQuery({
    queryKey: userKeys.list(params || {}),
    queryFn: () => userService.getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook để lấy thông tin người dùng theo ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook để lấy thông tin profile của người dùng hiện tại
 */
export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: userService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook để tạo người dùng mới
 */
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: (newUser) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      
      // Add new user to cache
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser)
    },
  })
}

/**
 * Hook để cập nhật người dùng
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userService.updateUser(id, data),
    onSuccess: (updatedUser, { id }) => {
      // Update user in cache
      queryClient.setQueryData(userKeys.detail(id), updatedUser)
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      
      // Update profile if it's the current user
      queryClient.setQueryData(userKeys.profile(), updatedUser)
    },
  })
}

/**
 * Hook để cập nhật profile của người dùng hiện tại
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (updatedUser) => {
      // Update profile in cache
      queryClient.setQueryData(userKeys.profile(), updatedUser)
      
      // Update user detail if exists
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser)
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook để xóa người dùng
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: (_, userId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) })
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook để khôi phục người dùng đã xóa
 */
export function useRestoreUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.restoreUser,
    onSuccess: (restoredUser) => {
      // Add restored user to cache
      queryClient.setQueryData(userKeys.detail(restoredUser.id), restoredUser)
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook để thay đổi mật khẩu
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: userService.changePassword,
  })
}

/**
 * Hook để cập nhật avatar
 */
export function useUpdateAvatar() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.updateAvatar,
    onSuccess: (result) => {
      // Update profile with new avatar URL
      queryClient.setQueryData(userKeys.profile(), (oldData: User | undefined) => {
        if (oldData) {
          return { ...oldData, avatar: result.avatarUrl }
        }
        return oldData
      })
    },
  })
}

/**
 * Hook để xóa avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.deleteAvatar,
    onSuccess: () => {
      // Update profile to remove avatar
      queryClient.setQueryData(userKeys.profile(), (oldData: User | undefined) => {
        if (oldData) {
          return { ...oldData, avatar: undefined }
        }
        return oldData
      })
    },
  })
}

/**
 * Hook để kích hoạt/tắt tài khoản
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userService.toggleUserStatus,
    onSuccess: (updatedUser) => {
      // Update user in cache
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser)
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Hook để gửi email xác thực
 */
export function useSendVerificationEmail() {
  return useMutation({
    mutationFn: userService.sendVerificationEmail,
  })
}

/**
 * Hook để xác thực email
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: ({ token }: { token: string }) => userService.verifyEmail(token),
  })
}
