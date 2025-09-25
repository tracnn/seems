import { useAuthStore } from '@/stores/auth.store';

interface TokenInfo {
  exists: boolean;
  valid: boolean;
  timeRemaining: number;
  expiresAt: Date | null;
  payload?: any;
  error?: string;
}

interface AuthStore {
  getIsAuthenticated: boolean;
  preemptiveRefresh: () => Promise<void>;
  isTokenValid: () => boolean;
  refreshToken: () => Promise<void>;
  logout: () => void;
}

class TokenManager {
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private preemptiveInterval: ReturnType<typeof setInterval> | null = null;
  private authStore: AuthStore | null = null;

  // Khởi tạo token manager
  init(): void {
    this.authStore = useAuthStore();
    this.startPreemptiveRefresh();
    this.startTokenValidation();
  }

  // Dừng tất cả intervals
  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    if (this.preemptiveInterval) {
      clearInterval(this.preemptiveInterval);
      this.preemptiveInterval = null;
    }
  }

  // Bắt đầu preemptive refresh - kiểm tra và refresh token trước khi hết hạn
  startPreemptiveRefresh(): void {
    // Kiểm tra mỗi phút
    this.preemptiveInterval = setInterval(async () => {
      if (!this.authStore!.getIsAuthenticated) {
        return;
      }

      try {
        await this.authStore!.preemptiveRefresh();
      } catch (error) {
        console.error('Preemptive refresh failed:', error);
      }
    }, 60000); // 1 phút
  }

  // Bắt đầu validation token định kỳ
  startTokenValidation(): void {
    // Kiểm tra mỗi 5 phút
    this.refreshInterval = setInterval(async () => {
      if (!this.authStore!.getIsAuthenticated) {
        return;
      }

      try {
        const isValid = this.authStore!.isTokenValid();
        if (!isValid) {
          console.log('Token invalid, attempting refresh...');
          await this.authStore!.refreshToken();
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        // Nếu không thể refresh, logout
        this.authStore!.logout();
      }
    }, 300000); // 5 phút
  }

  // Kiểm tra token ngay lập tức
  async validateTokenImmediately(): Promise<boolean> {
    if (!this.authStore!.getIsAuthenticated) {
      return false;
    }

    try {
      const isValid = this.authStore!.isTokenValid();
      if (!isValid) {
        await this.authStore!.refreshToken();
        return true;
      }
      return true;
    } catch (error) {
      console.error('Immediate token validation failed:', error);
      this.authStore!.logout();
      return false;
    }
  }

  // Lấy thông tin token
  getTokenInfo(): TokenInfo {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return {
        exists: false,
        valid: false,
        timeRemaining: 0,
        expiresAt: null
      };
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const expiresAt = payload.exp * 1000;
      const timeRemaining = Math.max(0, payload.exp - currentTime);

      return {
        exists: true,
        valid: payload.exp > currentTime,
        timeRemaining: Math.floor(timeRemaining),
        expiresAt: new Date(expiresAt),
        payload
      };
    } catch (error) {
      return {
        exists: true,
        valid: false,
        timeRemaining: 0,
        expiresAt: null,
        error: (error as Error).message
      };
    }
  }

  // Format thời gian còn lại
  formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return 'Đã hết hạn';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  // Kiểm tra xem có cần refresh không
  shouldRefresh(): boolean {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo.exists || !tokenInfo.valid) {
      return true;
    }

    // Refresh nếu còn ít hơn 5 phút
    const FIVE_MINUTES = 5 * 60;
    return tokenInfo.timeRemaining < FIVE_MINUTES;
  }
}

// Tạo singleton instance
const tokenManager = new TokenManager();

export default tokenManager; 