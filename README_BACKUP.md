# 🛡️ Hệ Thống Bảo Vệ & Backup Dữ Liệu

## 📋 Tổng Quan

Ứng dụng CEP SavingsTrack đã được tích hợp **hệ thống bảo vệ dữ liệu tự động** để đảm bảo dữ liệu của bạn luôn an toàn.

---

## ✨ Các Tính Năng Bảo Vệ Dữ Liệu

### 1. 🔄 Auto-Backup Tự Động
- **Tự động tạo backup** sau mỗi 5 lần thay đổi dữ liệu
- Lưu trữ tối đa **5 phiên bản backup** gần nhất trong localStorage
- Mỗi backup bao gồm:
  - Toàn bộ danh sách sổ tiết kiệm
  - Lãi suất ngân hàng
  - Cài đặt cá nhân
  - Timestamp (thời gian tạo)

### 2. 🔧 Khôi Phục Tự Động
- **Tự động phát hiện** dữ liệu bị lỗi hoặc corrupt
- **Tự động khôi phục** từ backup gần nhất
- Hiển thị thông báo khi khôi phục thành công
- Không cần thao tác thủ công

### 3. ⏰ Nhắc Nhở Backup Định Kỳ
- Hiển thị banner nhắc nhở sau **7 ngày** chưa export dữ liệu
- Nút **"Export Ngay"** để xuất file backup nhanh
- Có thể hoãn lại nếu chưa muốn backup
- Giúp bạn không quên tạo bản sao lưu ngoài trình duyệt

### 4. 💾 Export/Import Thủ Công
- **Export dữ liệu** ra file JSON
- **Import dữ liệu** từ file JSON đã lưu
- File backup có format: `savings-backup-YYYYMMDD-HHmmss.json`
- Hỗ trợ merge hoặc replace dữ liệu khi import

---

## 🎯 Cách Sử Dụng

### 📊 Xem Trạng Thái Backup

1. Vào **Cài Đặt** (Settings) từ menu bên trái
2. Tìm mục **"Backup & Bảo Vệ Dữ Liệu"**
3. Xem thông tin:
   - Số lượng auto-backup hiện có
   - Thời gian backup gần nhất
   - Thời gian export cuối cùng

### 💾 Export Dữ Liệu (Khuyến Nghị)

1. Vào **Cài Đặt** → **Quản Lý Dữ Liệu**
2. Nhấn **"Xuất Dữ Liệu JSON"**
3. File sẽ được tải về máy tính
4. **Lưu ý:** Nên export định kỳ và lưu ở nơi an toàn (Google Drive, OneDrive, USB...)

### 🔄 Khôi Phục Từ Auto-Backup

1. Vào **Cài Đặt** → **Backup & Bảo Vệ Dữ Liệu**
2. Xem danh sách **Auto-Backup**
3. Chọn phiên bản muốn khôi phục
4. Nhấn nút **"Khôi phục"**
5. Xác nhận (dữ liệu hiện tại sẽ bị ghi đè)

### 📥 Import Dữ Liệu Từ File

1. Vào **Cài Đặt** → **Quản Lý Dữ Liệu**
2. Nhấn **"Nhập Dữ Liệu JSON"**
3. Chọn file JSON đã export trước đó
4. Chọn chế độ:
   - **Replace:** Thay thế toàn bộ dữ liệu
   - **Merge:** Gộp với dữ liệu hiện tại

---

## ⚠️ Lưu Ý Quan Trọng

### 🔴 Hạn Chế của localStorage
- **Dữ liệu lưu trong trình duyệt** - có thể mất nếu:
  - Xóa dữ liệu duyệt web
  - Cài đặt lại trình duyệt
  - Chuyển sang máy tính khác
  - Trình duyệt gặp lỗi nghiêm trọng

### ✅ Biện Pháp Phòng Ngừa
1. **Export định kỳ** (khuyến nghị mỗi tuần)
2. **Lưu file backup** ở nhiều nơi:
   - Máy tính/laptop
   - USB/ổ cứng ngoài
   - Cloud storage (Google Drive, OneDrive, Dropbox)
   - Email cho chính mình
3. **Kiểm tra auto-backup** thường xuyên trong Cài Đặt
4. **Không bỏ qua** banner nhắc nhở backup

---

## 🔧 Cấu Hình Backup (Tùy Chỉnh)

Nếu muốn thay đổi cấu hình, sửa trong code `app.js`:

```javascript
const BACKUP_CONFIG = {
  maxBackups: 5,           // Số phiên bản backup tối đa (mặc định: 5)
  backupInterval: 5,       // Auto-backup sau N lần thay đổi (mặc định: 5)
  reminderDays: 7,         // Nhắc backup sau N ngày (mặc định: 7)
};
```

---

## 📱 Câu Hỏi Thường Gặp (FAQ)

### ❓ Auto-backup có thay thế việc export thủ công không?
**Không.** Auto-backup chỉ lưu trong trình duyệt. Bạn vẫn cần export ra file để có bản backup **ngoài trình duyệt**.

### ❓ Tôi có thể tắt auto-backup không?
Không khuyến nghị. Auto-backup không tốn nhiều dung lượng và là lớp bảo vệ quan trọng.

### ❓ Backup có bị mất khi đóng trình duyệt không?
**Không.** Backup lưu trong localStorage - vẫn giữ nguyên khi đóng/mở lại trình duyệt.

### ❓ Tôi có thể chuyển dữ liệu sang máy khác không?
**Có.** Export dữ liệu ra file JSON, chuyển file qua máy mới, rồi Import vào.

### ❓ Backup có mã hóa không?
**Không.** Dữ liệu lưu dạng JSON plain text. Nếu cần bảo mật, hãy mã hóa file backup.

---

## 🚨 Kịch Bản Khẩn Cấp

### Trường hợp 1: Dữ liệu bị lỗi
➡️ **Hệ thống tự động khôi phục** từ backup gần nhất

### Trường hợp 2: Xóa nhầm dữ liệu
1. Vào **Cài Đặt** → **Backup & Bảo Vệ Dữ Liệu**
2. Chọn backup trước khi xóa
3. Nhấn **"Khôi phục"**

### Trường hợp 3: Mất toàn bộ dữ liệu trình duyệt
1. Tìm file backup đã export trước đó
2. Vào **Cài Đặt** → **Nhập Dữ Liệu JSON**
3. Chọn file và import

### Trường hợp 4: Không có file backup nào
➡️ **Dữ liệu không thể khôi phục.** Hãy luôn export định kỳ!

---

## 📈 Best Practices (Thực Hành Tốt)

✅ **Export dữ liệu** mỗi tuần/tháng  
✅ **Lưu backup** ở ≥3 nơi khác nhau  
✅ **Kiểm tra backup** hoạt động bình thường  
✅ **Đặt tên file** rõ ràng (ví dụ: `savings-backup-2026-02-25.json`)  
✅ **Test khôi phục** thỉnh thoảng để đảm bảo hoạt động  
✅ **Không ignore** banner nhắc nhở backup  

---

## 🎓 Kết Luận

Hệ thống backup của CEP SavingsTrack cung cấp **nhiều lớp bảo vệ**:

1. 🔄 **Auto-backup** - Tự động trong trình duyệt
2. 🔧 **Auto-recovery** - Tự động khôi phục khi lỗi
3. 💾 **Manual export** - Sao lưu ra file thủ công
4. ⏰ **Reminders** - Nhắc nhở định kỳ

Nhưng **quan trọng nhất** vẫn là **thói quen export định kỳ** của bạn!

---

**⚠️ Khuyến Nghị Cuối Cùng:**  
**Export dữ liệu NGAY BÂY GIỜ nếu bạn chưa làm!**

---

*Phát triển bởi CEP SavingsTrack Team*  
*Version: 1.0.0 - CEP Edition*
