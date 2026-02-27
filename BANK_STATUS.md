# 🏦 Danh Sách Ngân Hàng & Trạng Thái Cập Nhật

## 📊 Tổng Quan

- **Tổng số ngân hàng**: 15
- **Hỗ trợ Auto-Update**: 9 ngân hàng ✅
- **Chỉ nhập thủ công**: 6 ngân hàng 📝

---

## ✅ NGÂN HÀNG HỖ TRỢ CẬP NHẬT TỰ ĐỘNG (9)

Các ngân hàng này có badge **🔄 Auto** trong bảng lãi suất:

1. ✅ **Vietcombank** - API chính thức
2. ✅ **VietinBank** - Website chính thức
3. ✅ **BIDV** - API chính thức
4. ✅ **Agribank** - Website chính thức
5. ✅ **MB Bank** - Website chính thức
6. ✅ **Techcombank** - Website chính thức
7. ✅ **ACB** - Website chính thức
8. ✅ **VPBank** - Website chính thức
9. ✅ **TPBank** - Website chính thức

### Cách cập nhật:
1. Khởi động server: `npm start`
2. Mở http://localhost:3000/index.html
3. Vào tab "Lãi Suất Ngân Hàng"
4. Nhấn nút **"Cập Nhật Tự Động"** (màu xanh lá)
5. Đợi vài giây → Hoàn tất! ✨

**Lưu ý:** 
- Parser có thể không hoạt động nếu website ngân hàng thay đổi cấu trúc
- Nếu parser fail, hệ thống sẽ dùng lãi suất mặc định (fallback)
- Kiểm tra console log để xem chi tiết quá trình scraping

---

## 📝 NGÂN HÀNG CHỈ NHẬP THỦ CÔNG (6)

Các ngân hàng này có badge **📝 Manual** trong bảng lãi suất:

1. 📝 **CEP - Tổ chức Tài chính Vi mô** - Không có API công khai
2. 📝 **Sacombank** - Chưa triển khai parser
3. 📝 **HDBank** - Chưa triển khai parser
4. 📝 **VIB** - Chưa triển khai parser
5. 📝 **SHB** - Chưa triển khai parser
6. 📝 **OCB** - Chưa triển khai parser

### Cách cập nhật:
1. Vào tab "Lãi Suất Ngân Hàng"
2. Nhấn nút **"Sửa Thủ Công"**
3. Nhập lãi suất cho từng kỳ hạn
4. Nhấn **"Lưu Thay Đổi"**

---

## 🎨 CÁCH PHÂN BIỆT TRONG GIAO DIỆN

### Bảng Lãi Suất:

| Icon/Badge | Ý nghĩa |
|-----------|---------|
| <span style="background:#d1fae5;color:#047857;padding:4px 10px;border-radius:15px;font-size:12px">🔄 Auto</span> | Hỗ trợ cập nhật tự động |
| <span style="background:#f3f4f6;color:#4b5563;padding:4px 10px;border-radius:15px;font-size:12px">📝 Manual</span> | Chỉ nhập thủ công |

- Các ngân hàng **Auto** sẽ có nền xanh nhạt trong bảng
- Các ngân hàng **Auto** được sắp xếp lên trên
- Các ngân hàng **Manual** được sắp xếp xuống dưới

---

## 🔍 KIỂM TRA NHANH

### Trong App:
1. Mở http://localhost:3000/index.html
2. Vào tab **"Lãi Suất Ngân Hàng"**
3. Xem badge bên cạnh tên ngân hàng:
   - 🔄 **Auto** = Có thể cập nhật tự động
   - 📝 **Manual** = Cần nhập thủ công

### Qua Code:
- Danh sách Auto-Update: Xem biến `AUTO_UPDATE_BANKS` trong **app.js** (dòng ~40)
- Cấu hình scraper: Xem object `BANK_CONFIGS` trong **scraper/bankScraper.js** (dòng ~14)

---

## ❓ FAQ

**Q: Tại sao có 15 ngân hàng nhưng chỉ 9 ngân hàng auto-update?**
> A: 6 ngân hàng còn lại chưa có parser hoặc không có API công khai. Bạn cần nhập lãi suất thủ công cho các ngân hàng này.

**Q: Làm sao biết ngân hàng nào đã được cập nhật tự động?**
> A: Xem badge 🔄 Auto bên cạnh tên ngân hàng trong bảng lãi suất. Ngân hàng có badge này là đã được cấu hình auto-update.

**Q: Tôi có thể thêm ngân hàng auto-update mới không?**
> A: Có! Xem hướng dẫn trong **README_SCRAPER.md** phần "Thêm Ngân Hàng Mới".

**Q: Khi nào nên dùng "Cập Nhật Tự Động" vs "Sửa Thủ Công"?**
> A: 
> - Dùng **Cập Nhật Tự Động**: Để cập nhật 9 ngân hàng có Auto nhanh chóng
> - Dùng **Sửa Thủ Công**: Để cập nhật 6 ngân hàng Manual hoặc điều chỉnh lãi suất cá biệt

---

📅 **Cập nhật lần cuối**: 27/02/2026
