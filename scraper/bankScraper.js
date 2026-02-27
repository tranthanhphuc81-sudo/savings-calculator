// =====================================================
// BANK SCRAPER MODULE - Main Entry Point
// =====================================================

const axios = require('axios');
const cheerio = require('cheerio');

// Cache để tránh cào quá thường xuyên
let ratesCache = null;
let lastUpdateTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// ===== BANK CONFIGURATIONS =====
const BANK_CONFIGS = {
  'Vietcombank': {
    url: 'https://portal.vietcombank.com.vn/he-thong/api/productRate/getPersonalRate?lang=vi',
    method: 'api',
    parser: parseVietcombank
  },
  'VietinBank': {
    url: 'https://www.vietinbank.vn/web/home/vn/个人/tiết-kiệm/lãi-suất',
    method: 'scrape',
    parser: parseVietinBank
  },
  'BIDV': {
    url: 'https://www.bidv.com.vn/ServiceContent/Content.aspx?acid=GETDEPORATE',
    method: 'api',
    parser: parseBIDV
  },
  'Agribank': {
    url: 'https://agribank.com.vn/vn/lai-suat',
    method: 'scrape',
    parser: parseAgribank
  },
  'MB Bank': {
    url: 'https://www.mbbank.com.vn/lai-suat',
    method: 'scrape',
    parser: parseMBBank
  },
  'Techcombank': {
    url: 'https://www.techcombank.com.vn/vi-vn/ca-nhan/tiet-kiem/lai-suat',
    method: 'scrape',
    parser: parseTechcombank
  },
  'ACB': {
    url: 'https://acb.com.vn/wps/portal/acb/vi/personal/rates/deposit-rates',
    method: 'scrape',
    parser: parseACB
  },
  'VPBank': {
    url: 'https://www.vpbank.com.vn/ca-nhan/tiet-kiem/lai-suat-tiet-kiem',
    method: 'scrape',
    parser: parseVPBank
  },
  'TPBank': {
    url: 'https://tpb.vn/ca-nhan/tiet-kiem/lai-suat-tiet-kiem',
    method: 'scrape',
    parser: parseTPBank
  }
};

// ===== DEFAULT FALLBACK RATES =====
const DEFAULT_RATES = {
  'CEP - Tổ chức Tài chính Vi mô': { 0: 0.50, 1: 3.90, 2: 3.90, 3: 4.00, 6: 5.40, 9: 5.40, 12: 5.80, 18: 5.70, 24: 5.70, 36: 5.70 },
  'Vietcombank': { 0: 0.10, 1: 2.0, 2: 2.3, 3: 2.9, 6: 4.6, 9: 4.8, 12: 5.0, 18: 5.2, 24: 5.4, 36: 5.5 },
  'VietinBank': { 0: 0.10, 1: 2.0, 2: 2.3, 3: 3.0, 6: 4.7, 9: 4.9, 12: 5.1, 18: 5.3, 24: 5.5, 36: 5.6 },
  'BIDV': { 0: 0.10, 1: 2.0, 2: 2.3, 3: 3.0, 6: 4.7, 9: 4.9, 12: 5.2, 18: 5.4, 24: 5.6, 36: 5.7 },
  'Agribank': { 0: 0.10, 1: 2.0, 2: 2.3, 3: 3.0, 6: 4.8, 9: 5.0, 12: 5.3, 18: 5.5, 24: 5.7, 36: 5.8 },
  'MB Bank': { 0: 0.20, 1: 3.5, 2: 3.7, 3: 4.0, 6: 5.2, 9: 5.4, 12: 5.7, 18: 5.9, 24: 6.1, 36: 6.2 },
  'Techcombank': { 0: 0.10, 1: 3.2, 2: 3.4, 3: 3.8, 6: 5.0, 9: 5.2, 12: 5.5, 18: 5.7, 24: 5.9, 36: 6.0 },
  'ACB': { 0: 0.10, 1: 3.3, 2: 3.5, 3: 3.9, 6: 5.1, 9: 5.3, 12: 5.6, 18: 5.8, 24: 6.0, 36: 6.1 },
  'VPBank': { 0: 0.20, 1: 3.4, 2: 3.6, 3: 4.0, 6: 5.3, 9: 5.5, 12: 5.8, 18: 6.0, 24: 6.2, 36: 6.3 },
  'TPBank': { 0: 0.20, 1: 3.5, 2: 3.7, 3: 4.1, 6: 5.4, 9: 5.6, 12: 5.9, 18: 6.1, 24: 6.3, 36: 6.4 }
};

// ===== MAIN FUNCTIONS =====

/**
 * Lấy tất cả lãi suất ngân hàng (sử dụng cache nếu còn hạn)
 */
async function getAllBankRates() {
  // Kiểm tra cache
  if (ratesCache && lastUpdateTime && (Date.now() - lastUpdateTime) < CACHE_DURATION) {
    console.log('📦 Using cached rates');
    return ratesCache;
  }
  
  // Refresh nếu cache hết hạn
  return await refreshAllBankRates();
}

/**
 * Cào mới tất cả lãi suất ngân hàng
 */
async function refreshAllBankRates() {
  console.log('🔄 Refreshing all bank rates...');
  const allRates = { ...DEFAULT_RATES }; // Bắt đầu với default
  
  // Cào song song tất cả các ngân hàng
  const scrapePromises = Object.entries(BANK_CONFIGS).map(async ([bankName, config]) => {
    try {
      console.log(`  ↻ Scraping ${bankName}...`);
      const rates = await scrapeBankRate(config);
      if (rates) {
        allRates[bankName] = rates;
        console.log(`  ✓ ${bankName} - Success`);
      } else {
        console.log(`  ⚠ ${bankName} - Using default`);
      }
    } catch (error) {
      console.error(`  ✗ ${bankName} - Error:`, error.message);
    }
  });
  
  await Promise.allSettled(scrapePromises);
  
  // Cập nhật cache
  ratesCache = allRates;
  lastUpdateTime = Date.now();
  
  console.log('✓ Refresh completed!');
  return allRates;
}

/**
 * Lấy lãi suất của 1 ngân hàng cụ thể
 */
async function getBankRate(bankCode) {
  const config = BANK_CONFIGS[bankCode];
  if (!config) {
    return DEFAULT_RATES[bankCode] || null;
  }
  
  try {
    const rates = await scrapeBankRate(config);
    return rates || DEFAULT_RATES[bankCode];
  } catch (error) {
    console.error(`Error scraping ${bankCode}:`, error);
    return DEFAULT_RATES[bankCode];
  }
}

/**
 * Danh sách ngân hàng được hỗ trợ
 */
function getSupportedBanks() {
  return Object.keys(BANK_CONFIGS);
}

// ===== SCRAPING FUNCTIONS =====

/**
 * Cào lãi suất từ một ngân hàng
 */
async function scrapeBankRate(config) {
  try {
    const response = await axios.get(config.url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (config.method === 'api') {
      return config.parser(response.data);
    } else {
      const $ = cheerio.load(response.data);
      return config.parser($);
    }
  } catch (error) {
    console.error('Scraping error:', error.message);
    return null;
  }
}

// ===== BANK-SPECIFIC PARSERS =====

function parseVietcombank(data) {
  // Vietcombank có API JSON
  try {
    const rates = { 0: 0.10, 1: 0, 2: 0, 3: 0, 6: 0, 9: 0, 12: 0, 18: 0, 24: 0, 36: 0 };
    
    if (data && data.data) {
      data.data.forEach(item => {
        const term = parseInt(item.term);
        const rate = parseFloat(item.rate);
        if (term === 1) rates[1] = rate;
        else if (term === 3) rates[3] = rate;
        else if (term === 6) rates[6] = rate;
        else if (term === 9) rates[9] = rate;
        else if (term === 12) rates[12] = rate;
        else if (term === 18) rates[18] = rate;
        else if (term === 24) rates[24] = rate;
        else if (term === 36) rates[36] = rate;
      });
      
      // Điền các kỳ hạn còn thiếu
      rates[2] = rates[1] + 0.3;
      
      return rates;
    }
  } catch (error) {
    console.error('Vietcombank parsing error:', error);
  }
  return null;
}

function parseVietinBank($) {
  try {
    const rates = { 0: 0.10, 1: 0, 2: 0, 3: 0, 6: 0, 9: 0, 12: 0, 18: 0, 24: 0, 36: 0 };
    
    // VietinBank thường có bảng lãi suất trong table
    // Tìm table chứa thông tin lãi suất tiết kiệm
    const tables = $('table');
    
    tables.each((i, table) => {
      const $table = $(table);
      const rows = $table.find('tr');
      
      rows.each((j, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length >= 2) {
          const termText = $(cells[0]).text().trim().toLowerCase();
          const rateText = $(cells[1]).text().trim();
          
          // Parse term (tháng)
          let term = 0;
          if (termText.includes('1') && termText.includes('tháng') && !termText.includes('12')) term = 1;
          else if (termText.includes('2') && termText.includes('tháng')) term = 2;
          else if (termText.includes('3') && termText.includes('tháng')) term = 3;
          else if (termText.includes('6') && termText.includes('tháng')) term = 6;
          else if (termText.includes('9') && termText.includes('tháng')) term = 9;
          else if (termText.includes('12') && termText.includes('tháng')) term = 12;
          else if (termText.includes('18') && termText.includes('tháng')) term = 18;
          else if (termText.includes('24') && termText.includes('tháng')) term = 24;
          else if (termText.includes('36') && termText.includes('tháng')) term = 36;
          
          // Parse rate
          const rateMatch = rateText.match(/([0-9]+[.,][0-9]+)/);
          if (rateMatch && term > 0) {
            const rate = parseFloat(rateMatch[1].replace(',', '.'));
            if (rate > 0 && rate < 20) { // Sanity check
              rates[term] = rate;
            }
          }
        }
      });
    });
    
    // Nếu parse được ít nhất 3 kỳ hạn thì return
    const validRates = Object.values(rates).filter(r => r > 0).length;
    return validRates >= 3 ? rates : null;
    
  } catch (error) {
    console.error('VietinBank parsing error:', error.message);
    return null;
  }
}

function parseBIDV(data) {
  try {
    const rates = { 0: 0.10, 1: 0, 2: 0, 3: 0, 6: 0, 9: 0, 12: 0, 18: 0, 24: 0, 36: 0 };
    
    // BIDV có thể trả về JSON hoặc XML
    // Nếu là string thì parse
    let jsonData = data;
    if (typeof data === 'string') {
      try {
        jsonData = JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    
    // BIDV API thường có cấu trúc array of rates
    if (Array.isArray(jsonData)) {
      jsonData.forEach(item => {
        const term = parseInt(item.Term || item.term || item.KyHan || 0);
        const rate = parseFloat(item.Rate || item.rate || item.LaiSuat || 0);
        
        if (term > 0 && rate > 0 && rate < 20) {
          if (rates.hasOwnProperty(term)) {
            rates[term] = rate;
          }
        }
      });
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      jsonData.data.forEach(item => {
        const term = parseInt(item.Term || item.term || item.KyHan || 0);
        const rate = parseFloat(item.Rate || item.rate || item.LaiSuat || 0);
        
        if (term > 0 && rate > 0 && rate < 20) {
          if (rates.hasOwnProperty(term)) {
            rates[term] = rate;
          }
        }
      });
    }
    
    // Điền kỳ hạn 2 tháng nếu thiếu
    if (rates[2] === 0 && rates[1] > 0) {
      rates[2] = rates[1] + 0.3;
    }
    
    const validRates = Object.values(rates).filter(r => r > 0).length;
    return validRates >= 3 ? rates : null;
    
  } catch (error) {
    console.error('BIDV parsing error:', error.message);
    return null;
  }
}

function parseAgribank($) {
  try {
    const rates = { 0: 0.10, 1: 0, 2: 0, 3: 0, 6: 0, 9: 0, 12: 0, 18: 0, 24: 0, 36: 0 };
    
    // Agribank có bảng lãi suất trong HTML
    const tables = $('table');
    
    tables.each((i, table) => {
      const $table = $(table);
      const rows = $table.find('tr');
      
      rows.each((j, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length >= 2) {
          const termText = $(cells[0]).text().trim();
          const rateText = $(cells[1]).text().trim();
          
          // Tìm số tháng trong text
          const termMatch = termText.match(/(\d+)\s*(tháng|month)/i);
          if (termMatch) {
            const term = parseInt(termMatch[1]);
            const rateMatch = rateText.match(/([0-9]+[.,][0-9]+)/);
            
            if (rateMatch && rates.hasOwnProperty(term)) {
              const rate = parseFloat(rateMatch[1].replace(',', '.'));
              if (rate > 0 && rate < 20) {
                rates[term] = rate;
              }
            }
          }
        }
      });
    });
    
    if (rates[2] === 0 && rates[1] > 0) rates[2] = rates[1] + 0.3;
    
    const validRates = Object.values(rates).filter(r => r > 0).length;
    return validRates >= 3 ? rates : null;
    
  } catch (error) {
    console.error('Agribank parsing error:', error.message);
    return null;
  }
}

function parseMBBank($) {
  try {
    const rates = { 0: 0.20, 1: 0, 2: 0, 3: 0, 6: 0, 9: 0, 12: 0, 18: 0, 24: 0, 36: 0 };
    
    // MB Bank thường có div hoặc table chứa lãi suất
    const text = $('body').text();
    
    // Tìm các pattern như "1 tháng: 3.5%" hoặc "3 tháng 4.0%"
    const patterns = [
      { regex: /1\s*tháng[:\s]+([0-9]+[.,][0-9]+)/i, term: 1 },
      { regex: /2\s*tháng[:\s]+([0-9]+[.,][0-9]+)/i, term: 2 },
      { regex: /3\s*tháng[:\s]+([0-9]+[.,][0-9]+)/i, term: 3 },
      { regex: /6\s*tháng[:\s]+([0-9]+[.,][0-9]+)/i, term: 6 },
      { regex: /9\s*tháng[:\s]+([0-9]+[.,][0-9]+)/i, term: 9 },
      { regex: /12\s*tháng[:\s]+([0-9]+[.,][0-9]+)/i, term: 12 },
      { regex: /18\s*tháng[:\s]+([0-9]+[.,][0-9]+)/i, term: 18 },
      { regex: /24\s*tháng[:\s]+([0-9]+[.,][0-9]+)/i, term: 24 },
      { regex: /36\s*tháng[:\s]+([0-9]+[.,][0-9]+)/i, term: 36 }
    ];
    
    patterns.forEach(({ regex, term }) => {
      const match = text.match(regex);
      if (match) {
        const rate = parseFloat(match[1].replace(',', '.'));
        if (rate > 0 && rate < 20) {
          rates[term] = rate;
        }
      }
    });
    
    // Fallback: parse từ table
    $('table tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const termText = $(cells[0]).text().trim();
        const rateText = $(cells[1]).text().trim();
        
        const termMatch = termText.match(/(\d+)/);
        const rateMatch = rateText.match(/([0-9]+[.,][0-9]+)/);
        
        if (termMatch && rateMatch) {
          const term = parseInt(termMatch[1]);
          const rate = parseFloat(rateMatch[1].replace(',', '.'));
          
          if (rates.hasOwnProperty(term) && rate > 0 && rate < 20) {
            rates[term] = rate;
          }
        }
      }
    });
    
    if (rates[2] === 0 && rates[1] > 0) rates[2] = rates[1] + 0.2;
    
    const validRates = Object.values(rates).filter(r => r > 0).length;
    return validRates >= 3 ? rates : null;
    
  } catch (error) {
    console.error('MB Bank parsing error:', error.message);
    return null;
  }
}

function parseTechcombank($) {
  try {
    const rates = { 0: 0.10, 1: 0, 2: 0, 3: 0, 6: 0, 9: 0, 12: 0, 18: 0, 24: 0, 36: 0 };
    
    // Techcombank có thể có table hoặc div structure
    const tables = $('table');
    
    tables.each((i, table) => {
      const $table = $(table);
      $table.find('tr').each((j, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length >= 2) {
          const termText = $(cells[0]).text().trim();
          const rateText = $(cells[1]).text().trim();
          
          // Parse term
          const termMatch = termText.match(/(\d+)/);
          const rateMatch = rateText.match(/([0-9]+[.,][0-9]+)/);
          
          if (termMatch && rateMatch) {
            const term = parseInt(termMatch[1]);
            const rate = parseFloat(rateMatch[1].replace(',', '.'));
            
            if (rates.hasOwnProperty(term) && rate > 0 && rate < 20) {
              rates[term] = rate;
            }
          }
        }
      });
    });
    
    if (rates[2] === 0 && rates[1] > 0) rates[2] = rates[1] + 0.2;
    
    const validRates = Object.values(rates).filter(r => r > 0).length;
    return validRates >= 3 ? rates : null;
    
  } catch (error) {
    console.error('Techcombank parsing error:', error.message);
    return null;
  }
}

function parseACB($) {
  try {
    const rates = { 0: 0.10, 1: 0, 2: 0, 3: 0, 6: 0, 9: 0, 12: 0, 18: 0, 24: 0, 36: 0 };
    
    // ACB có bảng lãi suất tiết kiệm
    $('table').each((i, table) => {
      const $table = $(table);
      $table.find('tr').each((j, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length >= 2) {
          const termText = $(cells[0]).text().trim();
          const rateText = $(cells[1]).text().trim();
          
          const termMatch = termText.match(/(\d+)/);
          const rateMatch = rateText.match(/([0-9]+[.,][0-9]+)/);
          
          if (termMatch && rateMatch) {
            const term = parseInt(termMatch[1]);
            const rate = parseFloat(rateMatch[1].replace(',', '.'));
            
            if (rates.hasOwnProperty(term) && rate > 0 && rate < 20) {
              rates[term] = rate;
            }
          }
        }
      });
    });
    
    if (rates[2] === 0 && rates[1] > 0) rates[2] = rates[1] + 0.2;
    
    const validRates = Object.values(rates).filter(r => r > 0).length;
    return validRates >= 3 ? rates : null;
    
  } catch (error) {
    console.error('ACB parsing error:', error.message);
    return null;
  }
}

function parseVPBank($) {
  try {
    const rates = { 0: 0.20, 1: 0, 2: 0, 3: 0, 6: 0, 9: 0, 12: 0, 18: 0, 24: 0, 36: 0 };
    
    // VPBank có cấu trúc tương tự các ngân hàng khác
    $('table').each((i, table) => {
      const $table = $(table);
      $table.find('tr').each((j, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length >= 2) {
          const termText = $(cells[0]).text().trim();
          const rateText = $(cells[1]).text().trim();
          
          const termMatch = termText.match(/(\d+)/);
          const rateMatch = rateText.match(/([0-9]+[.,][0-9]+)/);
          
          if (termMatch && rateMatch) {
            const term = parseInt(termMatch[1]);
            const rate = parseFloat(rateMatch[1].replace(',', '.'));
            
            if (rates.hasOwnProperty(term) && rate > 0 && rate < 20) {
              rates[term] = rate;
            }
          }
        }
      });
    });
    
    if (rates[2] === 0 && rates[1] > 0) rates[2] = rates[1] + 0.2;
    
    const validRates = Object.values(rates).filter(r => r > 0).length;
    return validRates >= 3 ? rates : null;
    
  } catch (error) {
    console.error('VPBank parsing error:', error.message);
    return null;
  }
}

function parseTPBank($) {
  try {
    const rates = { 0: 0.20, 1: 0, 2: 0, 3: 0, 6: 0, 9: 0, 12: 0, 18: 0, 24: 0, 36: 0 };
    
    // TPBank có bảng lãi suất
    $('table').each((i, table) => {
      const $table = $(table);
      $table.find('tr').each((j, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length >= 2) {
          const termText = $(cells[0]).text().trim();
          const rateText = $(cells[1]).text().trim();
          
          const termMatch = termText.match(/(\d+)/);
          const rateMatch = rateText.match(/([0-9]+[.,][0-9]+)/);
          
          if (termMatch && rateMatch) {
            const term = parseInt(termMatch[1]);
            const rate = parseFloat(rateMatch[1].replace(',', '.'));
            
            if (rates.hasOwnProperty(term) && rate > 0 && rate < 20) {
              rates[term] = rate;
            }
          }
        }
      });
    });
    
    if (rates[2] === 0 && rates[1] > 0) rates[2] = rates[1] + 0.2;
    
    const validRates = Object.values(rates).filter(r => r > 0).length;
    return validRates >= 3 ? rates : null;
    
  } catch (error) {
    console.error('TPBank parsing error:', error.message);
    return null;
  }
}

// ===== EXPORT =====
module.exports = {
  getAllBankRates,
  refreshAllBankRates,
  getBankRate,
  getSupportedBanks
};
