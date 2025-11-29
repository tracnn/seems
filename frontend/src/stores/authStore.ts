import Cookies from 'js-cookie'
import { create } from 'zustand'
import { authService } from '@/api/services'
import type { User, LoginRequest, LoginResponse } from '@/api/types'

const ACCESS_TOKEN = 'access_token'
const REFRESH_TOKEN = 'refresh_token'
const USER_DATA = 'user_data'

interface AuthState {
  auth: {
    user: User | null
    accessToken: string
    refreshToken: string
    isLoading: boolean
    isAuthenticated: boolean
    
    // Actions
    setUser: (user: User | null) => void
    setTokens: (accessToken: string, refreshToken: string) => void
    setAccessToken: (accessToken: string) => void
    setRefreshToken: (refreshToken: string) => void
    setLoading: (loading: boolean) => void
    
    // Auth operations
    login: (credentials: LoginRequest) => Promise<LoginResponse>
    logout: () => Promise<void>
    refreshAccessToken: () => Promise<void>
    getCurrentUser: () => Promise<void>
    
    // Token management
    resetTokens: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  // Initialize from cookies
  const initAccessToken = Cookies.get(ACCESS_TOKEN) || ''
  const initRefreshToken = Cookies.get(REFRESH_TOKEN) || ''
  const initUser = Cookies.get(USER_DATA) ? JSON.parse(Cookies.get(USER_DATA)!) : null
  
  return {
    auth: {
      user: initUser,
      accessToken: initAccessToken,
      refreshToken: initRefreshToken,
      isLoading: false,
      isAuthenticated: !!initAccessToken && !!initUser,
      
      // Basic setters
      setUser: (user) =>
        set((state) => {
          if (user) {
            Cookies.set(USER_DATA, JSON.stringify(user), { expires: 7 })
          } else {
            Cookies.remove(USER_DATA)
          }
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              user,
              isAuthenticated: !!user && !!state.auth.accessToken
            } 
          }
        }),
        
      setAccessToken: (accessToken) =>
        set((state) => {
          Cookies.set(ACCESS_TOKEN, accessToken, { expires: 1 }) // 1 day
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken,
              isAuthenticated: !!accessToken && !!state.auth.user
            } 
          }
        }),
        
      setRefreshToken: (refreshToken) =>
        set((state) => {
          Cookies.set(REFRESH_TOKEN, refreshToken, { expires: 7 }) // 7 days
          return { ...state, auth: { ...state.auth, refreshToken } }
        }),
        
      setTokens: (accessToken, refreshToken) =>
        set((state) => {
          Cookies.set(ACCESS_TOKEN, accessToken, { expires: 1 })
          Cookies.set(REFRESH_TOKEN, refreshToken, { expires: 7 })
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken,
              refreshToken,
              isAuthenticated: !!accessToken && !!state.auth.user
            } 
          }
        }),
        
      setLoading: (isLoading) =>
        set((state) => ({ ...state, auth: { ...state.auth, isLoading } })),
      
      // Auth operations
      login: async (credentials) => {
        set((state) => ({ ...state, auth: { ...state.auth, isLoading: true } }))
        
        try {
          const response = await authService.login(credentials)
          
          // Map response user to User type
          const user: User = {
            id: response.user.id,
            accountNo: response.user.username,
            email: response.user.email,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            fullName: response.user.firstName && response.user.lastName 
              ? `${response.user.firstName} ${response.user.lastName}` 
              : response.user.firstName || response.user.username,
            role: [], // Will be populated from getCurrentUser if needed
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          set((state) => ({
            ...state,
            auth: {
              ...state.auth,
              user,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            }
          }))
          
          // Save to cookies
          Cookies.set(ACCESS_TOKEN, response.accessToken, { expires: 1 })
          Cookies.set(REFRESH_TOKEN, response.refreshToken, { expires: 7 })
          Cookies.set(USER_DATA, JSON.stringify(user), { expires: 7 })
          
          return {
            ...response,
            user,
            expiresIn: response.expiresIn,
          }
        } catch (error) {
          set((state) => ({ ...state, auth: { ...state.auth, isLoading: false } }))
          throw error
        }
      },
      
      logout: async () => {
        set((state) => ({ ...state, auth: { ...state.auth, isLoading: true } }))
        
        try {
          await authService.logout()
        } catch (error) {
          // Continue with logout even if API call fails
        } finally {
          // Clear state and cookies
          set((state) => ({
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              refreshToken: '',
              isAuthenticated: false,
              isLoading: false,
            }
          }))
          
          Cookies.remove(ACCESS_TOKEN)
          Cookies.remove(REFRESH_TOKEN)
          Cookies.remove(USER_DATA)
        }
      },
      
      refreshAccessToken: async () => {
        const { refreshToken } = get().auth
        
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }
        
        try {
          const response = await authService.refreshToken(refreshToken)
          
          set((state) => ({
            ...state,
            auth: {
              ...state.auth,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            }
          }))
          
          // Update cookies
          Cookies.set(ACCESS_TOKEN, response.accessToken, { expires: 1 })
          Cookies.set(REFRESH_TOKEN, response.refreshToken, { expires: 7 })
          
        } catch (error) {
          // If refresh fails, logout user
          get().auth.logout()
          throw error
        }
      },
      
      getCurrentUser: async () => {
        set((state) => ({ ...state, auth: { ...state.auth, isLoading: true } }))
        
        try {
          const user = await authService.getCurrentUser()
          
          set((state) => ({
            ...state,
            auth: {
              ...state.auth,
              user,
              isAuthenticated: true,
              isLoading: false,
            }
          }))
          
          // Update user data in cookies
          Cookies.set(USER_DATA, JSON.stringify(user), { expires: 7 })
          
        } catch (error) {
          set((state) => ({ ...state, auth: { ...state.auth, isLoading: false } }))
          throw error
        }
      },
      
      // Token management
      resetTokens: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          Cookies.remove(REFRESH_TOKEN)
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken: '', 
              refreshToken: '',
              isAuthenticated: false
            } 
          }
        }),
        
      reset: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          Cookies.remove(REFRESH_TOKEN)
          Cookies.remove(USER_DATA)
          return {
            ...state,
            auth: { 
              ...state.auth,
              user: null, 
              accessToken: '', 
              refreshToken: '',
              isLoading: false,
              isAuthenticated: false
            },
          }
        }),
    },
  }
})

// export const useAuth = () => useAuthStore((state) => state.auth)
