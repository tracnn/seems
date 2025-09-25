// UnauthorizedException
export const ERROR_401 = {
    UNAUTHORIZED: { message: 'Bạn không có quyền truy cập vào tài nguyên này' },
    INVALID_CREDENTIALS: { message: 'Tên đăng nhập hoặc mật khẩu không hợp lệ' },
    INVALID_OTP: { message: 'Mã OTP không hợp lệ' },
    INVALID_REFRESH_TOKEN: { message: 'Mã refresh token không hợp lệ' },
    INVALID_ACCESS_TOKEN: { message: 'Mã access token không hợp lệ' },
    INVALID_TOKEN: { message: 'Mã token không hợp lệ' },
    INVALID_TOKEN_SIGNATURE: { message: 'Mã signature token không hợp lệ' },
    INVALID_TOKEN_EXPIRED: { message: 'Mã token đã hết hạn' },
}
