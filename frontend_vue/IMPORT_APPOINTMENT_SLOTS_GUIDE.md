# Hướng dẫn Import Lịch Khám từ Excel

## 📋 Tổng quan

Chức năng import lịch khám cho phép admin upload file Excel để tạo hàng loạt lịch khám cho các bác sĩ, phòng khám và dịch vụ.

## 🎯 Cách sử dụng

### 1. Trong ứng dụng Frontend

1. **Truy cập trang quản lý**: Vào "Quản lý App bệnh nhân" → "Lịch khám"
2. **Mở dialog import**: Click button **"Import Excel"** trên toolbar
3. **Chọn file**: Click "Chọn file" và chọn file Excel (.xlsx, .xls)
4. **Import**: Click "Import" để upload file
5. **Kết quả**: Hệ thống sẽ hiển thị progress và thông báo kết quả

### 2. Test với file HTML

1. Mở file `test-import-appointment-slots.html` trong browser
2. Nhập Authorization token (Bearer token)
3. Chọn file Excel
4. Click "Import File"

### 3. Test với cURL

```bash
curl --location 'https://patienthub.bachmai.gov.vn/admin/appointment-slots/import' \
--header 'Authorization: Bearer your-token-here' \
--form 'file=@"/path/to/your/excel-file.xlsx"'
```

## 📊 Cấu trúc file Excel

### Các cột bắt buộc:

| Cột | Tên | Mô tả | Ví dụ |
|-----|-----|-------|-------|
| 1 | `slot_date` | Ngày khám (YYYY-MM-DD) | `2024-01-15` |
| 2 | `clinic_code` | Mã phòng khám | `PKTL`, `PKTL1`, `PKTL2` |
| 3 | `doctor_code` | Mã bác sĩ | `ttmp`, `pnd`, `nttm2` |
| 4 | `service_code` | Mã dịch vụ | `KTL` |
| 5 | `morning` | Buổi sáng | `x` = có lịch, trống = không |
| 6 | `afternoon` | Buổi chiều | `x` = có lịch, trống = không |
| 7 | `evening` | Buổi tối | `x` = có lịch, trống = không |

### Ví dụ dữ liệu:

```csv
slot_date,clinic_code,doctor_code,service_code,morning,afternoon,evening
2024-01-15,PKTL,ttmp,KTL,x,x,x
2024-01-15,PKTL,pnd,KTL,x,,x
2024-01-15,PKTL1,pvc4,KTL,,x,x
2024-01-15,PKTL2,tts1,KTL,x,x,
2024-01-16,PKTL,nttm2,KTL,x,x,x
```

## ⚙️ Yêu cầu kỹ thuật

### File Excel:
- **Định dạng**: .xlsx hoặc .xls
- **Kích thước tối đa**: 10MB
- **Encoding**: UTF-8
- **Dòng đầu tiên**: Phải là header (tên cột)

### API Endpoint:
- **URL**: `POST /admin/appointment-slots/import`
- **Content-Type**: `multipart/form-data`
- **Authorization**: Bearer token bắt buộc

### Validation:
- ✅ Kiểm tra định dạng file (.xlsx, .xls)
- ✅ Kiểm tra kích thước file (≤ 10MB)
- ✅ Kiểm tra cấu trúc cột
- ✅ Kiểm tra định dạng ngày (YYYY-MM-DD)
- ✅ Kiểm tra mã phòng khám, bác sĩ, dịch vụ tồn tại

## 🔧 Xử lý lỗi

### Lỗi thường gặp:

1. **"Chỉ chấp nhận file Excel"**
   - **Nguyên nhân**: File không phải .xlsx hoặc .xls
   - **Giải pháp**: Chuyển đổi file sang định dạng Excel

2. **"Kích thước file vượt quá 10MB"**
   - **Nguyên nhân**: File quá lớn
   - **Giải pháp**: Chia nhỏ file hoặc nén file

3. **"Cấu trúc file không đúng"**
   - **Nguyên nhân**: Thiếu cột hoặc tên cột sai
   - **Giải pháp**: Sử dụng template mẫu

4. **"Mã phòng khám/bác sĩ/dịch vụ không tồn tại"**
   - **Nguyên nhân**: Mã trong file không có trong hệ thống
   - **Giải pháp**: Kiểm tra và cập nhật mã đúng

5. **"Định dạng ngày không đúng"**
   - **Nguyên nhân**: Ngày không theo format YYYY-MM-DD
   - **Giải pháp**: Chuyển đổi ngày sang định dạng đúng

## 📁 Files liên quan

### Frontend:
- `src/views/backend/appointment/AppointmentSlotsManagement.vue` - Trang chính
- `src/views/backend/appointment/components/ImportDialog.vue` - Dialog import
- `src/api/appointment-slots.service.ts` - API service
- `src/stores/appointment-slots.store.ts` - State management

### Test:
- `test-import-appointment-slots.html` - File test standalone
- `template_lich_kham.xlsx` - Template mẫu

## 🚀 Tính năng

### ✅ Đã hoàn thành:
- Upload file Excel với validation
- Progress bar hiển thị tiến trình
- Error handling chi tiết
- Template download
- Auto refresh data sau import
- Toast notifications
- Responsive UI

### 🔄 Có thể mở rộng:
- Import từ CSV
- Export template Excel thực tế (không phải CSV)
- Batch processing cho file lớn
- Preview data trước khi import
- Rollback khi có lỗi

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra file Excel theo template mẫu
2. Xem log lỗi trong browser console
3. Kiểm tra network tab để xem API response
4. Liên hệ team phát triển với thông tin lỗi chi tiết
