import { defineStore } from 'pinia'
import { userService } from '@/api/user.service'
import type { User } from '@/models/user.model'
import { ApiResponse } from '@/types/api-response'
import { UserParams, CreateUserData, UpdateUserData } from '@/models/user.model'

interface UserState {
  users: User[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    pageCount: number
  }
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,
    },
  }),

  getters: {
    getUsers: (state): User[] => state.users,
    getLoading: (state): boolean => state.loading,
    getError: (state): string | null => state.error,
    getPagination: (state) => state.pagination,
  },

  actions: {
    async fetchUsers(params: UserParams = {}): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const response: ApiResponse<User> = await userService.getUsers(params)
        this.users = response.data
        this.pagination = {
          total: response.pagination.total,
          page: response.pagination.page,
          limit: response.pagination.limit,
          pageCount: response.pagination.pageCount,
        }
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách user'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createUser(data: CreateUserData): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await userService.createUser(data)
        await this.refreshUserList()
      } catch (err: any) {
        this.error = err.message || 'Lỗi tạo user'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateUser(id: string, data: UpdateUserData): Promise<{ data: User }> {
      this.loading = true
      this.error = null
      try {
        const response = await userService.updateUser(id, data);
        await this.refreshUserList();
        return response;
      } catch (err: any) {
        this.error = err.message || 'Lỗi cập nhật user'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteUser(id: string): Promise<any> {
      this.loading = true
      this.error = null
      try {
        const response = await userService.deleteUser(id)
        await this.refreshUserList()
        return response
      } catch (err: any) {
        this.error = err.message || 'Lỗi xoá user'
        throw err
      } finally {
        this.loading = false
      }
    },

    async lockUser(id: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await userService.lockUser(id)
        await this.refreshUserList()
      } catch (err: any) {
        this.error = err.message || 'Lỗi khoá user'
        throw err
      } finally {
        this.loading = false
      }
    },

    async unlockUser(id: string): Promise<void> {
      this.loading = true
      this.error = null
      try {
        await userService.unlockUser(id)
        await this.refreshUserList()
      } catch (err: any) {
        this.error = err.message || 'Lỗi mở khoá user'
        throw err
      } finally {
        this.loading = false
      }
    },

    clearError(): void {
      this.error = null
    },

    setPagination(pagination: Partial<UserState['pagination']>): void {
      this.pagination = { ...this.pagination, ...pagination }
    },

    async refreshUserList(): Promise<void> {
      await this.fetchUsers({
        page: this.pagination.page,
        limit: this.pagination.limit,
      })
    },
  },
})