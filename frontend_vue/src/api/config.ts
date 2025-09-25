import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Lấy API base URL từ environment variable
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Log để debug (chỉ trong development)
if (import.meta.env.DEV) {
  console.log('VITE_API_BASE_URL:', apiBaseUrl);
}

// Tạo instance axios với cấu hình mặc định
const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl || 'http://192.168.7.221:3808/admin',
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Biến để tránh gọi refresh token nhiều lần đồng thời
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];
let refreshAttempts = 0; // Thêm counter để tránh refresh liên tục
const MAX_REFRESH_ATTEMPTS = 3; // Giới hạn số lần refresh

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

const processQueue = (error: any, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  
  failedQueue = [];
};

// Interceptor cho request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Xử lý refresh token khi access token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Kiểm tra số lần refresh đã thực hiện
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        console.error('Max refresh attempts reached, logging out');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (window.location.hash !== '#/auth/signin') {
          window.location.href = '/#/auth/signin';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang refresh, thêm request vào queue
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempts++;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {

          console.log(`Attempting token refresh (attempt ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS})`);

          const response = await axios.post<RefreshResponse>(`${apiClient.defaults.baseURL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Cập nhật tokens
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Reset refresh attempts counter
          refreshAttempts = 0;

          // Cập nhật header cho request gốc
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          // Xử lý queue
          processQueue(null, accessToken);
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh token cũng hết hạn, logout user
        processQueue(refreshError, null);
        
        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Reset refresh attempts
        refreshAttempts = 0;
        
        // Redirect to login
        if (window.location.hash !== '#/auth/signin') {
          window.location.href = '/#/auth/signin';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý lỗi 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
      // Có thể redirect đến trang 403 hoặc logout
    }

    return Promise.reject(error);
  }
);

export default apiClient; 