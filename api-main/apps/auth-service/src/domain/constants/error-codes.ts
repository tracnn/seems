export enum ErrorCode {
  // Authentication Errors
  INVALID_CREDENTIALS = 'AUTH_001',
  USER_NOT_FOUND = 'AUTH_002',
  USER_ALREADY_EXISTS = 'AUTH_003',
  EMAIL_ALREADY_EXISTS = 'AUTH_004',
  USERNAME_ALREADY_EXISTS = 'AUTH_005',
  INVALID_TOKEN = 'AUTH_006',
  TOKEN_EXPIRED = 'AUTH_007',
  REFRESH_TOKEN_NOT_FOUND = 'AUTH_008',
  REFRESH_TOKEN_REVOKED = 'AUTH_009',
  REFRESH_TOKEN_EXPIRED = 'AUTH_010',
  
  // User Errors
  USER_INACTIVE = 'USER_001',
  USER_NOT_VERIFIED = 'USER_002',
  
  // Validation Errors
  INVALID_INPUT = 'VAL_001',
  MISSING_REQUIRED_FIELD = 'VAL_002',
  
  // Server Errors
  INTERNAL_SERVER_ERROR = 'SRV_001',
  DATABASE_ERROR = 'SRV_002',
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.INVALID_CREDENTIALS]: 'Tên đăng nhập hoặc mật khẩu không đúng',
  [ErrorCode.USER_NOT_FOUND]: 'Người dùng không tồn tại',
  [ErrorCode.USER_ALREADY_EXISTS]: 'Người dùng đã tồn tại',
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 'Email đã được sử dụng',
  [ErrorCode.USERNAME_ALREADY_EXISTS]: 'Tên đăng nhập đã được sử dụng',
  [ErrorCode.INVALID_TOKEN]: 'Token không hợp lệ',
  [ErrorCode.TOKEN_EXPIRED]: 'Token đã hết hạn',
  [ErrorCode.REFRESH_TOKEN_NOT_FOUND]: 'Refresh token không tồn tại',
  [ErrorCode.REFRESH_TOKEN_REVOKED]: 'Refresh token đã bị thu hồi',
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: 'Refresh token đã hết hạn',
  [ErrorCode.USER_INACTIVE]: 'Tài khoản đã bị vô hiệu hóa',
  [ErrorCode.USER_NOT_VERIFIED]: 'Email chưa được xác thực',
  [ErrorCode.INVALID_INPUT]: 'Dữ liệu đầu vào không hợp lệ',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Thiếu trường bắt buộc',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Lỗi máy chủ nội bộ',
  [ErrorCode.DATABASE_ERROR]: 'Lỗi cơ sở dữ liệu',
};

