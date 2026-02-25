# Hướng Dẫn Upload File Danh Sách Sổ Tiết Kiệm

## 📁 Định Dạng File Hỗ Trợ

Ứng dụng hỗ trợ import danh sách sổ tiết kiệm từ 3 định dạng file:

### 1. **Excel (.xlsx, .xls)** - Khuyến nghị ⭐
- Dễ sử dụng và chỉnh sửa
- Tải file mẫu từ ứng dụng
- Định dạng tự động

### 2. **CSV (.csv)**
- File văn bản thuần, dùng dấu phẩy phân cách
- Nhẹ, dễ tạo từ Excel (Save As > CSV)

### 3. **JSON (.json)**
- Cho người dùng nâng cao
- Format chuẩn của ứng dụng

---

## 📋 Cấu Trúc Dữ Liệu

### Các Cột Bắt Buộc (*)
| Tên Cột | Mô Tả | Ví Dụ |
|----------|-------|-------|
| **Tên** * | Tên hoặc ghi chú sổ TK | "Sổ TK Vietcombank 12 tháng" |
| **Ngân Hàng** * | Tên ngân hàng | "Vietcombank" |
| **Số Tiền** * | Số tiền gốc (VNĐ) | 100000000 |
| **Lãi Suất** * | Lãi suất %/năm | 5.0 |

### Các Cột Tùy Chọn
| Tên Cột | Mô Tả | Mặc Định | Ví Dụ |
|----------|-------|----------|--------|
| **Kỳ Hạn** | Số tháng gửi | 12 | 6, 12, 24 |
| **Ngày Gửi** | Ngày bắt đầu gửi | Hôm nay | 2026-01-01 hoặc 01/01/2026 |
| **Hình Thức Lãi** | Cách tính lãi | maturity | maturity, monthly, upfront |
| **Lãi Suất Không KH** | Lãi suất không kỳ hạn | 0.5 | 0.5 |
| **Số Tài Khoản** | Số sổ/số TK | (trống) | "1234567890" |
| **Ghi Chú** | Ghi chú thêm | (trống) | "Ưu đãi khách hàng VIP" |
| **Trạng Thái** | Trạng thái hiện tại | active | active, matured, withdrawn |

---

## 🔄 Tên Cột Linh Hoạt

Ứng dụng tự động nhận diện các tên cột khác nhau:

- **Tên**: `Tên`, `Ten`, `Name`, `Ghi Chú`
- **Ngân Hàng**: `Ngân Hàng`, `Ngan Hang`, `Bank`
- **Số Tiền**: `Số Tiền`, `So Tien`, `Tiền Gốc`, `Principal`, `Amount`
- **Lãi Suất**: `Lãi Suất`, `Lai Suat`, `Rate`, `Interest Rate`
- Và nhiều tên khác...

👉 **Không cần lo lắng về đúng tên cột, app sẽ tự map!**

---

## 📝 Cách Sử Dụng

### Bước 1: Tải File Mẫu
1. Vào **Cài Đặt** > **Quản Lý Dữ Liệu**
2. Nhấn **"Tải File Mẫu"**
3. File Excel mẫu sẽ được tải về

### Bước 2: Điền Dữ Liệu
1. Mở file Excel vừa tải
2. Xem 2 dòng ví dụ có sẵn
3. Xóa dòng ví dụ và điền dữ liệu thực của bạn
4. Lưu file

### Bước 3: Upload File
1. Vào **Cài Đặt** > **Quản Lý Dữ Liệu**
2. Nhấn **"Upload File Excel/CSV"**
3. Chọn file vừa tạo

### Bước 4: Xem Trước & Xác Nhận
1. Hệ thống hiển thị preview dữ liệu
2. Kiểm tra kỹ thông tin
3. Chọn chế độ:
   - **Thêm vào danh sách hiện có**: Giữ dữ liệu cũ, thêm mới
   - **Thay thế toàn bộ**: Xóa dữ liệu cũ, chỉ giữ dữ liệu import
4. Nhấn **"Xác Nhận Import"**

---

## ✅ Ví Dụ File Excel/CSV

### Excel:
```
| Tên                          | Ngân Hàng    | Số Tiền      | Lãi Suất | Kỳ Hạn | Ngày Gửi   |
|------------------------------|--------------|--------------|----------|--------|------------|
| Sổ TK Vietcombank 12 tháng   | Vietcombank  | 100000000    | 5.0      | 12     | 2026-01-01 |
| Sổ TK MB Bank 6 tháng        | MB Bank      | 50000000     | 5.2      | 6      | 2026-02-01 |
```

### CSV:
```csv
Tên,Ngân Hàng,Số Tiền,Lãi Suất,Kỳ Hạn,Ngày Gửi
Sổ TK Vietcombank 12 tháng,Vietcombank,100000000,5.0,12,2026-01-01
Sổ TK MB Bank 6 tháng,MB Bank,50000000,5.2,6,2026-02-01
```

---

## ⚠️ Lưu Ý Quan Trọng

### ✓ Nên làm:
- Tải file mẫu để có cấu trúc chuẩn
- Kiểm tra kỹ số tiền (không dấu chấm, phẩy)
- Định dạng ngày: `YYYY-MM-DD` hoặc `DD/MM/YYYY`
- Backup dữ liệu trước khi import (chọn **Xuất Dữ Liệu JSON**)

### ✗ Tránh làm:
- Để trống các cột bắt buộc (*)
- Nhập số tiền có dấu phẩy (100,000,000) ❌ → Dùng (100000000) ✓
- Nhập lãi suất có % (5.0% ❌) → Dùng (5.0) ✓
- Thay đổi tên sheet trong Excel (giữ nguyên)

---

## 🔧 Xử Lý Lỗi

### File không đọc được?
- Đảm bảo file đúng định dạng (.xlsx, .csv, .json)
- Kiểm tra file có bị corrupt hay không
- Thử mở file bằng Excel trước khi upload

### Không có dữ liệu nào được import?
- Kiểm tra các cột bắt buộc đã điền đầy đủ chưa
- Xem Console (F12) để biết dòng nào bị lỗi
- Đảm bảo số tiền và lãi suất là số hợp lệ

### Dữ liệu sai sau khi import?
- Xóa dữ liệu vừa import (Cài Đặt > Xóa Tất Cả)
- Restore từ file backup JSON
- Sửa lại file Excel và import lại

---

## 💡 Tips

1. **Import dần dần**: Thử với 2-3 sổ trước, kiểm tra OK rồi mới import hết
2. **Dùng Excel thay vì CSV**: Dễ chỉnh sửa và format hơn
3. **Backup thường xuyên**: Xuất JSON định kỳ để phòng mất dữ liệu
4. **Kiểm tra preview**: Luôn xem kỹ bảng preview trước khi xác nhận

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra lại file mẫu
2. Đảm bảo đúng định dạng
3. Xem lại hướng dẫn trên

**Chúc bạn sử dụng ứng dụng hiệu quả!** 🎉
