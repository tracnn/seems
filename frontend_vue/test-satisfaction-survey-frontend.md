# Test Satisfaction Survey Frontend

## ✅ Lỗi đã sửa:
- **Lỗi v-model trên prop**: Đã sửa `v-model:visible="visible"` thành `:visible="visible"` và `@update:visible="$emit('update:visible', $event)"` trong SatisfactionSurveyDialog.vue

## 🧪 Cách test chức năng:

### 1. Truy cập trang
```
URL: http://localhost:3000/#/backend/satisfaction-survey
```

### 2. Test các tính năng:

#### ✅ Lọc theo ngày
- Chọn "Từ ngày": 2025-09-11
- Chọn "Đến ngày": 2025-09-11
- Nhấn "Lọc"
- **Kết quả mong đợi**: Hiển thị các surveys trong ngày 2025-09-11

#### ✅ Lọc theo trạng thái
- Chọn "Trạng thái": PENDING
- Nhấn "Lọc"
- **Kết quả mong đợi**: Chỉ hiển thị surveys có trạng thái PENDING

#### ✅ Tìm kiếm
- Nhập từ khóa vào ô "Tìm kiếm..."
- **Kết quả mong đợi**: Lọc theo tên bệnh nhân hoặc mã bệnh nhân

#### ✅ Phân trang
- Thay đổi số bản ghi mỗi trang (5, 10, 20, 50)
- Nhấn các nút phân trang
- **Kết quả mong đợi**: Hiển thị đúng số bản ghi và trang

#### ✅ Chỉnh sửa survey
- Nhấn nút "Chỉnh sửa" (biểu tượng bút chì)
- **Kết quả mong đợi**: Mở dialog với thông tin survey
- Thay đổi điểm đánh giá, bình luận, trạng thái
- Nhấn "Lưu"
- **Kết quả mong đợi**: Cập nhật thành công và đóng dialog

#### ✅ Xóa survey
- Nhấn nút "Xóa" (biểu tượng thùng rác)
- **Kết quả mong đợi**: Hiển thị dialog xác nhận
- Nhấn "OK" để xác nhận
- **Kết quả mong đợi**: Xóa survey và cập nhật danh sách

## 📊 Dữ liệu test:
- **Total surveys**: 46
- **Page**: 1/5
- **Sample data**: Surveys từ ngày 2025-09-11 với đầy đủ thông tin user

## 🔧 Troubleshooting:

### Nếu gặp lỗi:
1. **Lỗi v-model**: Đã sửa trong SatisfactionSurveyDialog.vue
2. **Lỗi API**: Kiểm tra backend có chạy trên port 7111
3. **Lỗi authentication**: Đảm bảo đã đăng nhập với token hợp lệ

### Logs để kiểm tra:
- Browser Console: F12 → Console
- Network tab: Kiểm tra API calls
- Vue DevTools: Kiểm tra component state

## ✅ Kết quả mong đợi:
- Trang load thành công không có lỗi
- Hiển thị danh sách 10 surveys đầu tiên
- Các tính năng lọc, tìm kiếm, phân trang hoạt động
- Dialog chỉnh sửa mở/đóng đúng cách
- Toast notifications hiển thị khi thao tác thành công/lỗi
