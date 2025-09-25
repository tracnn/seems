# Debug Import Issue - Hướng dẫn khắc phục

## 🐛 Vấn đề
Khi chọn file xong bấm nút Import thì không thấy hoạt động gì cả.

## 🔍 Cách debug

### 1. **Kiểm tra Console Logs**
Mở Developer Tools (F12) → Console tab và thực hiện các bước sau:

1. **Mở trang "Quản lý lịch khám"**
2. **Click button "Import Excel"**
3. **Chọn file Excel**
4. **Click button "Import"**

Bạn sẽ thấy các log sau nếu hoạt động đúng:
```
showImportDialog called
importDialog.value set to: true
File selected: [object File]
Selected file: your-file.xlsx application/vnd.openxmlformats-officedocument.spreadsheetml.sheet 12345
File validated successfully
Import button clicked
Selected file: [object File]
Starting upload...
onFileUpload called
Starting upload process...
FormData created, calling API...
Calling appointmentSlotsStore.importAppointmentSlot...
```

### 2. **Kiểm tra Network Tab**
Mở Developer Tools (F12) → Network tab:

1. **Filter by "XHR" hoặc "Fetch"**
2. **Thực hiện import**
3. **Kiểm tra xem có request nào được gửi không**

Nếu có request, kiểm tra:
- **Status code**: 200, 201 (thành công) hoặc 400, 401, 500 (lỗi)
- **Request headers**: Có Authorization header không
- **Request payload**: Có file được gửi không

### 3. **Test với file HTML**
Mở file `test-import-component.html` trong browser để test từng bước:

1. **Test File Selection**: Kiểm tra file có được chọn đúng không
2. **Test FormData Creation**: Kiểm tra FormData có được tạo đúng không
3. **Test API Call**: Kiểm tra API có hoạt động không
4. **Test Complete Flow**: Test toàn bộ quy trình

### 4. **Kiểm tra các lỗi thường gặp**

#### A. **File không được chọn**
```
Import button clicked
Selected file: null
No file selected
```
**Giải pháp**: Đảm bảo chọn file trước khi click Import

#### B. **File type không hợp lệ**
```
File type không hợp lệ: application/octet-stream
```
**Giải pháp**: Chọn file Excel (.xlsx, .xls) thực sự

#### C. **File quá lớn**
```
File quá lớn: 15728640 bytes
```
**Giải pháp**: Chọn file nhỏ hơn 10MB

#### D. **API không hoạt động**
```
API Error: Failed to fetch
```
**Giải pháp**: 
- Kiểm tra kết nối internet
- Kiểm tra URL API
- Kiểm tra CORS settings

#### E. **Authorization lỗi**
```
API Error: 401 Unauthorized
```
**Giải pháp**: 
- Kiểm tra token có hợp lệ không
- Kiểm tra token có hết hạn không
- Đăng nhập lại để lấy token mới

### 5. **Kiểm tra Component Registration**

#### A. **ImportDialog không được import**
```
[Vue warn]: Failed to resolve component: ImportDialog
```
**Giải pháp**: Kiểm tra import path trong AppointmentSlotsManagement.vue

#### B. **Component không được render**
```
[Vue warn]: Component ImportDialog is not registered
```
**Giải pháp**: Restart development server

### 6. **Kiểm tra Store và API**

#### A. **Store không hoạt động**
```
Error importing appointment slot: [object Object]
```
**Giải pháp**: Kiểm tra appointmentSlotsStore.importAppointmentSlot

#### B. **API service lỗi**
```
Error: Network Error
```
**Giải pháp**: Kiểm tra apiClient configuration

## 🛠️ Cách khắc phục

### 1. **Restart Development Server**
```bash
cd frontend
npm run dev
```

### 2. **Clear Browser Cache**
- Press `Ctrl + Shift + R` (hard refresh)
- Hoặc mở Developer Tools → Network → Disable cache

### 3. **Kiểm tra File Excel**
- Đảm bảo file có định dạng .xlsx hoặc .xls
- Đảm bảo file không bị corrupt
- Thử với file khác

### 4. **Kiểm tra Token**
- Đảm bảo token còn hợp lệ
- Kiểm tra format: `Bearer your-token-here`
- Đăng nhập lại nếu cần

### 5. **Kiểm tra Network**
- Đảm bảo kết nối internet ổn định
- Kiểm tra firewall/proxy settings
- Thử với network khác

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề, vui lòng cung cấp:

1. **Console logs** từ Developer Tools
2. **Network requests** từ Network tab
3. **File Excel** bạn đang sử dụng
4. **Browser và version** (Chrome, Firefox, Safari, etc.)
5. **Mô tả chi tiết** các bước đã thực hiện

## 🔧 Files liên quan

- `ImportDialog.vue` - Component chính
- `AppointmentSlotsManagement.vue` - Trang sử dụng component
- `appointment-slots.store.ts` - Store xử lý state
- `appointment-slots.service.ts` - API service
- `test-import-component.html` - File test
- `debug-import.html` - File debug API
