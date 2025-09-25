import { defineStore } from 'pinia';
import { authService } from '@/api';
import type { User } from '@/models/user.model';

interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshAttempts: number;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isRefreshing: false,
    refreshAttempts: 0,
  }),

  getters: {
    getUser: (state): User | null => state.user,
    getIsAuthenticated: (state): boolean => state.isAuthenticated,
    getIsLoading: (state): boolean => state.isLoading,
    getIsRefreshing: (state): boolean => state.isRefreshing,
  },

  actions: {
    setAuthToken(token: AuthToken): void {
      if (!token?.accessToken || !token?.refreshToken) return;
      if (token) {
        localStorage.setItem('accessToken', token.accessToken);
        localStorage.setItem('refreshToken', token.refreshToken);
      }
    },

    setUser(user: User | null): void {
      this.user = user;
      this.isAuthenticated = !!user;
    },

    setLoading(loading: boolean): void {
      this.isLoading = loading;
    },

    setRefreshing(refreshing: boolean): void {
      this.isRefreshing = refreshing;
    },

    async checkAuth(): Promise<boolean> {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        this.logout();
        return false;
      }

      try {
        this.setLoading(true);
        const user = await authService.getCurrentUser();
        this.setUser(user);
        return true;
      } catch (error) {
        console.error('Auth check failed:', error);
        this.logout();
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    async login(credentials: LoginCredentials): Promise<any> {
      try {
        this.setLoading(true);
        const response = await authService.login(credentials);
        
        // Extract tokens from response
        let tokens: any;
        let user: any;
        
        if (response.data.data) {
          // Format: response.data.data
          tokens = response.data.data;
          user = response.data.data.user;
        } else if ((response.data as any).accessToken) {
          // Format: response.data trực tiếp
          tokens = response.data;
          user = (response.data as any).user;
        } else {
          throw new Error('Invalid response structure');
        }
        
        const { accessToken, refreshToken } = tokens;
        
        if (!accessToken || !refreshToken) {
          throw new Error('Missing access token or refresh token');
        }
        
        this.setAuthToken({ accessToken, refreshToken });
        this.setUser(user);
        
        // Reset refresh attempts sau khi login thành công
        this.refreshAttempts = 0;
        return response;
      } catch (error) {
        console.error('Login error:', error);
        this.logout();
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async refreshToken(): Promise<any> {
      // Tránh gọi refresh nhiều lần đồng thời
      if (this.isRefreshing) {
        return new Promise((resolve) => {
          const checkRefreshing = setInterval(() => {
            if (!this.isRefreshing) {
              clearInterval(checkRefreshing);
              resolve(undefined);
            }
          }, 100);
        });
      }

      try {
        this.setRefreshing(true);
        this.refreshAttempts++;

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log(`Attempting token refresh (attempt ${this.refreshAttempts}/3)`);

        const response = await authService.refreshToken(refreshToken);
        
        // Reset refresh attempts sau khi thành công
        this.refreshAttempts = 0;
        
        return response;
      } catch (error) {
        console.error('Token refresh failed:', error);
        
        // Nếu đã thử 3 lần mà không thành công, logout
        if (this.refreshAttempts >= 3) {
          this.logout();
        }
        
        throw error;
      } finally {
        this.setRefreshing(false);
      }
    },

    // Preemptive refresh - refresh token trước khi hết hạn
    async preemptiveRefresh(): Promise<void> {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const expirationTime = this.getTokenExpiration();
        if (!expirationTime) return;

        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;
        
        // Refresh token nếu còn ít hơn 5 phút
        const FIVE_MINUTES = 5 * 60 * 1000;
        
        if (timeUntilExpiry < FIVE_MINUTES && timeUntilExpiry > 0) {
          console.log('Preemptive token refresh - token expires soon');
          await this.refreshToken();
        }
      } catch (error) {
        console.error('Preemptive refresh failed:', error);
      }
    },

    logout(): void {
      // Clear all auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Reset state
      this.user = null;
      this.isAuthenticated = false;
      this.isLoading = false;
      this.isRefreshing = false;
      this.refreshAttempts = 0;
      
      // Redirect to login page
      if (window.location.hash !== '#/auth/signin') {
        window.location.href = '/#/auth/signin';
      }
    },

    // Method để kiểm tra token có hợp lệ không
    isTokenValid(): boolean {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;
    
      try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return false;
    
        // Normalize base64url -> base64 để atob xử lý được
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
        // Bổ sung padding nếu thiếu (base64 phải chia hết cho 4)
        while (base64.length % 4 !== 0) {
          base64 += '=';
        }
    
        const jsonPayload = atob(base64);
        const payload = JSON.parse(jsonPayload);
        const currentTime = Date.now() / 1000;
    
        return payload.exp > currentTime;
      } catch (error) {
        console.error('Token validation error:', error);
        return false;
      }
    },

    // Method để lấy thời gian hết hạn của token
    getTokenExpiration(): number | null {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000; // Convert to milliseconds
      } catch (error) {
        console.error('Token expiration check error:', error);
        return null;
      }
    },

    // Method để lấy thời gian còn lại của token (tính bằng giây)
    getTokenTimeRemaining(): number {
      const expirationTime = this.getTokenExpiration();
      if (!expirationTime) return 0;
      
      const currentTime = Date.now();
      return Math.max(0, Math.floor((expirationTime - currentTime) / 1000));
    }
  }
}); 