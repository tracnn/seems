# Satisfaction Survey Management

## Tổng quan
Module quản lý khảo sát hài lòng cho phép admin xem, lọc và quản lý các khảo sát hài lòng từ bệnh nhân.

## Tính năng
- **Xem danh sách khảo sát hài lòng**: Hiển thị tất cả khảo sát với thông tin chi tiết
- **Lọc theo ngày**: Lọc khảo sát theo khoảng thời gian
- **Lọc theo trạng thái**: PENDING, COMPLETED, CANCELLED
- **Lọc theo loại**: TREATMENT (Điều trị), SERVICE (Dịch vụ)
- **Tìm kiếm**: Tìm kiếm theo tên bệnh nhân, mã bệnh nhân
- **Phân trang**: Hỗ trợ phân trang với các tùy chọn số bản ghi
- **Sắp xếp**: Sắp xếp theo các trường khác nhau
- **Chỉnh sửa**: Cập nhật thông tin khảo sát
- **Xóa**: Xóa khảo sát (có xác nhận)

## Cấu trúc file
```
satisfaction-survey/
├── SatisfactionSurveyManagement.vue  # Component chính
├── SatisfactionSurveyFilter.vue      # Component lọc
├── SatisfactionSurveyTable.vue       # Component bảng dữ liệu
├── SatisfactionSurveyDialog.vue      # Component dialog chỉnh sửa
├── index.ts                          # Export các component
└── README.md                         # Tài liệu này
```

## API Endpoint
- **GET** `/admin/satisfaction-survey` - Lấy danh sách khảo sát hài lòng

### Query Parameters
- `page`: Số trang (mặc định: 1)
- `limit`: Số bản ghi mỗi trang (mặc định: 10)
- `fromDate`: Ngày bắt đầu (YYYY-MM-DD)
- `toDate`: Ngày kết thúc (YYYY-MM-DD)
- `surveyStatus`: Trạng thái khảo sát (PENDING, COMPLETED, CANCELLED)
- `surveyType`: Loại khảo sát (TREATMENT, SERVICE)
- `search`: Từ khóa tìm kiếm

### Response Format
```json
{
  "data": [
    {
      "id": "uuid",
      "createdAt": "2025-09-11T00:01:50.054Z",
      "updatedAt": "2025-09-11T00:01:50.054Z",
      "createdBy": "uuid",
      "updatedBy": null,
      "version": 1,
      "userId": "uuid",
      "patientCode": "0003072354",
      "treatmentCode": "000005055796",
      "serviceReqCode": null,
      "surveyStatus": "PENDING",
      "surveyType": "TREATMENT",
      "surveyScore": 5,
      "surveyComment": null,
      "user": {
        "id": "uuid",
        "fullName": "Nguyễn Đình Chốt",
        "phoneNumber": "0378680766",
        "email": "nguyendinhchot3@gmail.com",
        // ... other user fields
      }
    }
  ],
  "pagination": {
    "total": 38,
    "page": 1,
    "limit": 10,
    "pageCount": 4,
    "hasNext": true,
    "hasPrev": false
  },
  "status": 200,
  "message": "Success",
  "now": "2025-09-11 08:00:16.800"
}
```

## Cách sử dụng

### 1. Truy cập trang
- Đăng nhập với tài khoản admin
- Vào menu "Khảo sát hài lòng" trong sidebar

### 2. Lọc dữ liệu
- Chọn khoảng thời gian từ ngày - đến ngày
- Chọn trạng thái khảo sát (tùy chọn)
- Chọn loại khảo sát (tùy chọn)
- Nhấn "Lọc" để áp dụng

### 3. Tìm kiếm
- Nhập từ khóa vào ô tìm kiếm
- Hệ thống sẽ tìm kiếm theo tên bệnh nhân và mã bệnh nhân

### 4. Chỉnh sửa khảo sát
- Nhấn nút "Chỉnh sửa" (biểu tượng bút chì) trên dòng khảo sát
- Cập nhật thông tin trong dialog
- Nhấn "Lưu" để lưu thay đổi

### 5. Xóa khảo sát
- Nhấn nút "Xóa" (biểu tượng thùng rác) trên dòng khảo sát
- Xác nhận việc xóa trong dialog
- Khảo sát sẽ bị xóa khỏi hệ thống

## Lưu ý
- Cần có quyền admin để truy cập chức năng này
- Tất cả thao tác đều yêu cầu xác thực JWT
- Dữ liệu được cập nhật real-time sau mỗi thao tác
- Hỗ trợ responsive design trên các thiết bị khác nhau
