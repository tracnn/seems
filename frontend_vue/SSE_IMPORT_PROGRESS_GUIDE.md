# Hướng dẫn sử dụng chức năng theo dõi tiến trình Import với SSE

## Tổng quan

Chức năng import lịch khám từ Excel đã được nâng cấp để hiển thị tiến trình theo thời gian thực sử dụng Server-Sent Events (SSE). Người dùng có thể theo dõi quá trình import một cách chi tiết và nhận thông báo lỗi ngay lập tức.

## Các tính năng mới

### 1. Theo dõi tiến trình theo thời gian thực
- Hiển thị phần trăm hoàn thành
- Cập nhật số lượng slot đã import/tổng số slot
- Hiển thị trạng thái kết nối SSE

### 2. Các giai đoạn import
- **PARSING_EXCEL**: Đang đọc và phân tích file Excel
- **INSERTING_SLOTS**: Đang thêm dữ liệu vào database
- **INSERTED_SLOTS**: Hoàn thành import

### 3. Hiển thị lỗi chi tiết
- Danh sách lỗi theo từng dòng
- Thông báo lỗi cụ thể (ví dụ: không tìm thấy bác sĩ)
- Hiển thị tối đa 5 lỗi gần nhất

### 4. Giao diện người dùng
- Progress bar với phần trăm
- Các indicator cho từng giai đoạn
- Trạng thái kết nối (xanh = kết nối, đỏ = mất kết nối)
- Danh sách lỗi có thể cuộn

## Cách sử dụng

### 1. Mở dialog import
- Nhấn nút "Import Excel" trong trang quản lý lịch khám
- Chọn file Excel (.xlsx hoặc .xls)
- Nhấn nút "Import"

### 2. Theo dõi tiến trình
- Dialog sẽ hiển thị progress bar và thông tin chi tiết
- Các giai đoạn sẽ được highlight theo thứ tự
- Lỗi sẽ được hiển thị ngay khi phát hiện

### 3. Kết quả
- Thông báo thành công khi hoàn thành
- Dialog sẽ tự động đóng sau 2 giây
- Dữ liệu sẽ được refresh tự động

## Cấu trúc dữ liệu SSE

### Event format
```json
{
  "data": {
    "event": "IMPORT_APPOINTMENT_SLOT",
    "data": {
      "success": true,
      "phase": "PARSING_EXCEL",
      "message": "Đang đọc file Excel...",
      "row": 8,
      "inserted": 100,
      "total": 2400
    },
    "at": "2025-09-11 14:30:59"
  }
}
```

### Các phase
- `PARSING_EXCEL`: Đang phân tích file Excel
- `INSERTING_SLOTS`: Đang thêm slot vào database
- `INSERTED_SLOTS`: Hoàn thành import

### Các trường dữ liệu
- `success`: boolean - thành công hay thất bại
- `phase`: string - giai đoạn hiện tại
- `message`: string - thông báo mô tả
- `row`: number (optional) - số dòng gặp lỗi
- `inserted`: number (optional) - số slot đã import
- `total`: number (optional) - tổng số slot

## Xử lý lỗi

### Lỗi kết nối SSE
- Hiển thị trạng thái "Mất kết nối"
- Vẫn có thể import nhưng không có tiến trình real-time
- Fallback về progress bar thông thường

### Lỗi import
- Hiển thị trong danh sách lỗi
- Không dừng quá trình import
- Tổng kết lỗi ở cuối

## Testing

### File test SSE
Sử dụng file `test-sse-connection.html` để test kết nối SSE:

1. Mở file trong browser
2. Nhập JWT token
3. Nhấn "Connect SSE"
4. Nhấn "Test SSE" để gửi message test

### Endpoint SSE
- **URL**: `GET /sse/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Server-Sent Events stream

## Cấu hình

### Environment variables
```env
VITE_API_BASE_URL=http://localhost:7111
```

### Backend requirements
- SSE endpoint `/sse/me` với JWT authentication
- Redis để publish/subscribe events
- Import service publish events theo format chuẩn

## Troubleshooting

### Không nhận được SSE events
1. Kiểm tra JWT token có hợp lệ
2. Kiểm tra kết nối đến backend
3. Kiểm tra console log để debug

### Import không hiển thị tiến trình
1. Kiểm tra SSE connection status
2. Fallback về progress bar thông thường
3. Kiểm tra network tab trong DevTools

### Lỗi parsing SSE data
1. Kiểm tra format JSON từ server
2. Kiểm tra console log để debug
3. Đảm bảo server gửi đúng format

## Code structure

### Files chính
- `frontend/src/composables/useSSE.ts` - SSE composable
- `frontend/src/types/import-progress.ts` - Type definitions
- `frontend/src/views/backend/appointment/components/ImportDialog.vue` - UI component

### Key functions
- `useSSE()` - Composable để xử lý SSE
- `handleSSEEvent()` - Xử lý events từ server
- `getPhaseClass()` - CSS classes cho các phase
- `resetImportProgress()` - Reset trạng thái import
