import apiClient from './config';
import type { AxiosResponse } from 'axios';
import type { User } from '@/models/user.model';

interface Credentials {
  username: string;
  password: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
  };
}

interface ChangePasswordResponse {
  message: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordResponse {
  message: string;
}

interface ValidateTokenResponse {
  valid: boolean;
}

export const authService = {
  // Đăng nhập
  async login(credentials: Credentials): Promise<AxiosResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      // Gọi API logout nếu có
      await apiClient.post('/auth/logout');
    } catch (error: any) {
      // Không throw error vì logout local vẫn cần thực hiện
      console.warn('Server logout failed:', error);
    } finally {
      // Luôn clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  // Lấy thông tin user hiện tại
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<{ data: User }>('/auth/me');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      throw error;
    }
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
      
      // Cập nhật tokens nếu response có chứa tokens mới
      if (response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        if (response.data.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
      }
      
      return response.data;
    } catch (error: any) {
      // Xử lý các lỗi cụ thể cho refresh token
      if (error.response?.status === 401) {
        throw new Error('Refresh token không hợp lệ hoặc đã hết hạn');
      } else if (error.response?.status === 400) {
        throw new Error('Refresh token không đúng định dạng');
      } else if (error.response?.status && error.response.status >= 500) {
        throw new Error('Lỗi server khi refresh token');
      }
      throw error;
    }
  },

  // Kiểm tra trạng thái token
  async validateToken(): Promise<boolean> {
    try {
      const response = await apiClient.get<ValidateTokenResponse>('/auth/validate');
      return response.data.valid;
    } catch (error: any) {
      return false;
    }
  },

  // Đổi mật khẩu
  async changePassword(passwordData: PasswordData): Promise<ChangePasswordResponse> {
    try {
      const response = await apiClient.post<ChangePasswordResponse>('/auth/change-password', passwordData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Mật khẩu hiện tại không đúng');
      }
      throw error;
    }
  },

  // Quên mật khẩu
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Email không tồn tại trong hệ thống');
      }
      throw error;
    }
  },

  // Reset mật khẩu
  async resetPassword(resetData: ResetPasswordData): Promise<ResetPasswordResponse> {
    try {
      const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', resetData);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Token reset không hợp lệ hoặc đã hết hạn');
      }
      throw error;
    }
  }
}; 