# CEP SavingsTrack - Ứng Dụng Quản Lý Tiết Kiệm

## 🎯 Giới Thiệu

**CEP SavingsTrack** là ứng dụng web toàn diện giúp bạn quản lý các sổ tiết kiệm, theo dõi lãi suất, và tối ưu hóa lợi nhuận từ tiết kiệm ngân hàng.

### ✨ Tính Năng Chính

- 📊 **Tổng Quan Tài Chính**: Dashboard với biểu đồ và thống kê chi tiết
- 📖 **Quản Lý Sổ Tiết Kiệm**: Thêm, sửa, xóa và theo dõi tiến độ
- 🔄 **Cập Nhật Lãi Suất Tự Động**: Tự động lấy lãi suất từ 9 ngân hàng
- 🧮 **Máy Tính Lãi Suất**: Tính toán chi tiết lãi suất và rút sớm
- 💡 **Tư Vấn Sản Phẩm**: AI gợi ý sản phẩm phù hợp với nhu cầu
- 📈 **So Sánh Lãi Suất**: Bảng so sánh và biểu đồ 15+ ngân hàng
- 🔔 **Cảnh Báo Thông Minh**: Nhắc nhở đáo hạn và nhận lãi định kỳ
- 💾 **Backup Tự Động**: Auto-backup và khôi phục dữ liệu an toàn
- 📱 **Responsive**: Hoạt động mượt mà trên mọi thiết bị

---

## 🚀 Cài Đặt & Chạy

### Yêu Cầu

- **Node.js** >= 14.x
- **npm** hoặc **yarn**

### Các Bước

```bash
# 1. Clone repository
git clone https://github.com/tranthanhphuc81-sudo/savings-calculator.git
cd savings-calculator

# 2. Cài đặt dependencies
npm install

# 3. Khởi động server
npm start

# 4. Mở trình duyệt
http://localhost:3000/index.html
```

### Development Mode (Auto-reload)

```bash
npm run dev
```

---

## 🏦 Ngân Hàng Hỗ Trợ Auto-Update

| Ngân Hàng | Trạng Thái | Phương Pháp |
|-----------|------------|--------------|
| ✅ Vietcombank | Hoàn chỉnh | API JSON |
| ✅ VietinBank | Hoàn chỉnh | HTML Scraping |
| ✅ BIDV | Hoàn chỉnh | API JSON/XML |
| ✅ Agribank | Hoàn chỉnh | HTML Scraping |
| ✅ MB Bank | Hoàn chỉnh | HTML Scraping |
| ✅ Techcombank | Hoàn chỉnh | HTML Scraping |
| ✅ ACB | Hoàn chỉnh | HTML Scraping |
| ✅ VPBank | Hoàn chỉnh | HTML Scraping |
| ✅ TPBank | Hoàn chỉnh | HTML Scraping |

**Lưu ý**: Parser HTML có thể cần cập nhật nếu website ngân hàng thay đổi cấu trúc.

---

## 📁 Cấu Trúc Dự Án

```
savings-calculator/
├── index.html              # Frontend UI
├── app.js                  # Frontend JavaScript
├── style.css               # Styles
├── server.js               # Backend API Server
├── scraper/
│   └── bankScraper.js      # Bank rate scraping logic
├── package.json            # Dependencies
├── vercel.json             # Vercel deployment config
├── README.md               # Documentation (this file)
├── README_SCRAPER.md       # Scraper documentation
├── BANK_STATUS.md          # Bank status reference
└── QUICKSTART.md           # Quick start guide
```

---

## 🌐 Deploy lên Vercel

### Option 1: Vercel CLI

```bash
# Cài Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 2: Vercel Dashboard

1. Truy cập https://vercel.com
2. Click "New Project"
3. Import repository từ GitHub
4. Deploy tự động!

---

## 📖 API Endpoints

### GET `/api/rates`
Lấy tất cả lãi suất ngân hàng (cached 1 giờ)

**Response:**
```json
{
  "success": true,
  "data": {
    "Vietcombank": { "0": 0.1, "1": 2.0, "3": 2.9, ... },
    "VietinBank": { ... },
    ...
  },
  "timestamp": "2026-02-27T12:00:00.000Z"
}
```

### GET `/api/rates/refresh`
Cào mới tất cả lãi suất ngân hàng

### GET `/api/rates/:bankName`
Lấy lãi suất của 1 ngân hàng cụ thể

### GET `/api/banks`
Danh sách ngân hàng hỗ trợ

### GET `/api/health`
Health check

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **HTML5**, **CSS3** (Tailwind CDN)
- **JavaScript** (ES6+)
- **Chart.js** - Visualizations
- **Day.js** - Date handling
- **SheetJS** - Excel export

### Backend
- **Node.js** + **Express.js**
- **Axios** - HTTP requests
- **Cheerio** - HTML parsing
- **CORS** - API access

---

## 💾 Dữ Liệu & Bảo Mật

- **LocalStorage**: Dữ liệu lưu hoàn toàn trên trình duyệt
- **Auto-backup**: Tự động backup sau mỗi 5 lần thay đổi
- **Export/Import**: Xuất ra file JSON để backup thủ công
- **Riêng tư 100%**: Không có server lưu trữ dữ liệu cá nhân

---

## 📝 License

MIT License - Miễn phí sử dụng cho mục đích cá nhân và thương mại.

---

## 👨‍💻 Tác Giả

**Phuc Tran**
- GitHub: [@tranthanhphuc81-sudo](https://github.com/tranthanhphuc81-sudo)
- Repository: https://github.com/tranthanhphuc81-sudo/savings-calculator

---

## 📞 Hỗ Trợ

- **Issues**: https://github.com/tranthanhphuc81-sudo/savings-calculator/issues
- **Documentation**: Xem các file `README_*.md` trong repository

---

## 🙏 Đóng Góp

Pull requests luôn được chào đón! Để đóng góp:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## ⚠️ Disclaimer

Lãi suất được lấy từ website chính thức của các ngân hàng có thể không chính xác 100% do:
- Website thay đổi cấu trúc
- Lãi suất có thể khác nhau theo khu vực và điều kiện cụ thể
- Vui lòng liên hệ trực tiếp ngân hàng để xác nhận lãi suất chính xác

---

**Happy Saving! 💰**
