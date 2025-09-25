export const ERRORS = {
    // Authentication errors (4xx)
    INVALID_CREDENTIALS: {
        code: 'INVALID_CREDENTIALS',
        message: 'Tên đăng nhập hoặc mật khẩu không đúng',
        status: 401,
    },
    INVALID_REFRESH_TOKEN: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token không hợp lệ',
        status: 401,
    },
    UNAUTHORIZED: {
        code: 'UNAUTHORIZED',
        message: 'Không có quyền truy cập',
        status: 401,
    },
    FORBIDDEN: {
        code: 'FORBIDDEN',
        message: 'Truy cập bị cấm',
        status: 403,
    },
    ACCOUNT_LOCKED: {
        code: 'ACCOUNT_LOCKED',
        message: 'Tài khoản đã bị khóa',
        status: 403,
    },
    OTP_VERIFICATION_FAILED: {
        code: 'OTP_VERIFICATION_FAILED',
        message: 'Xác thực OTP thất bại',
        status: 403,
    },
    UNKNOWN_OTP_TYPE: {
        code: 'UNKNOWN_OTP_TYPE',
        message: 'Loại OTP không hợp lệ',
        status: 403,
    },
    ACCOUNT_NOT_ACTIVE: {
        code: 'ACCOUNT_NOT_ACTIVE',
        message: 'Tài khoản chưa kích hoạt',
        status: 403,
    },

    // Validation errors (4xx)
    INVALID_INPUT: {
        code: 'INVALID_INPUT',
        message: 'Dữ liệu đầu vào không hợp lệ',
        status: 400,
    },
    DUPLICATE_USERNAME: {
        code: 'DUPLICATE_USERNAME',
        message: 'Tên đăng nhập đã tồn tại',
        status: 400,
    },
    DUPLICATE_EMAIL: {
        code: 'DUPLICATE_EMAIL',
        message: 'Email đã tồn tại',
        status: 400,
    },
    DUPLICATE_IDENTITY_NUMBER: {
        code: 'DUPLICATE_IDENTITY_NUMBER',
        message: 'Số CCCD/Định danh cá nhân đã tồn tại',
        status: 400,
    },
    DUPLICATE_SOCIAL_INSURANCE: {
        code: 'DUPLICATE_SOCIAL_INSURANCE',
        message: 'Mã số BHXH đã tồn tại',
        status: 400,
    },
    USER_PENDING_REGISTER: {
        code: 'USER_PENDING_REGISTER',
        message: 'Bạn đã gửi yêu cầu đăng ký. Vui lòng kiểm tra OTP trong Zalo/SMS hoặc thử lại sau ít phút.',
        status: 400,
    },
    PASSWORD_NOT_MATCH: {
        code: 'PASSWORD_NOT_MATCH',
        message: 'Mật khẩu xác nhận không khớp',
        status: 400,
    },
    UPDATE_PASSWORD_FAILED: {
        code: 'UPDATE_PASSWORD_FAILED',
        message: 'Cập nhật mật khẩu thất bại',
        status: 400,
    },
    DUPLICATE_PHONE_NUMBER: {
        code: 'DUPLICATE_PHONE_NUMBER',
        message: 'Số điện thoại đã tồn tại',
        status: 400,
    },
    // ForbiddenException
    FORBIDDEN_OTP: {
        code: 'FORBIDDEN_OTP',
        message: 'Bạn đã nhập sai quá số lần OTP trong ngày. Liên hệ CSKH để được hỗ trợ',
        status: 403,
    },
    FORBIDDEN_OTP_RESEND: {
        code: 'FORBIDDEN_OTP_RESEND',
        message: 'Vui lòng chờ trước khi gửi lại OTP',
        status: 403,
    },
    TREATMENT_ACCESS_DENIED: {
        code: 'TREATMENT_ACCESS_DENIED',
        message: 'Bạn không có quyền xem hồ sơ này',
        status: 403,
    },
    // Not found errors (4xx)
    TTL_EXPIRED: {
        code: 'TTL_EXPIRED',
        message: 'Thời gian sử dụng OTP đã hết hạn',
        status: 404,
    },
    USER_NOT_FOUND: {
        code: 'USER_NOT_FOUND',
        message: 'Người dùng không tồn tại hoặc đã bị xóa',
        status: 404,
    },
    PATIENT_NOT_FOUND: {
        code: 'PATIENT_NOT_FOUND',
        message: 'Bệnh nhân không tồn tại hoặc đã bị xóa',
        status: 404,
    },
    RESOURCE_NOT_FOUND: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy tài nguyên',
        status: 404,
    },
    INFORMATION_NOT_FOUND: {
        code: 'INFORMATION_NOT_FOUND',
        message: 'Thông tin không hợp lệ',
        status: 404,
    },
    USER_WITH_INFORMATION_NOT_FOUND: {
        code: 'USER_WITH_INFORMATION_NOT_FOUND',
        message: 'Không tìm thấy người dùng với thông tin này',
        status: 404,
    },
    NOT_FOUND_SERVICE_REQ: {
        code: 'NOT_FOUND_SERVICE_REQ',
        message: 'Không tìm thấy y lệnh',
        status: 404,
    },
    TREATMENT_NOT_FOUND: {
        code: 'TREATMENT_NOT_FOUND',
        message: 'Không tìm thấy hồ sơ',
        status: 403,
    },
    // Server errors (5xx)
    INTERNAL_SERVER_ERROR: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Lỗi máy chủ nội bộ',
        status: 500,
    },
    DATABASE_ERROR: {
        code: 'DATABASE_ERROR',
        message: 'Lỗi cơ sở dữ liệu',
        status: 500,
    },
    EXTERNAL_SERVICE_ERROR: {
        code: 'EXTERNAL_SERVICE_ERROR',
        message: 'Lỗi dịch vụ bên ngoài',
        status: 500,
    },
}; 