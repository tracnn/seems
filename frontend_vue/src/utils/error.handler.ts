import { useAuthStore } from '@/stores/auth.store';

interface AuthStore {
  logout: () => void;
}

interface ToastOptions {
  severity: 'error' | 'success' | 'warn' | 'info';
  summary: string;
  detail: string;
  life: number;
  closable: boolean;
}

interface ValidationErrors {
  [key: string]: string[];
}

interface ApiError {
  response?: {
    status: number;
    data?: {
      errors?: ValidationErrors;
      message?: string;
    };
  };
  name?: string;
  message?: string;
  code?: string;
}

declare global {
  interface Window {
    $toast?: {
      add: (options: ToastOptions) => void;
    };
  }
}

class ErrorHandler {
  private authStore: AuthStore | null = null;

  init(): void {
    this.authStore = useAuthStore();
    this.setupGlobalErrorHandler();
  }

  setupGlobalErrorHandler(): void {
    // Xử lý lỗi unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
    });

    // Xử lý lỗi JavaScript
    window.addEventListener('error', (event) => {
      this.handleError(event.error);
    });
  }

  handleError(error: ApiError | Error): void {
    console.error('Global error handler:', error);

    // Xử lý lỗi network
    if (error.name === 'NetworkError' || error.message?.includes('Network Error')) {
      this.showError('Lỗi kết nối mạng', 'Vui lòng kiểm tra kết nối internet và thử lại.');
      return;
    }

    // Xử lý lỗi timeout
    if ((error as any).code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      this.showError('Lỗi timeout', 'Yêu cầu mất quá nhiều thời gian để xử lý. Vui lòng thử lại.');
      return;
    }

    // Xử lý lỗi authentication
    if ((error as ApiError).response?.status === 401) {
      this.handleAuthError();
      return;
    }

    // Xử lý lỗi forbidden
    if ((error as ApiError).response?.status === 403) {
      this.showError('Không có quyền truy cập', 'Bạn không có quyền thực hiện hành động này.');
      return;
    }

    // Xử lý lỗi server
    if ((error as ApiError).response?.status && (error as ApiError).response!.status >= 500) {
      this.showError('Lỗi máy chủ', 'Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau.');
      return;
    }

    // Xử lý lỗi validation
    if ((error as ApiError).response?.status === 422) {
      this.handleValidationError(error as ApiError);
      return;
    }

    // Xử lý lỗi chung
    this.showError('Lỗi', error.message || 'Đã xảy ra lỗi không xác định.');
  }

  handleAuthError(): void {
    console.log('Authentication error detected');
    
    // Nếu đang ở trang login thì không làm gì
    if (window.location.hash === '#/auth/signin') {
      return;
    }

    // Logout user
    if (this.authStore) {
      this.authStore.logout();
    }

    // Hiển thị thông báo
    this.showError('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại để tiếp tục.');
  }

  handleValidationError(error: ApiError): void {
    const errors = error.response?.data?.errors;
    if (errors && typeof errors === 'object') {
      const errorMessages = Object.values(errors).flat();
      this.showError('Lỗi dữ liệu', errorMessages.join('\n'));
    } else {
      this.showError('Lỗi dữ liệu', 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
    }
  }

  showError(title: string, message: string): void {
    // Sử dụng PrimeVue Toast nếu có
    if (window.$toast) {
      window.$toast.add({
        severity: 'error',
        summary: title,
        detail: message,
        life: 5000,
        closable: true
      });
    } else {
      // Fallback sử dụng alert
      alert(`${title}: ${message}`);
    }
  }

  showSuccess(title: string, message: string): void {
    if (window.$toast) {
      window.$toast.add({
        severity: 'success',
        summary: title,
        detail: message,
        life: 3000,
        closable: true
      });
    }
  }

  showWarning(title: string, message: string): void {
    if (window.$toast) {
      window.$toast.add({
        severity: 'warn',
        summary: title,
        detail: message,
        life: 4000,
        closable: true
      });
    }
  }

  showInfo(title: string, message: string): void {
    if (window.$toast) {
      window.$toast.add({
        severity: 'info',
        summary: title,
        detail: message,
        life: 3000,
        closable: true
      });
    }
  }
}

// Tạo instance singleton
const errorHandler = new ErrorHandler();

export default errorHandler; 