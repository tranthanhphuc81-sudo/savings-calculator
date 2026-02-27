# 🤖 Hướng Dẫn Sử Dụng Tính Năng Cào Lãi Suất Tự Động

## 📋 Tổng Quan

Tính năng **Cào Lãi Suất Tự Động** cho phép bạn cập nhật lãi suất ngân hàng mới nhất từ website chính thức của các ngân hàng thay vì phải nhập thủ công.

### ✨ Tính Năng

- 🔄 **Cập nhật tự động**: Lấy lãi suất từ website ngân hàng
- 💾 **Lưu cache**: Tránh cào quá thường xuyên (cache 1 giờ)
- 🎯 **Hỗ trợ đa ngân hàng**: Vietcombank, VietinBank, BIDV, Agribank, MB Bank, Techcombank, ACB, VPBank, TPBank
- 📊 **API RESTful**: Backend API để lấy dữ liệu
- ⚡ **Nhanh chóng**: Cào song song nhiều ngân hàng cùng lúc

---

## 🚀 Cài Đặt & Khởi Động

### Bước 1: Cài Đặt Node.js

Đảm bảo bạn đã cài đặt **Node.js** (phiên bản 14 trở lên):
- Tải tại: https://nodejs.org/
- Kiểm tra: mở PowerShell và gõ `node --version`

### Bước 2: Cài Đặt Dependencies

Mở PowerShell trong thư mục dự án và chạy:

```powershell
npm install
```

Lệnh này sẽ cài đặt:
- `express` - Web server framework
- `axios` - HTTP client để gọi API
- `cheerio` - HTML parser để cào dữ liệu
- `cors` - Cho phép frontend gọi API

### Bước 3: Khởi Động Server

```powershell
npm start
```

Hoặc để tự động reload khi code thay đổi:

```powershell
npm run dev
```

Khi server khởi động thành công, bạn sẽ thấy:

```
╔════════════════════════════════════════════════╗
║   🏦 Bank Rates Scraper API Server           ║
║   Server running on http://localhost:3000    ║
╚════════════════════════════════════════════════╝
```

---

## 🎯 Cách Sử Dụng

### Trong Ứng Dụng Web

1. **Khởi động server** (xem bước 3 ở trên)
2. **Mở ứng dụng**: http://localhost:3000/index.html
3. **Vào trang "Lãi Suất Ngân Hàng"**
4. **Bấm nút "Cập Nhật Tự Động"** (màu xanh lá với icon 🔄)
5. **Chờ vài giây** - App sẽ cào lãi suất từ tất cả các ngân hàng
6. **Hoàn tất!** - Lãi suất mới sẽ được cập nhật vào bảng

### Qua API (Nâng Cao)

Bạn có thể gọi API trực tiếp:

#### Lấy tất cả lãi suất (cached)
```
GET http://localhost:3000/api/rates
```

#### Cào mới tất cả lãi suất
```
GET http://localhost:3000/api/rates/refresh
```

#### Lấy lãi suất 1 ngân hàng
```
GET http://localhost:3000/api/rates/Vietcombank
```

#### Danh sách ngân hàng hỗ trợ
```
GET http://localhost:3000/api/banks
```

---

## 🏦 Ngân Hàng Được Hỗ Trợ

### ✅ Hỗ Trợ Cập Nhật Tự Động (9 ngân hàng)

Các ngân hàng sau có thể cập nhật lãi suất tự động từ website/API chính thức:

| Ngân Hàng | Nguồn Dữ Liệu | Trạng Thái |
|-----------|----------------|------------|
| 🏦 **Vietcombank** | API chính thức | ✅ Hoàn chỉnh |
| 🏦 **VietinBank** | Website chính thức | ✅ Hoàn chỉnh |
| 🏦 **BIDV** | API chính thức | ✅ Hoàn chỉnh |
| 🏦 **Agribank** | Website chính thức | ✅ Hoàn chỉnh |
| 🏦 **MB Bank** | Website chính thức | ✅ Hoàn chỉnh |
| 🏦 **Techcombank** | Website chính thức | ✅ Hoàn chỉnh |
| 🏦 **ACB** | Website chính thức | ✅ Hoàn chỉnh |
| 🏦 **VPBank** | Website chính thức | ✅ Hoàn chỉnh |
| 🏦 **TPBank** | Website chính thức | ✅ Hoàn chỉnh |

**Cách thức hoạt động:**
- **Vietcombank**: Gọi API JSON trực tiếp → Parse response → Cache 1 giờ
- **BIDV**: Gọi API JSON/XML → Parse data structure → Fallback nếu fail
- **8 ngân hàng còn lại**: Scrape HTML từ website → Parse bảng lãi suất → Validate data

**Lưu ý:**
- Parser HTML có thể fail nếu website thay đổi cấu trúc
- Nếu scraping fail → Hệ thống tự động dùng lãi suất mặc định (fallback)
- Cache 1 giờ để tránh spam requests đến website ngân hàng
- Check server console để xem log chi tiết quá trình scraping

### 📝 Chỉ Nhập Thủ Công (6 ngân hàng)

Các ngân hàng sau chưa hỗ trợ cập nhật tự động, cần nhập lãi suất thủ công:

| Ngân Hàng | Lý Do |
|-----------|-------|
| 🏢 **CEP - Tổ chức Tài chính Vi mô** | Không có API/website công khai |
| 🏦 **Sacombank** | Chưa triển khai parser |
| 🏦 **HDBank** | Chưa triển khai parser |
| 🏦 **VIB** | Chưa triển khai parser |
| 🏦 **SHB** | Chưa triển khai parser |
| 🏦 **OCB** | Chưa triển khai parser |

> 💡 **Mẹo**: Trong bảng lãi suất, ngân hàng có badge <span style="background:#d1fae5;color:#047857;padding:2px 8px;border-radius:9999px;font-size:0.75rem">🔄 Auto</span> là hỗ trợ cập nhật tự động, badge <span style="background:#f3f4f6;color:#4b5563;padding:2px 8px;border-radius:9999px;font-size:0.75rem">📝 Manual</span> là chỉ nhập thủ công.

---

## 🛠️ Cấu Trúc Dự Án

```
tietkiemcokyhan-auto/
├── index.html              # Frontend UI
├── app.js                  # Frontend JavaScript
├── style.css               # Styles
├── server.js               # Backend API server
├── package.json            # Node.js dependencies
├── scraper/
│   └── bankScraper.js      # Module cào lãi suất
└── README_SCRAPER.md       # File này
```

---

## 🔧 Kỹ Thuật

### Cơ Chế Hoạt Động

1. **Frontend** gọi API endpoint `/api/rates/refresh`
2. **Backend** nhận request và gọi module `bankScraper`
3. **Scraper** cào song song từ tất cả các website ngân hàng
4. **Parser** phân tích dữ liệu (HTML hoặc JSON)
5. **Cache** lưu kết quả (1 giờ) để tránh cào quá thường xuyên
6. **Response** trả về JSON cho frontend
7. **Frontend** cập nhật `bankRates` và hiển thị

### Flow Diagram

```
[Website Ngân Hàng] 
      ⬇️ HTTP Request
[Bank Scraper Module]
      ⬇️ Parse Data
[API Server (Express)]
      ⬇️ JSON Response
[Frontend (app.js)]
      ⬇️ Update State
[UI (Bảng Lãi Suất)]
```

---

## ❓ Xử Lý Sự Cố

### Server không khởi động được

**Lỗi**: `Cannot find module 'express'`

**Giải pháp**: Chạy `npm install`

---

### Nút "Cập Nhật Tự Động" báo lỗi

**Lỗi**: `API server không phản hồi`

**Giải pháp**: 
1. Đảm bảo server đang chạy (`npm start`)
2. Kiểm tra xem cổng 3000 có bị chiếm không
3. Thử truy cập http://localhost:3000/api/health

---

### Lãi suất không đúng

**Nguyên nhân**: Website ngân hàng thay đổi cấu trúc

**Giải pháp**: 
1. Kiểm tra log trong PowerShell server
2. Cập nhật parser trong `scraper/bankScraper.js`
3. Hoặc sử dụng chức năng "Sửa Thủ Công"

---

### CORS Error

**Lỗi**: `Access to fetch blocked by CORS policy`

**Giải pháp**: Server đã bật CORS, nhưng đảm bảo:
- Truy cập app qua `http://localhost:3000/index.html` (không mở file trực tiếp)
- Hoặc chạy từ server

---

## 🔐 Bảo Mật & Lưu Ý

- ⚠️ **Website thay đổi**: Ngân hàng có thể thay đổi cấu trúc website → parser cần cập nhật
- 🔒 **Không lưu thông tin cá nhân**: Server chỉ cào dữ liệu công khai (lãi suất)
- ⏱️ **Giới hạn tần suất**: Cache 1 giờ để tránh spam request
- 📊 **Dữ liệu tham khảo**: Luôn kiểm tra lại với ngân hàng trước khi gửi tiền

---

## 🚀 Mở Rộng Tính Năng

### Thêm Ngân Hàng Mới

1. Mở `scraper/bankScraper.js`
2. Thêm config vào `BANK_CONFIGS`:
```javascript
'Tên Ngân Hàng': {
  url: 'https://website.com/lai-suat',
  method: 'scrape', // hoặc 'api'
  parser: parseMyBank
}
```
3. Tạo hàm parser:
```javascript
function parseMyBank($) {
  // Phân tích HTML/JSON
  return { 0: 0.1, 1: 2.5, 3: 3.0, ... };
}
```

### Tự Động Cập Nhật Định Kỳ

Thêm vào `server.js`:
```javascript
// Tự động cập nhật mỗi 6 giờ
setInterval(async () => {
  await bankScraper.refreshAllBankRates();
}, 6 * 60 * 60 * 1000);
```

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra log trong PowerShell server
2. Kiểm tra Console trong trình duyệt (F12)
3. Đọc phần "Xử Lý Sự Cố" ở trên

---

## 📝 Changelog

### Version 1.0.0 (2026-02-25)
- ✅ Tích hợp backend API server
- ✅ Module cào lãi suất ngân hàng
- ✅ Hỗ trợ Vietcombank (API chính thức)
- ✅ Nút "Cập Nhật Tự Động" trong UI
- ✅ Cache 1 giờ
- ✅ Hiển thị trạng thái cập nhật

### Kế Hoạch Tiếp Theo
- 🔧 Hoàn thiện parser cho 9 ngân hàng còn lại
- 🔧 Tự động cập nhật định kỳ
- 🔧 Thông báo khi có lãi suất mới
- 🔧 Lịch sử thay đổi lãi suất

---

**Chúc bạn sử dụng hiệu quả! 🎉**
