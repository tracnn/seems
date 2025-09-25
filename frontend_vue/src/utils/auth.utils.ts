import { useAuthStore } from '@/stores/auth.store';

interface TokenTimeRemaining {
  minutes: number;
  seconds: number;
}

interface AuthStore {
  getTokenExpiration: () => number | null;
  refreshToken: () => Promise<void>;
  logout: () => void;
}

class AuthUtils {
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private authStore: AuthStore | null = null;
  private isSettingUp: boolean = false;
  private isRefreshing: boolean = false;

  // Khởi tạo auth utils
  init(): void {
    this.authStore = useAuthStore();
    // this.setupTokenRefresh(); // Tạm bỏ tự động refresh token
  }

  // Thiết lập tự động refresh token
  setupTokenRefresh(): void {
    if (!this.authStore || this.isSettingUp || this.isRefreshing) return;

    const expiration = this.authStore.getTokenExpiration();
    if (!expiration) return;

    const now = Date.now();
    const timeUntilExpiry = expiration - now;
    
    // Nếu token đã hết hạn, không setup refresh
    if (timeUntilExpiry <= 0) {
      console.warn('Token has already expired');
      return;
    }
    
    // Refresh token 5 phút trước khi hết hạn
    const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0);

    // Clear timer cũ nếu có
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Set timer mới
    this.refreshTimer = setTimeout(async () => {
      if (this.isRefreshing) return; // Chặn gọi lặp
      this.isRefreshing = true;

      try {
        this.isSettingUp = true;
        await this.authStore!.refreshToken();
        // Thiết lập lại timer cho token mới
        this.isSettingUp = false;
        this.isRefreshing = false;
        this.setupTokenRefresh();
      } catch (error) {
        console.error('Auto refresh token failed:', error);
        this.isSettingUp = false;
        this.isRefreshing = false;
        this.cleanup(); // Cleanup timer khi lỗi
        this.authStore!.logout();
      }
    }, refreshTime);

    console.log(`Token refresh scheduled in ${Math.floor(refreshTime / 1000)} seconds`);
  }

  // Dọn dẹp timer khi logout
  cleanup(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.isSettingUp = false;
    this.isRefreshing = false;
  }

  // Kiểm tra token có sắp hết hạn không (trong vòng 10 phút)
  isTokenExpiringSoon(): boolean {
    if (!this.authStore) return false;

    const expiration = this.authStore.getTokenExpiration();
    if (!expiration) return false;

    const now = Date.now();
    const timeUntilExpiry = expiration - now;
    
    // Trả về true nếu token hết hạn trong vòng 10 phút
    return timeUntilExpiry < (10 * 60 * 1000);
  }

  // Format thời gian còn lại của token
  getTokenTimeRemaining(): TokenTimeRemaining | null {
    if (!this.authStore) return null;

    const expiration = this.authStore.getTokenExpiration();
    if (!expiration) return null;

    const now = Date.now();
    const timeUntilExpiry = Math.max(expiration - now, 0);

    const minutes = Math.floor(timeUntilExpiry / (1000 * 60));
    const seconds = Math.floor((timeUntilExpiry % (1000 * 60)) / 1000);

    return { minutes, seconds };
  }
}

// Tạo instance singleton
const authUtils = new AuthUtils();

export default authUtils; 