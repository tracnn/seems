// ConflictException
export const ERROR_409 = {
    CONFLICT: { message: 'Xung đột' },
    CONFLICT_IDENTITY_NUMBER: { message: 'Mã số CCCD đã được đăng ký sử dụng trên hệ thống' },
    CONFLICT_INSURANCE_NUMBER: { message: 'Mã số BHXH đã được đăng ký sử dụng trên hệ thống' },
    CONFLICT_EMAIL: { message: 'Email đã tồn tại' },
    CONFLICT_PHONE: { message: 'Số điện thoại đã tồn tại' },
    CONFLICT_USERNAME: { message: 'Tên đăng nhập đã tồn tại' },
    CONFLICT_PASSWORD: { message: 'Mật khẩu đã tồn tại' },
    CONFLICT_OTP: { message: 'Mã OTP đã tồn tại' },
    CONFLICT_TOKEN: { message: 'Mã token đã tồn tại' },
    CONFLICT_REFRESH_TOKEN: { message: 'Mã refresh token đã tồn tại' },
    CONFLICT_ACCESS_TOKEN: { message: 'Mã access token đã tồn tại' },
    CONFLICT_SIGNATURE_TOKEN: { message: 'Mã signature token đã tồn tại' },
    CONFLICT_DUPLICATE_IDENTITY_NUMBER_IN_USER: { message: 'Chủ tài khoản không được tự thêm mình là thành viên' },
    CONFLICT_IDENTITY_NUMBER_IN_FAMILY_MEMBER: { message: 'Số CCCD đã được đăng ký là thành viên trong gia đình' },
    SURVEY_ALREADY_COMPLETED_NOT_ALLOWED_UPDATE: { message: 'Hồ sơ này đã được hoàn thành đánh giá rồi bạn không sửa/xóa được' },
    SERVICE_ALREADY_COMPLETED_NOT_ALLOWED_UPDATE: { message: 'Dịch vụ này đã được hoàn thành đánh giá rồi bạn không sửa/xóa được' },
}