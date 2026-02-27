// =====================================================
// BANK RATES SCRAPER API SERVER
// =====================================================

const express = require('express');
const cors = require('cors');
const bankScraper = require('./scraper/bankScraper');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve frontend files

// ===== API ENDPOINTS =====

// GET /api/rates - Lấy tất cả lãi suất ngân hàng (cached)
app.get('/api/rates', async (req, res) => {
  try {
    const rates = await bankScraper.getAllBankRates();
    res.json({
      success: true,
      data: rates,
      timestamp: new Date().toISOString(),
      message: 'Lấy lãi suất thành công'
    });
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi lấy lãi suất'
    });
  }
});

// GET /api/rates/refresh - Cào mới tất cả lãi suất
app.get('/api/rates/refresh', async (req, res) => {
  try {
    const rates = await bankScraper.refreshAllBankRates();
    res.json({
      success: true,
      data: rates,
      timestamp: new Date().toISOString(),
      message: 'Cập nhật lãi suất thành công',
      updated: Object.keys(rates).length
    });
  } catch (error) {
    console.error('Error refreshing rates:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi cập nhật lãi suất'
    });
  }
});

// GET /api/rates/:bankCode - Lấy lãi suất của 1 ngân hàng cụ thể
app.get('/api/rates/:bankCode', async (req, res) => {
  try {
    const { bankCode } = req.params;
    const rates = await bankScraper.getBankRate(bankCode);
    
    if (!rates) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ngân hàng'
      });
    }
    
    res.json({
      success: true,
      data: { [bankCode]: rates },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching bank rate:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/banks - Danh sách ngân hàng hỗ trợ
app.get('/api/banks', (req, res) => {
  const banks = bankScraper.getSupportedBanks();
  res.json({
    success: true,
    data: banks,
    count: banks.length
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Bank Rates API is running',
    timestamp: new Date().toISOString()
  });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════╗
  ║   🏦 Bank Rates Scraper API Server           ║
  ║   Server running on http://localhost:${PORT}   ║
  ╚════════════════════════════════════════════════╝
  
  📡 Available endpoints:
  ➜ GET  /api/rates          - Lấy tất cả lãi suất (cached)
  ➜ GET  /api/rates/refresh  - Cào mới tất cả lãi suất
  ➜ GET  /api/rates/:bank    - Lấy lãi suất 1 ngân hàng
  ➜ GET  /api/banks          - Danh sách ngân hàng
  ➜ GET  /api/health         - Health check
  
  🌐 Frontend: http://localhost:${PORT}/index.html
  `);
});

module.exports = app;
