// =====================================================
// SAVINGS TRACK PRO - FULL APPLICATION JAVASCRIPT
// =====================================================

// ===== GLOBAL STATE =====
let savings = [];
let bankRates = {};
let settings = {
  warnDays: 30,
  lossThreshold: 10,
  warnInterestDays: 7
};
let currentEditingId = null;
let advisorRisk = 'low';
let calcChart = null;
let portfolioChart = null;
let advisorChart = null;
let ratesChart = null;
let previewData = [];

// ===== DEFAULT BANK RATES =====
const DEFAULT_BANK_RATES = {
  'CEP - Tổ chức Tài chính Vi mô': { 0: 0.50, 1: 3.90, 2: 3.90, 3: 4.00, 6: 5.40, 9: 5.40, 12: 5.80, 18: 5.70, 24: 5.70, 36: 5.70 },
  'Vietcombank': { 0: 0.10, 1: 2.0, 2: 2.3, 3: 2.9, 6: 4.6, 9: 4.8, 12: 5.0, 18: 5.2, 24: 5.4, 36: 5.5 },
  'VietinBank': { 0: 0.10, 1: 2.0, 2: 2.3, 3: 3.0, 6: 4.7, 9: 4.9, 12: 5.1, 18: 5.3, 24: 5.5, 36: 5.6 },
  'BIDV': { 0: 0.10, 1: 2.0, 2: 2.3, 3: 3.0, 6: 4.7, 9: 4.9, 12: 5.2, 18: 5.4, 24: 5.6, 36: 5.7 },
  'Agribank': { 0: 0.10, 1: 2.0, 2: 2.3, 3: 3.0, 6: 4.8, 9: 5.0, 12: 5.3, 18: 5.5, 24: 5.7, 36: 5.8 },
  'MB Bank': { 0: 0.20, 1: 3.5, 2: 3.7, 3: 4.0, 6: 5.2, 9: 5.4, 12: 5.7, 18: 5.9, 24: 6.1, 36: 6.2 },
  'Techcombank': { 0: 0.10, 1: 3.2, 2: 3.4, 3: 3.8, 6: 5.0, 9: 5.2, 12: 5.5, 18: 5.7, 24: 5.9, 36: 6.0 },
  'ACB': { 0: 0.10, 1: 3.3, 2: 3.5, 3: 3.9, 6: 5.1, 9: 5.3, 12: 5.6, 18: 5.8, 24: 6.0, 36: 6.1 },
  'VPBank': { 0: 0.20, 1: 3.4, 2: 3.6, 3: 4.0, 6: 5.3, 9: 5.5, 12: 5.8, 18: 6.0, 24: 6.2, 36: 6.3 },
  'TPBank': { 0: 0.20, 1: 3.5, 2: 3.7, 3: 4.1, 6: 5.4, 9: 5.6, 12: 5.9, 18: 6.1, 24: 6.3, 36: 6.4 },
  'Sacombank': { 0: 0.10, 1: 3.0, 2: 3.2, 3: 3.6, 6: 4.9, 9: 5.1, 12: 5.4, 18: 5.6, 24: 5.8, 36: 5.9 },
  'HDBank': { 0: 0.20, 1: 3.3, 2: 3.5, 3: 3.9, 6: 5.2, 9: 5.4, 12: 5.7, 18: 5.9, 24: 6.1, 36: 6.2 },
  'VIB': { 0: 0.20, 1: 3.4, 2: 3.6, 3: 4.0, 6: 5.3, 9: 5.5, 12: 5.8, 18: 6.0, 24: 6.2, 36: 6.3 },
  'SHB': { 0: 0.10, 1: 3.2, 2: 3.4, 3: 3.8, 6: 5.1, 9: 5.3, 12: 5.6, 18: 5.8, 24: 6.0, 36: 6.1 },
  'OCB': { 0: 0.20, 1: 3.5, 2: 3.7, 3: 4.1, 6: 5.4, 9: 5.6, 12: 5.9, 18: 6.1, 24: 6.3, 36: 6.4 }
};

// ===== BANKS WITH AUTO-UPDATE SUPPORT =====
// Các ngân hàng có parser function hoàn chỉnh
const AUTO_UPDATE_BANKS = [
  'Vietcombank',
  'VietinBank',
  'BIDV',
  'Agribank',
  'MB Bank',
  'Techcombank',
  'ACB',
  'VPBank',
  'TPBank'
];

// ===== SIDEBAR TOGGLE (MOBILE) =====
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const isOpen = sidebar.classList.toggle('open');
  overlay.classList.toggle('hidden', !isOpen);
}

// ===== MONEY INPUT FORMATTING =====
function parseMoney(val) {
  return parseInt(String(val).replace(/\./g, '').replace(/[^\d]/g, '')) || 0;
}

function formatMoneyValue(num) {
  const n = Math.round(num);
  return n > 0 ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
}

function formatMoneyInput(el) {
  const raw = parseMoney(el.value);
  const formatted = raw > 0 ? formatMoneyValue(raw) : '';
  const pos = el.selectionStart;
  const oldLen = el.value.length;
  el.value = formatted;
  const diff = formatted.length - oldLen;
  try { el.setSelectionRange(pos + diff, pos + diff); } catch(e) {}
}

// ===== DEBOUNCE HELPER =====
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
const runCalculatorDebounced = debounce(runCalculator, 300);

// ===== INIT APP =====
document.addEventListener('DOMContentLoaded', () => {
  // Load dữ liệu với khả năng khôi phục tự động
  const loaded = loadFromStorageWithRecovery();
  if (!loaded) {
    // Nếu không có dữ liệu, khởi tạo mặc định
    bankRates = DEFAULT_BANK_RATES;
  }
  
  initUI();
  initNavigation();
  renderAll();
  checkAlerts();
  
  // Kiểm tra và nhắc nhở backup định kỳ
  checkBackupReminder();
});

// ===== STORAGE (Legacy function - kept for compatibility) =====
function loadFromStorage() {
  return loadFromStorageWithRecovery();
}

// ===== DATA PROTECTION & BACKUP SYSTEM =====
const BACKUP_CONFIG = {
  maxBackups: 5,           // Giữ tối đa 5 phiên bản backup
  backupInterval: 5,       // Auto-backup sau mỗi 5 lần thay đổi
  reminderDays: 7,         // Nhắc backup sau 7 ngày
  autoBackupKey: 'savingsBackups',
  lastExportKey: 'lastExportDate',
  saveCountKey: 'saveCount'
};

function saveToStorage() {
  const data = { savings, bankRates, settings };
  
  try {
    // Lưu dữ liệu chính
    localStorage.setItem('savingsData', JSON.stringify(data));
    
    // Tăng bộ đếm lần lưu
    let saveCount = parseInt(localStorage.getItem(BACKUP_CONFIG.saveCountKey) || '0') + 1;
    localStorage.setItem(BACKUP_CONFIG.saveCountKey, saveCount.toString());
    
    // Auto-backup sau mỗi N lần thay đổi
    if (saveCount % BACKUP_CONFIG.backupInterval === 0) {
      createAutoBackup(data);
    }
  } catch (e) {
    console.error('Lỗi khi lưu dữ liệu:', e);
    showToast('Lỗi lưu dữ liệu! Hãy export ra file để bảo vệ dữ liệu.', 'error');
  }
}

function createAutoBackup(data) {
  try {
    // Lấy danh sách backup hiện tại
    const backupsStr = localStorage.getItem(BACKUP_CONFIG.autoBackupKey);
    let backups = backupsStr ? JSON.parse(backupsStr) : [];
    
    // Thêm backup mới
    const newBackup = {
      timestamp: new Date().toISOString(),
      data: data,
      itemCount: data.savings.length
    };
    
    backups.unshift(newBackup);
    
    // Giữ chỉ N backup gần nhất
    if (backups.length > BACKUP_CONFIG.maxBackups) {
      backups = backups.slice(0, BACKUP_CONFIG.maxBackups);
    }
    
    localStorage.setItem(BACKUP_CONFIG.autoBackupKey, JSON.stringify(backups));
    console.log(`✓ Auto-backup created (${backups.length}/${BACKUP_CONFIG.maxBackups})`);
  } catch (e) {
    console.error('Không thể tạo auto-backup:', e);
  }
}

function loadFromStorageWithRecovery() {
  try {
    const stored = localStorage.getItem('savingsData');
    if (!stored) return false;
    
    const data = JSON.parse(stored);
    
    // Kiểm tra tính hợp lệ của dữ liệu
    if (!data.savings || !Array.isArray(data.savings)) {
      throw new Error('Dữ liệu không hợp lệ');
    }
    
    // Load dữ liệu
    savings = data.savings || [];
    bankRates = data.bankRates || DEFAULT_BANK_RATES;
    settings = data.settings || settings;
    
    // Normalize dữ liệu cũ - thêm giá trị mặc định cho interestType
    savings = savings.map(s => ({
      ...s,
      interestType: s.interestType || 'maturity'
    }));
    
    // Đảm bảo key mới có mặc định nếu load từ dữ liệu cũ
    if (settings.warnInterestDays === undefined) settings.warnInterestDays = 7;
    Object.keys(DEFAULT_BANK_RATES).forEach(bank => {
      if (!bankRates[bank]) bankRates[bank] = { ...DEFAULT_BANK_RATES[bank] };
    });
    
    return true;
  } catch (e) {
    console.error('Lỗi khi load dữ liệu chính:', e);
    return attemptDataRecovery();
  }
}

function attemptDataRecovery() {
  try {
    const backupsStr = localStorage.getItem(BACKUP_CONFIG.autoBackupKey);
    if (!backupsStr) return false;
    
    const backups = JSON.parse(backupsStr);
    if (backups.length === 0) return false;
    
    // Thử khôi phục từ backup gần nhất
    const latestBackup = backups[0];
    const data = latestBackup.data;
    
    savings = data.savings || [];
    bankRates = data.bankRates || DEFAULT_BANK_RATES;
    settings = data.settings || settings;
    
    // Normalize dữ liệu cũ - thêm giá trị mặc định cho interestType
    savings = savings.map(s => ({
      ...s,
      interestType: s.interestType || 'maturity'
    }));

    if (settings.warnInterestDays === undefined) settings.warnInterestDays = 7;
    Object.keys(DEFAULT_BANK_RATES).forEach(bank => {
      if (!bankRates[bank]) bankRates[bank] = { ...DEFAULT_BANK_RATES[bank] };
    });
    
    // Lưu lại dữ liệu đã khôi phục
    saveToStorage();
    
    showToast(`✓ Đã khôi phục dữ liệu từ backup (${dayjs(latestBackup.timestamp).format('DD/MM/YYYY HH:mm')})`, 'success');
    return true;
  } catch (e) {
    console.error('Không thể khôi phục từ backup:', e);
    return false;
  }
}

function checkBackupReminder() {
  const lastExport = localStorage.getItem(BACKUP_CONFIG.lastExportKey);
  if (!lastExport) {
    // Lần đầu sử dụng, đặt thời gian hiện tại
    localStorage.setItem(BACKUP_CONFIG.lastExportKey, new Date().toISOString());
    return;
  }
  
  const daysSinceExport = dayjs().diff(dayjs(lastExport), 'day');
  
  if (daysSinceExport >= BACKUP_CONFIG.reminderDays) {
    showBackupReminder(daysSinceExport);
  }
}

function showBackupReminder(days) {
  const banner = document.getElementById('backup-reminder-banner');
  if (!banner) {
    // Tạo banner nhắc nhở nếu chưa có
    const alertBanner = document.getElementById('alert-banner');
    if (alertBanner && alertBanner.parentNode) {
      const reminderHTML = `
        <div id="backup-reminder-banner" class="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <i class="fa-solid fa-cloud-arrow-down text-amber-500 mt-0.5 text-lg"></i>
          <div class="flex-1 text-sm text-amber-800">
            <strong>⚠️ Nhắc nhở:</strong> Đã <strong>${days} ngày</strong> bạn chưa backup dữ liệu! 
            Hãy xuất file backup để bảo vệ dữ liệu của bạn.
          </div>
          <div class="flex gap-2">
            <button onclick="exportDataAndDismissReminder()" class="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 text-xs font-semibold">
              Export Ngay
            </button>
            <button onclick="dismissBackupReminder()" class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs">
              Để sau
            </button>
          </div>
        </div>
      `;
      alertBanner.insertAdjacentHTML('afterend', reminderHTML);
    }
  }
}

function exportDataAndDismissReminder() {
  exportData();
  dismissBackupReminder();
}

function dismissBackupReminder() {
  const banner = document.getElementById('backup-reminder-banner');
  if (banner) banner.remove();
  // Đặt lại thời gian nhắc nhở
  localStorage.setItem(BACKUP_CONFIG.lastExportKey, new Date().toISOString());
}

function updateLastExportDate() {
  localStorage.setItem(BACKUP_CONFIG.lastExportKey, new Date().toISOString());
}

function showBackupStatus() {
  try {
    const backupsStr = localStorage.getItem(BACKUP_CONFIG.autoBackupKey);
    const backups = backupsStr ? JSON.parse(backupsStr) : [];
    const lastExport = localStorage.getItem(BACKUP_CONFIG.lastExportKey);
    
    let statusHTML = '<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">';
    statusHTML += '<h3 class="font-bold text-blue-900 mb-2"><i class="fa-solid fa-shield-halved"></i> Trạng Thái Bảo Vệ Dữ Liệu</h3>';
    
    // Auto-backups
    statusHTML += `<div class="text-sm text-blue-800 mb-2">`;
    statusHTML += `<strong>Auto-backup:</strong> ${backups.length}/${BACKUP_CONFIG.maxBackups} phiên bản được lưu`;
    if (backups.length > 0) {
      const latest = backups[0];
      statusHTML += ` (Mới nhất: ${dayjs(latest.timestamp).format('DD/MM/YYYY HH:mm')})`;
    }
    statusHTML += `</div>`;
    
    // Last manual export
    if (lastExport) {
      const daysSince = dayjs().diff(dayjs(lastExport), 'day');
      statusHTML += `<div class="text-sm text-blue-800">`;
      statusHTML += `<strong>Export cuối:</strong> ${dayjs(lastExport).format('DD/MM/YYYY HH:mm')} (${daysSince} ngày trước)`;
      statusHTML += `</div>`;
    }
    
    statusHTML += '</div>';
    
    const settingsPage = document.getElementById('page-settings');
    const existingStatus = settingsPage.querySelector('.bg-blue-50');
    if (existingStatus) existingStatus.remove();
    
    settingsPage.insertAdjacentHTML('afterbegin', statusHTML);
  } catch (e) {
    console.error('Lỗi hiển thị trạng thái backup:', e);
  }
}

function restoreFromBackup(backupIndex) {
  try {
    const backupsStr = localStorage.getItem(BACKUP_CONFIG.autoBackupKey);
    if (!backupsStr) {
      showToast('Không tìm thấy backup', 'error');
      return;
    }
    
    const backups = JSON.parse(backupsStr);
    if (backupIndex >= backups.length) {
      showToast('Backup không tồn tại', 'error');
      return;
    }
    
    const backup = backups[backupIndex];
    const data = backup.data;
    
    // Xác nhận trước khi khôi phục
    if (!confirm(`Khôi phục dữ liệu từ backup ngày ${dayjs(backup.timestamp).format('DD/MM/YYYY HH:mm')}?\n\nDữ liệu hiện tại sẽ bị ghi đè!`)) {
      return;
    }
    
    savings = data.savings || [];
    bankRates = data.bankRates || DEFAULT_BANK_RATES;
    settings = data.settings || settings;
    
    // Normalize dữ liệu cũ - thêm giá trị mặc định cho interestType
    savings = savings.map(s => ({
      ...s,
      interestType: s.interestType || 'maturity'
    }));
    
    saveToStorage();
    renderAll();
    
    showToast(`✓ Đã khôi phục từ backup (${dayjs(backup.timestamp).format('DD/MM/YYYY HH:mm')})`, 'success');
  } catch (e) {
    console.error('Lỗi khôi phục backup:', e);
    showToast('Lỗi khi khôi phục backup', 'error');
  }
}

// ===== INIT UI =====
function initUI() {
  // Today date
  document.getElementById('today-date').textContent = dayjs().format('DD/MM/YYYY');
  
  // Set default dates in calculator
  document.getElementById('calc-start-date').value = dayjs().format('YYYY-MM-DD');
  document.getElementById('calc-early-date').value = dayjs().add(6, 'month').format('YYYY-MM-DD');
  
  // Set default date in form
  document.getElementById('form-start-date').value = dayjs().format('YYYY-MM-DD');
  
  // Populate bank selects
  populateBankSelects();
  
  // Run initial calculator
  runCalculator();
}

function populateBankSelects() {
  const banks = Object.keys(bankRates).sort((a, b) => {
    // CEP luôn ở đầu
    if (a.startsWith('CEP')) return -1;
    if (b.startsWith('CEP')) return 1;
    return a.localeCompare(b);
  });
  const formBank = document.getElementById('form-bank');
  const filterBank = document.getElementById('filter-bank');
  
  formBank.innerHTML = '<option value="">-- Chọn ngân hàng --</option>';
  filterBank.innerHTML = '<option value="">Tất cả ngân hàng</option>';
  
  banks.forEach(bank => {
    formBank.innerHTML += `<option value="${bank}">${bank}</option>`;
    filterBank.innerHTML += `<option value="${bank}">${bank}</option>`;
  });
}

// ===== NAVIGATION =====
function initNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      navigateTo(page);
      // Đóng sidebar trên mobile sau khi chọn mục
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
      }
    });
  });
}

function navigateTo(page) {
  // Update nav
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  
  // Update pages
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(`page-${page}`).classList.remove('hidden');
  
  // Update title
  const titles = {
    dashboard: 'Tổng Quan',
    savings: 'Sổ Tiết Kiệm',
    calculator: 'Máy Tính Lãi Suất',
    advisor: 'Tư Vấn Sản Phẩm',
    rates: 'Lãi Suất Ngân Hàng',
    settings: 'Cài Đặt'
  };
  document.getElementById('page-title').textContent = titles[page];
  
  // Render specific page
  if (page === 'dashboard') renderDashboard();
  if (page === 'savings') renderSavingsList();
  if (page === 'rates') renderRatesTable();
  if (page === 'settings') {
    renderSettingsInfo();
    showSettingsPage();
  }
}

// ===== RENDER ALL =====
function renderAll() {
  renderDashboard();
  populateBankSelects();
  renderSettingsInfo();
  // Render backup status if on settings page
  if (!document.getElementById('page-settings').classList.contains('hidden')) {
    showSettingsPage();
  }
}

function renderSettingsInfo() {
  const el = document.getElementById('cep-rate-info');

  // Sync select values
  const wdEl = document.getElementById('setting-warn-days');
  if (wdEl) wdEl.value = settings.warnDays;
  const widEl = document.getElementById('setting-warn-interest-days');
  if (widEl) widEl.value = settings.warnInterestDays;
  const ltEl = document.getElementById('setting-loss-threshold');
  if (ltEl) ltEl.value = settings.lossThreshold;
  if (!el) return;
  const cepKey = Object.keys(bankRates).find(b => b.startsWith('CEP'));
  if (!cepKey) {
    el.innerHTML = '<span class="text-gray-500">Chưa có dữ liệu lãi suất CEP.</span>';
    return;
  }
  const r = bankRates[cepKey];
  const terms = [0, 1, 2, 3, 6, 9, 12, 18, 24, 36];
  const rows = terms
    .filter(t => r[t] !== undefined)
    .map(t => `<span class="inline-block mr-3">${t === 0 ? 'KKH' : t + 'T'}: <strong>${r[t].toFixed(2)}%</strong></span>`)
    .join('');
  el.innerHTML = `<strong>✅ Lãi suất hiện tại – ${cepKey}</strong><br/><div class="mt-1 leading-6">${rows}</div>`;
}

// ===== DASHBOARD =====
function renderDashboard() {
  const active = savings.filter(s => s.status === 'active' || s.status === 'due-soon' || s.status === 'overdue');
  
  // Stats
  const totalPrincipal = active.reduce((sum, s) => sum + s.principal, 0);
  const totalInterest = active.reduce((sum, s) => sum + calculateCurrentInterest(s), 0);
  const dueSoon = active.filter(s => getDaysUntilMaturity(s) <= settings.warnDays && getDaysUntilMaturity(s) >= 0).length;
  const totalPayout = active.reduce((sum, s) => sum + s.principal + calculateMaturityInterest(s), 0);
  
  document.getElementById('stat-total-principal').textContent = formatCurrency(totalPrincipal);
  document.getElementById('stat-total-books').textContent = `${active.length} sổ tiết kiệm`;
  document.getElementById('stat-total-interest').textContent = formatCurrency(totalInterest);
  document.getElementById('stat-due-soon').textContent = dueSoon;
  document.getElementById('stat-total-payout').textContent = formatCurrency(totalPayout);
  
  // Timeline
  renderMaturityTimeline();
  
  // Portfolio chart
  renderPortfolioChart();
  
  // Alerts
  renderAlerts();
  
  // Recent
  renderRecentSavings();
  
  // Alert banner
  updateAlertBanner();
}

function renderMaturityTimeline() {
  const container = document.getElementById('maturity-timeline');
  const active = savings.filter(s => s.status === 'active' || s.status === 'due-soon' || s.status === 'overdue')
    .sort((a, b) => new Date(a.maturityDate) - new Date(b.maturityDate))
    .slice(0, 8);
  
  if (active.length === 0) {
    container.innerHTML = '<div class="text-gray-400 text-sm text-center py-8">Chưa có sổ tiết kiệm nào</div>';
    return;
  }
  
  container.innerHTML = active.map(s => {
    const days = getDaysUntilMaturity(s);
    const status = getSavingStatus(s);
    const colors = {
      'active': 'bg-blue-50 border-blue-200 text-blue-700',
      'due-soon': 'bg-yellow-50 border-yellow-200 text-yellow-700',
      'overdue': 'bg-red-50 border-red-200 text-red-700'
    };
    
    return `
      <div class="timeline-item ${colors[status]}" onclick="viewSavingDetail(${s.id})">
        <i class="fa-solid fa-calendar-day"></i>
        <div class="flex-1">
          <div class="font-semibold">${s.name}</div>
          <div class="text-xs opacity-75">${s.bank} · ${formatCurrency(s.principal)}</div>
          ${s.accountNo ? `<div class="text-xs opacity-60 mt-0.5"><i class="fa-solid fa-hashtag text-[9px]"></i> ${s.accountNo}</div>` : ''}
        </div>
        <div class="text-right">
          <div class="font-bold">${dayjs(s.maturityDate).format('DD/MM/YYYY')}</div>
          <div class="text-xs opacity-75">${days >= 0 ? 'Còn ' + days + ' ngày' : 'Quá ' + Math.abs(days) + ' ngày'}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderPortfolioChart() {
  const ctx = document.getElementById('portfolio-chart');
  const legend = document.getElementById('portfolio-legend');
  if (!ctx) return;

  const byBank = {};
  
  savings.filter(s => s.status === 'active' || s.status === 'due-soon' || s.status === 'overdue').forEach(s => {
    byBank[s.bank] = (byBank[s.bank] || 0) + s.principal;
  });
  
  const labels = Object.keys(byBank);
  const data = Object.values(byBank);
  const colors = generateColors(labels.length);
  
  if (portfolioChart) { portfolioChart.destroy(); portfolioChart = null; }
  
  if (labels.length === 0) {
    ctx.style.display = 'none';
    if (legend) legend.innerHTML = '<div class="text-gray-400 text-sm text-center py-8">Chưa có dữ liệu</div>';
    return;
  }
  
  ctx.style.display = '';

  portfolioChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}`
          }
        }
      }
    }
  });
  
  // Legend
  if (legend) legend.innerHTML = labels.map((label, i) => `
    <div class="flex items-center gap-2 text-xs">
      <div class="w-3 h-3 rounded-sm" style="background:${colors[i]}"></div>
      <span class="flex-1 text-gray-600">${label}</span>
      <span class="font-semibold text-gray-800">${((data[i]/data.reduce((a,b)=>a+b,0))*100).toFixed(1)}%</span>
    </div>
  `).join('');
}

function renderAlerts() {
  const container = document.getElementById('alerts-list');
  const alerts = [];
  const today = dayjs();
  
  savings.forEach(s => {
    if (s.status === 'matured' || s.status === 'withdrawn') return;

    const days = getDaysUntilMaturity(s);
    const meta = `<span class="opacity-70 text-xs font-normal"> · ${s.bank}${s.accountNo ? ` · #${s.accountNo}` : ''} · Gửi ${dayjs(s.startDate).format('DD/MM/YYYY')}</span>`;

    if (days < 0) {
      alerts.push({
        type: 'error',
        icon: 'fa-circle-exclamation',
        text: `<strong>${s.name}</strong>${meta}<br/>Đã quá hạn <strong>${Math.abs(days)} ngày</strong> (đáo hạn ${dayjs(s.maturityDate).format('DD/MM/YYYY')})`,
        time: s.maturityDate,
        id: s.id
      });
    } else if (days <= settings.warnDays) {
      alerts.push({
        type: 'warning',
        icon: 'fa-clock',
        text: `<strong>${s.name}</strong>${meta}<br/>Đến hạn trong <strong>${days} ngày</strong> (${dayjs(s.maturityDate).format('DD/MM/YYYY')})`,
        time: s.maturityDate,
        id: s.id
      });
    }

    // Cảnh báo ngày nhận lãi hàng tháng / 3 tháng
    if (s.interestType === 'monthly' || s.interestType === 'quarterly') {
      const period = s.interestType === 'quarterly' ? 3 : 1;
      const periodInterest = getMonthlyInterestAmount(s) * period;
      const nextPay = getNextInterestPaymentDate(s);
      if (nextPay) {
        const daysTo = nextPay.diff(today.startOf('day'), 'day');
        if (daysTo === 0) {
          alerts.push({
            type: 'success',
            icon: 'fa-money-bill-wave',
            text: `<strong>${s.name}</strong>${meta}<br/>Hôm nay nhận lãi: <strong>${formatCurrency(periodInterest)}</strong>`,
            time: nextPay.format('YYYY-MM-DD'),
            id: s.id
          });
        } else if (daysTo > 0 && daysTo <= settings.warnInterestDays) {
          alerts.push({
            type: 'info',
            icon: 'fa-calendar-check',
            text: `<strong>${s.name}</strong>${meta}<br/>Còn <strong>${daysTo} ngày</strong> nhận lãi: ${formatCurrency(periodInterest)} (${nextPay.format('DD/MM/YYYY')})`,
            time: nextPay.format('YYYY-MM-DD'),
            id: s.id
          });
        }
      }
    }
  });
  
  alerts.sort((a,b) => new Date(a.time) - new Date(b.time));
  
  if (alerts.length === 0) {
    container.innerHTML = '<div class="text-gray-400 text-sm text-center py-6">Không có cảnh báo nào</div>';
  } else {
    container.innerHTML = alerts.slice(0, 10).map(a => {
      const colors = {
        error: 'bg-red-50 border-red-200 text-red-700',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        info: 'bg-blue-50 border-blue-200 text-blue-700',
        success: 'bg-green-50 border-green-200 text-green-700'
      };
      const clickable = a.id ? `onclick="viewSavingDetail(${a.id})" style="cursor:pointer"` : '';
      return `
        <div class="alert-item ${colors[a.type]}" ${clickable}>
          <i class="fa-solid ${a.icon} mt-0.5 flex-shrink-0"></i>
          <div class="flex-1 leading-5">${a.text}</div>
          ${a.id ? `<i class="fa-solid fa-chevron-right opacity-40 flex-shrink-0 self-center"></i>` : ''}
        </div>
      `;
    }).join('');
  }
}

function renderRecentSavings() {
  const container = document.getElementById('recent-savings');
  const recent = savings.slice().sort((a,b) => b.id - a.id).slice(0, 5);
  
  if (recent.length === 0) {
    container.innerHTML = '<div class="text-gray-400 text-sm text-center py-6">Chưa có sổ tiết kiệm nào</div>';
    return;
  }
  
  container.innerHTML = recent.map(s => {
    const status = getSavingStatus(s);
    const badgeClass = `badge-${status}`;
    const statusText = {
      'active': 'Đang gửi',
      'due-soon': 'Sắp đến hạn',
      'overdue': 'Quá hạn',
      'matured': 'Đã đáo hạn',
      'withdrawn': 'Đã rút'
    };
    
    return `
      <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onclick="viewSavingDetail(${s.id})">
        <div class="w-10 h-10 bg-navy rounded-lg flex items-center justify-center text-white">
          <i class="fa-solid fa-book-open"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm truncate">${s.name}</div>
          <div class="text-xs text-gray-500">${s.bank} · ${formatCurrency(s.principal)}</div>
        </div>
        <span class="badge ${badgeClass}">${statusText[status]}</span>
      </div>
    `;
  }).join('');
}

function updateAlertBanner() {
  const banner = document.getElementById('alert-banner');
  const content = document.getElementById('alert-content');
  const bannerIcon = document.querySelector('#alert-banner i');

  const overdue = savings.filter(s => getDaysUntilMaturity(s) < 0 && (s.status === 'active' || s.status === 'overdue'));

  const payToday = savings.filter(s =>
    s.status !== 'matured' && s.status !== 'withdrawn' &&
    s.interestType === 'monthly' &&
    getNextInterestPaymentDate(s)?.isSame(dayjs(), 'day')
  );

  const paySoon = savings.filter(s => {
    if (s.status === 'matured' || s.status === 'withdrawn' || s.interestType !== 'monthly') return false;
    const next = getNextInterestPaymentDate(s);
    if (!next) return false;
    const d = next.diff(dayjs().startOf('day'), 'day');
    return d > 0 && d <= settings.warnInterestDays;
  });

  // Reset về trạng thái mặc định (đỏ)
  banner.className = 'hidden mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3';
  if (bannerIcon) bannerIcon.className = 'fa-solid fa-triangle-exclamation text-red-500 mt-0.5 text-lg';
  content.className = 'text-sm text-red-700';

  if (overdue.length > 0) {
    content.innerHTML = `<strong>Có ${overdue.length} sổ tiết kiệm đã quá hạn!</strong> Vui lòng kiểm tra và xử lý.`;
    banner.className = 'mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3';
  } else if (payToday.length > 0) {
    const totalToday = payToday.reduce((sum, s) => sum + getMonthlyInterestAmount(s), 0);
    content.innerHTML = `<strong>Hôm nay nhận lãi từ ${payToday.length} sổ</strong> (hình thức hàng tháng): tổng <strong>${formatCurrency(totalToday)}</strong>`;
    banner.className = 'mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3';
    if (bannerIcon) bannerIcon.className = 'fa-solid fa-money-bill-wave text-blue-500 mt-0.5 text-lg';
    content.className = 'text-sm text-blue-700';
  } else {
    // giữ hidden
  }

  // Update notification badge (luôn chạy)
  const dueSoon = savings.filter(s => {
    const days = getDaysUntilMaturity(s);
    return days >= 0 && days <= settings.warnDays && (s.status === 'active' || s.status === 'due-soon');
  });
  
  const totalNotif = overdue.length + dueSoon.length + payToday.length + paySoon.length;
  const badge = document.getElementById('notif-badge');
  if (totalNotif > 0) {
    badge.textContent = totalNotif;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ===== SAVINGS LIST =====
function renderSavingsList() {
  const container = document.getElementById('savings-list');
  const search = document.getElementById('search-savings').value.toLowerCase();
  const filterStatus = document.getElementById('filter-status').value;
  const filterBank = document.getElementById('filter-bank').value;
  
  let filtered = savings.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search) || s.bank.toLowerCase().includes(search);
    const status = getSavingStatus(s);
    const matchStatus = !filterStatus || status === filterStatus;
    const matchBank = !filterBank || s.bank === filterBank;
    return matchSearch && matchStatus && matchBank;
  });
  
  // Sort by maturity date
  filtered.sort((a,b) => new Date(a.maturityDate) - new Date(b.maturityDate));
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="col-span-full text-gray-400 text-sm text-center py-12">Không tìm thấy sổ tiết kiệm nào</div>';
    return;
  }
  
  container.innerHTML = filtered.map(s => {
    const status = getSavingStatus(s);
    const maturityInterest = calculateMaturityInterest(s);
    const currentInterest = calculateCurrentInterest(s);
    const days = getDaysUntilMaturity(s);
    const progress = calculateProgress(s);
    
    const statusText = {
      'active': 'Đang gửi',
      'due-soon': 'Sắp đến hạn',
      'overdue': 'Quá hạn',
      'matured': 'Đã đáo hạn',
      'withdrawn': 'Đã rút'
    };
    
    const interestTypeText = {
      'maturity': 'Cuối kỳ',
      'monthly': 'Hàng tháng',
      'quarterly': 'Định kỳ 3T',
      'upfront': 'Đầu kỳ'
    };
    const interestTypeBadge = {
      'maturity': 'bg-blue-100 text-blue-700',
      'monthly': 'bg-purple-100 text-purple-700',
      'quarterly': 'bg-teal-100 text-teal-700',
      'upfront': 'bg-orange-100 text-orange-700'
    };

    return `
      <div class="savings-card status-${status}" onclick="viewSavingDetail(${s.id})">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-navy text-base mb-1 truncate">${s.name}</h3>
            <div class="text-xs text-gray-500">${s.bank}</div>
            ${s.accountNo ? `<div class="text-xs text-gray-400 mt-0.5"><i class="fa-solid fa-hashtag text-[10px]"></i> ${s.accountNo}</div>` : ''}
          </div>
          <div class="flex flex-col items-end gap-1 ml-2">
            <span class="badge badge-${status}">${statusText[status]}</span>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium ${interestTypeBadge[s.interestType] || 'bg-gray-100 text-gray-600'}">${interestTypeText[s.interestType] || s.interestType}</span>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <div class="text-gray-500 text-xs">Số tiền gốc</div>
            <div class="font-bold text-navy">${formatCurrency(s.principal)}</div>
          </div>
          <div>
            <div class="text-gray-500 text-xs">Lãi suất</div>
            <div class="font-bold text-green-600">${s.rate}%/năm</div>
          </div>
          <div>
            <div class="text-gray-500 text-xs">Kỳ hạn</div>
            <div class="font-semibold">${s.term} tháng</div>
          </div>
          <div>
            <div class="text-gray-500 text-xs">Đáo hạn</div>
            <div class="font-semibold">${dayjs(s.maturityDate).format('DD/MM/YYYY')}</div>
          </div>
        </div>
        
        <div class="border-t pt-3 space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">${s.interestType === 'upfront' ? 'Lãi đã nhận (đầu kỳ)' : (s.interestType === 'monthly' || s.interestType === 'quarterly') ? 'Lãi đã nhận / tích lũy' : 'Lãi tích lũy hiện tại'}</span>
            <span class="font-bold text-green-700">${formatCurrency(currentInterest)}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">${s.interestType === 'monthly' ? 'Lãi nhận mỗi tháng' : s.interestType === 'quarterly' ? 'Lãi nhận 3 tháng/lần' : 'Lãi khi đáo hạn'}</span>
            <span class="font-bold text-blue-700">${s.interestType === 'monthly' ? formatCurrency(getMonthlyInterestAmount(s)) + '/tháng' : s.interestType === 'quarterly' ? formatCurrency(getMonthlyInterestAmount(s) * 3) + '/3T' : formatCurrency(maturityInterest)}</span>
          </div>
          ${(s.interestType === 'monthly' || s.interestType === 'quarterly') ? `
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">Ngày nhận lãi tiếp theo</span>
            <span class="font-semibold text-purple-700">${getNextInterestPaymentDate(s)?.format('DD/MM/YYYY') || '—'}</span>
          </div>` : ''}
          <div class="progress-bar">
            <div class="progress-fill bg-gradient-to-r from-navy to-gold" style="width: ${progress}%"></div>
          </div>
          <div class="text-xs text-gray-500 text-center">
            ${days >= 0 ? `Còn ${days} ngày · ${progress}% hoàn thành` : `Quá hạn ${Math.abs(days)} ngày`}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== CALCULATOR =====
function runCalculator() {
  const principal = parseMoney(document.getElementById('calc-principal').value);
  const rate = parseFloat(document.getElementById('calc-rate').value) || 0;
  const term = parseInt(document.getElementById('calc-term').value) || 12;
  const interestType = document.getElementById('calc-interest-type').value;
  const startDate = document.getElementById('calc-start-date').value;
  const demandRate = parseFloat(document.getElementById('calc-demand-rate').value) || 0.5;
  const earlyDate = document.getElementById('calc-early-date').value;
  
  if (principal <= 0 || rate <= 0) {
    document.getElementById('res-interest').textContent = '0 ₫';
    document.getElementById('res-total').textContent = '0 ₫';
    document.getElementById('res-maturity').textContent = '—';
    document.getElementById('res-yield').textContent = '0%';
    return;
  }
  
  const maturityDate = dayjs(startDate).add(term, 'month');
  const interest = calculateInterest(principal, rate, term, interestType);
  const total = principal + interest;
  const annualYield = (interest / principal) * (12 / term) * 100;
  
  document.getElementById('res-interest').textContent = formatCurrency(interest);
  document.getElementById('res-total').textContent = formatCurrency(total);
  document.getElementById('res-maturity').textContent = maturityDate.format('DD/MM/YYYY');
  document.getElementById('res-yield').textContent = annualYield.toFixed(2) + '%';
  
  // Early withdrawal
  if (earlyDate && dayjs(earlyDate).isBefore(maturityDate)) {
    const daysElapsed = dayjs(earlyDate).diff(dayjs(startDate), 'day');
    const earlyInterest = (principal * demandRate / 100 / 365) * daysElapsed;
    const loss = interest - earlyInterest;
    const lossPct = (loss / interest) * 100;
    
    document.getElementById('res-days-elapsed').textContent = daysElapsed;
    document.getElementById('res-early-interest').textContent = formatCurrency(earlyInterest);
    document.getElementById('res-loss').textContent = formatCurrency(loss);
    document.getElementById('res-loss-pct').textContent = lossPct.toFixed(1) + '%';
    document.getElementById('early-withdrawal-result').classList.remove('hidden');
  } else {
    document.getElementById('early-withdrawal-result').classList.add('hidden');
  }
  
  // Chart
  renderCalculatorChart(principal, rate, term, startDate);
  
  // Term comparison
  renderTermComparison(principal, rate, term);
}

function renderCalculatorChart(principal, rate, term, startDate) {
  const ctx = document.getElementById('calc-chart');
  const months = term;
  const labels = [];
  const values = [];
  
  for (let i = 0; i <= months; i++) {
    labels.push(`T${i}`);
    const monthlyInterest = (principal * rate / 100 / 12) * i;
    values.push(principal + monthlyInterest);
  }
  
  if (calcChart) calcChart.destroy();
  
  calcChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Tổng tiền (Vốn + Lãi)',
        data: values,
        borderColor: '#0f2d5e',
        backgroundColor: 'rgba(15,45,94,0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 2
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => formatCurrency(ctx.raw)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (val) => formatCurrency(val, true)
          }
        }
      }
    }
  });
}

function renderTermComparison(principal, baseRate, currentTerm) {
  const container = document.getElementById('term-comparison-table');
  const terms = [1, 2, 3, 6, 9, 12, 18, 24, 36];
  
  const html = `
    <table class="compare-table">
      <thead>
        <tr>
          <th>Kỳ Hạn</th>
          <th>Lãi Suất</th>
          <th>Tiền Lãi</th>
          <th>Tổng Nhận</th>
          <th>Hiệu Suất/Năm</th>
        </tr>
      </thead>
      <tbody>
        ${terms.map(t => {
          const r = baseRate - (currentTerm - t) * 0.1; // Adjust rate slightly
          const interest = calculateInterest(principal, r, t, 'maturity');
          const total = principal + interest;
          const yield_ = (interest / principal) * (12 / t) * 100;
          const isCurrent = t === currentTerm;
          
          return `
            <tr style="${isCurrent ? 'background:#fef3c7;font-weight:600;' : ''}">
              <td>${t} tháng</td>
              <td>${r.toFixed(2)}%</td>
              <td>${formatCurrency(interest)}</td>
              <td>${formatCurrency(total)}</td>
              <td>${yield_.toFixed(2)}%</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
}

function addFromCalculator() {
  const principal = parseMoney(document.getElementById('calc-principal').value);
  const rate = parseFloat(document.getElementById('calc-rate').value);
  const term = parseInt(document.getElementById('calc-term').value);
  const interestType = document.getElementById('calc-interest-type').value;
  const startDate = document.getElementById('calc-start-date').value;
  const demandRate = parseFloat(document.getElementById('calc-demand-rate').value);
  
  if (!principal || !rate || !startDate) {
    showToast('Vui lòng điền đầy đủ thông tin', 'error');
    return;
  }
  
  // Pre-fill form
  const cepBank = Object.keys(bankRates).find(b => b.startsWith('CEP'));
  document.getElementById('form-bank').value = cepBank || '';
  document.getElementById('form-principal').value = formatMoneyValue(principal);
  document.getElementById('form-rate').value = rate;
  document.getElementById('form-term').value = term;
  document.getElementById('form-interest-type').value = interestType;
  document.getElementById('form-start-date').value = startDate;
  document.getElementById('form-demand-rate').value = demandRate;
  document.getElementById('form-name').value = `Sổ TK CEP ${term} tháng - ${dayjs(startDate).format('DD/MM/YYYY')}`;
  
  openAddSavings();
}

// ===== ADVISOR =====
function runAdvisor() {
  const amount = parseMoney(document.getElementById('adv-amount').value) || 50000000;
  const term = document.getElementById('adv-term').value;
  const priority = document.getElementById('adv-priority').value;
  const goal = document.getElementById('adv-goal').value;
  
  const recommendations = [];
  
  Object.keys(bankRates).forEach(bank => {
    const rates = bankRates[bank];
    let selectedTerms = [];
    
    if (term === 'any') selectedTerms = [1, 3, 6, 12, 24];
    else if (term === 'short') selectedTerms = [1, 2, 3];
    else if (term === 'medium') selectedTerms = [6, 9, 12];
    else if (term === 'long') selectedTerms = [18, 24, 36];
    
    selectedTerms.forEach(t => {
      const rate = rates[t] || 0;
      const interest = calculateInterest(amount, rate, t, 'maturity');
      const total = amount + interest;
      const annualYield = (interest / amount) * (12 / t) * 100;
      
      let score = annualYield; // Base score
      
      // Ưu tiên CEP
      if (bank.startsWith('CEP')) {
        score = score * 1.3; // Boost 30% cho CEP
      }
      
      if (priority === 'rate') score = annualYield;
      else if (priority === 'flexibility') score = 100 / t; // Shorter = better
      else if (priority === 'bank') {
        const topBanks = ['Vietcombank', 'VietinBank', 'BIDV', 'Agribank'];
        if (topBanks.includes(bank)) score = annualYield * 1.2;
      }
      
      if (goal === 'income' && t < 6) score *= 0.8; // Prefer longer for income
      if (goal === 'emergency') score = (t <= 3) ? score * 1.5 : score * 0.5; // Prefer short
      
      recommendations.push({
        bank, term: t, rate, interest, total, annualYield, score
      });
    });
  });
  
  recommendations.sort((a, b) => b.score - a.score);
  const top = recommendations.slice(0, 6);
  
  renderAdvisorResults(top, amount, goal);
}

function renderAdvisorResults(recommendations, amount, goal) {
  const container = document.getElementById('advisor-results');
  const summary = document.getElementById('advisor-summary');
  const summaryText = document.getElementById('advisor-summary-text');
  
  if (recommendations.length === 0) {
    container.innerHTML = '<div class="text-gray-400 text-sm text-center py-12 bg-white rounded-xl border border-gray-100">Không tìm thấy sản phẩm phù hợp</div>';
    summary.classList.add('hidden');
    return;
  }
  
  const best = recommendations[0];
  const goalText = {
    'savings': 'tích lũy an toàn',
    'emergency': 'quỹ dự phòng linh hoạt',
    'investment': 'sinh lời tối đa',
    'income': 'thu nhập định kỳ'
  };
  
  summaryText.innerHTML = `
    <div class="font-bold text-lg mb-2">Phân Tích & Đề Xuất</div>
    <div class="text-sm leading-relaxed text-blue-100">
      Với số tiền <strong class="text-gold">${formatCurrency(amount)}</strong> và mục tiêu <strong class="text-gold">${goalText[goal]}</strong>, 
      chúng tôi đề xuất <strong class="text-gold">${best.bank} kỳ hạn ${best.term} tháng</strong> với lãi suất 
      <strong class="text-gold">${best.rate}%/năm</strong>. 
      Sau ${best.term} tháng, bạn sẽ nhận về <strong class="text-gold">${formatCurrency(best.total)}</strong> 
      (lãi ${formatCurrency(best.interest)}), hiệu suất ${best.annualYield.toFixed(2)}%/năm.
    </div>
  `;
  summary.classList.remove('hidden');
  
  container.innerHTML = recommendations.map((r, idx) => `
    <div class="advisor-card ${idx === 0 ? 'recommended' : ''}">
      ${idx === 0 ? '<div class="inline-flex items-center gap-1 text-xs font-bold text-gold mb-2"><i class="fa-solid fa-crown"></i> ĐỀ XUẤT HÀNG ĐẦU</div>' : ''}
      ${r.bank.startsWith('CEP') ? '<div class="inline-flex items-center gap-1 text-xs font-bold text-green-600 mb-2"><i class="fa-solid fa-star"></i> CEP - TỔ CHỨC TÀI CHÍNH VI MÔ</div>' : ''}
      <div class="flex items-start justify-between mb-3">
        <div>
          <h3 class="font-bold text-navy text-base">${r.bank}</h3>
          <div class="text-sm text-gray-500">Kỳ hạn ${r.term} tháng · ${r.rate}%/năm</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-500">Hiệu suất</div>
          <div class="text-lg font-bold text-green-600">${r.annualYield.toFixed(2)}%</div>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 text-xs mb-3">
        <div class="bg-gray-50 rounded p-2 text-center">
          <div class="text-gray-500">Tiền gửi</div>
          <div class="font-bold mt-1">${formatCurrency(amount, true)}</div>
        </div>
        <div class="bg-green-50 rounded p-2 text-center">
          <div class="text-gray-500">Lãi nhận</div>
          <div class="font-bold text-green-700 mt-1">${formatCurrency(r.interest, true)}</div>
        </div>
        <div class="bg-blue-50 rounded p-2 text-center">
          <div class="text-gray-500">Tổng cộng</div>
          <div class="font-bold text-blue-700 mt-1">${formatCurrency(r.total, true)}</div>
        </div>
      </div>
      <button onclick="applyAdvisorRecommendation('${r.bank}', ${r.term}, ${r.rate}, ${amount})" 
        class="w-full btn-navy py-2 rounded-lg text-sm font-semibold text-white">
        Chọn Sản Phẩm Này
      </button>
    </div>
  `).join('');
  
  // Chart
  renderAdvisorChart(recommendations.slice(0, 4));
}

function renderAdvisorChart(recommendations) {
  const ctx = document.getElementById('advisor-chart');
  const wrap = document.getElementById('advisor-chart-wrap');
  
  if (recommendations.length === 0) {
    wrap.classList.add('hidden');
    return;
  }
  
  wrap.classList.remove('hidden');
  
  if (advisorChart) advisorChart.destroy();
  
  const labels = recommendations.map(r => `${r.bank}\n${r.term}T`);
  const data = recommendations.map(r => r.interest);
  
  advisorChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Tiền lãi nhận được',
        data: data,
        backgroundColor: ['#e8a020', '#0f2d5e', '#3b82f6', '#10b981'],
        borderRadius: 6
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => 'Lãi: ' + formatCurrency(ctx.raw)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val) => formatCurrency(val, true)
          }
        }
      }
    }
  });
}

function applyAdvisorRecommendation(bank, term, rate, amount) {
  document.getElementById('form-bank').value = bank;
  document.getElementById('form-term').value = term;
  document.getElementById('form-rate').value = rate;
  document.getElementById('form-principal').value = formatMoneyValue(amount);
  document.getElementById('form-name').value = `Sổ TK ${bank} ${term}T - Tư vấn ${dayjs().format('DD/MM')}`;
  document.getElementById('form-start-date').value = dayjs().format('YYYY-MM-DD');
  
  openAddSavings();
  showToast('Đã điền sẵn thông tin từ tư vấn', 'success');
}

function selectRisk(btn, risk) {
  document.querySelectorAll('.risk-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  advisorRisk = risk;
}

// ===== RATES =====
function renderRatesTable() {
  const search = document.getElementById('rate-search').value.toLowerCase();
  const tbody = document.getElementById('rates-tbody');
  const terms = [0, 1, 3, 6, 9, 12, 18, 24, 36];
  
  let banks = Object.keys(bankRates).filter(b => b.toLowerCase().includes(search)).sort();
  
  if (banks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-gray-400 py-8">Không tìm thấy ngân hàng</td></tr>';
    return;
  }
  
  // Find best rate for each term
  const bestRates = {};
  terms.forEach(t => {
    bestRates[t] = Math.max(...banks.map(b => bankRates[b][t] || 0));
  });
  
  // Separate banks into auto-update and manual groups
  const autoUpdateBanks = banks.filter(b => AUTO_UPDATE_BANKS.includes(b));
  const manualBanks = banks.filter(b => !AUTO_UPDATE_BANKS.includes(b));
  const sortedBanks = [...autoUpdateBanks, ...manualBanks];
  
  tbody.innerHTML = sortedBanks.map(bank => {
    const rates = bankRates[bank];
    const hasAutoUpdate = AUTO_UPDATE_BANKS.includes(bank);
    const badge = hasAutoUpdate 
      ? '<span class="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full" title="Hỗ trợ cập nhật tự động">🔄 Auto</span>'
      : '<span class="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full" title="Chỉ nhập thủ công">📝 Manual</span>';
    
    return `
      <tr class="${hasAutoUpdate ? 'bg-green-50/30' : ''}">
        <td class="p-3 font-semibold text-navy">
          <div class="flex items-center">
            <span>${bank}</span>
            ${badge}
          </div>
        </td>
        ${terms.map(t => {
          const rate = rates[t] || 0;
          const isBest = rate === bestRates[t] && rate > 0;
          const label = rate > 0 ? rate.toFixed(2) : '—';
          return `<td class="rate-cell ${isBest ? 'rate-best' : ''}">${label}</td>`;
        }).join('')}
      </tr>
    `;
  }).join('');
  
  // Chart
  renderRatesChart(banks.slice(0, 5));
}

function renderRatesChart(banks) {
  const ctx = document.getElementById('rates-chart');
  const terms = [0, 1, 3, 6, 12, 24, 36];
  
  if (ratesChart) ratesChart.destroy();
  
  const datasets = banks.map((bank, idx) => {
    const colors = ['#0f2d5e', '#e8a020', '#3b82f6', '#10b981', '#f59e0b'];
    return {
      label: bank,
      data: terms.map(t => bankRates[bank][t] || 0),
      borderColor: colors[idx % colors.length],
      backgroundColor: colors[idx % colors.length] + '20',
      tension: 0.3,
      borderWidth: 2
    };
  });
  
  ratesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: terms.map(t => t === 0 ? 'KKH' : `${t}T`),
      datasets: datasets
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val) => val + '%'
          }
        }
      }
    }
  });
}

function openEditRates() {
  const form = document.getElementById('edit-rates-form');
  const terms = [0, 1, 2, 3, 6, 9, 12, 18, 24, 36];
  const banks = Object.keys(bankRates).sort();
  
  let html = '<table class="w-full text-sm"><thead><tr><th class="text-left p-2 border-b-2">Ngân Hàng</th>';
  terms.forEach(t => html += `<th class="text-center p-2 border-b-2">${t === 0 ? 'KKH' : t + 'T'}</th>`);
  html += '</tr></thead><tbody>';
  
  banks.forEach(bank => {
    html += `<tr><td class="p-2 font-semibold">${bank}</td>`;
    terms.forEach(t => {
      const rate = bankRates[bank][t] || 0;
      html += `<td class="p-2"><input type="number" step="0.01" class="input-field w-20 text-center" 
        data-bank="${bank}" data-term="${t}" value="${rate}"/></td>`;
    });
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  form.innerHTML = html;
  
  document.getElementById('modal-rates').classList.remove('hidden');
}

function saveEditedRates() {
  const inputs = document.querySelectorAll('#edit-rates-form input');
  inputs.forEach(input => {
    const bank = input.dataset.bank;
    const term = parseInt(input.dataset.term);
    const value = parseFloat(input.value) || 0;
    bankRates[bank][term] = value;
  });
  
  saveToStorage();
  renderRatesTable();
  closeModal('modal-rates');
  showToast('Đã cập nhật lãi suất thành công', 'success');
}

// ===== AUTO UPDATE RATES FROM API =====
async function autoUpdateRates() {
  const statusDiv = document.getElementById('update-status');
  const btn = document.getElementById('auto-update-btn');
  
  // Kiểm tra xem server có đang chạy không
  const API_URL = 'http://localhost:3000/api/rates/refresh';
  
  try {
    // Hiển thị trạng thái đang cập nhật
    statusDiv.classList.remove('hidden');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i><span class="hidden sm:inline">Đang cập nhật...</span><span class="sm:hidden">...</span>';
    
    // Gọi API để lấy lãi suất mới
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('API server không phản hồi. Vui lòng khởi động server trước.');
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      // Cập nhật bankRates với dữ liệu mới
      bankRates = { ...bankRates, ...result.data };
      
      // Lưu vào localStorage
      saveToStorage();
      
      // Render lại bảng
      renderRatesTable();
      
      // Hiển thị thông báo thành công
      const updatedCount = Object.keys(result.data).length;
      showToast(`✓ Đã cập nhật lãi suất từ ${updatedCount} ngân hàng!`, 'success');
      
      // Cập nhật thời gian cập nhật cuối
      const now = new Date().toLocaleString('vi-VN');
      statusDiv.innerHTML = `
        <i class="fa-solid fa-check-circle text-green-600"></i>
        <span class="text-sm text-green-700">Cập nhật thành công lúc ${now}</span>
      `;
      statusDiv.className = 'mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2';
      
      // Ẩn thông báo sau 5 giây
      setTimeout(() => {
        statusDiv.classList.add('hidden');
      }, 5000);
    } else {
      throw new Error(result.message || 'Không thể cập nhật lãi suất');
    }
    
  } catch (error) {
    console.error('Auto update error:', error);
    
    // Hiển thị lỗi
    statusDiv.innerHTML = `
      <i class="fa-solid fa-exclamation-triangle text-red-600"></i>
      <span class="text-sm text-red-700">${error.message}</span>
      <button onclick="this.parentElement.classList.add('hidden')" class="ml-auto text-red-600 hover:text-red-800">
        <i class="fa-solid fa-times"></i>
      </button>
    `;
    statusDiv.className = 'mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2';
    
    // Hướng dẫn khởi động server
    if (error.message.includes('server')) {
      showToast('⚠️ Vui lòng khởi động server bằng lệnh: npm start', 'warning', 8000);
    } else {
      showToast('✗ Lỗi: ' + error.message, 'error');
    }
  } finally {
    // Khôi phục nút
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-sync mr-1"></i><span class="hidden sm:inline">Cập Nhật Tự Động</span><span class="sm:hidden">Auto</span>';
  }
}

// ===== SAVINGS FORM =====
function openAddSavings() {
  currentEditingId = null;
  document.getElementById('modal-savings-title').textContent = 'Thêm Sổ Tiết Kiệm';
  document.getElementById('form-savings-id').value = '';
  document.getElementById('form-name').value = '';
  
  // Set CEP làm mặc định
  const cepBank = Object.keys(bankRates).find(b => b.startsWith('CEP'));
  document.getElementById('form-bank').value = cepBank || '';
  
  // Nếu chọn CEP, tự động điền lãi suất
  if (cepBank && bankRates[cepBank]) {
    document.getElementById('form-rate').value = bankRates[cepBank][12] || '5.80';
  } else {
    document.getElementById('form-rate').value = '';
  }
  
  document.getElementById('form-principal').value = '';
  document.getElementById('form-term').value = '12';
  document.getElementById('form-interest-type').value = 'maturity';
  document.getElementById('form-start-date').value = dayjs().format('YYYY-MM-DD');
  document.getElementById('form-demand-rate').value = '0.20';
  document.getElementById('form-account-no').value = '';
  document.getElementById('form-notes').value = '';
  document.getElementById('form-status').value = 'active';
  
  document.getElementById('modal-savings').classList.remove('hidden');
}

// Auto update rate when bank or term changes
function updateRateFromBank() {
  const bank = document.getElementById('form-bank').value;
  const term = parseInt(document.getElementById('form-term').value);
  const rateInput = document.getElementById('form-rate');
  
  if (bank && term && bankRates[bank] && bankRates[bank][term]) {
    rateInput.value = bankRates[bank][term];
    // Visual feedback
    rateInput.classList.add('bg-green-50', 'border-green-300');
    setTimeout(() => {
      rateInput.classList.remove('bg-green-50', 'border-green-300');
    }, 1000);
  }
}

function saveSavingsForm() {
  const name = document.getElementById('form-name').value.trim();
  const bank = document.getElementById('form-bank').value;
  const principal = parseMoney(document.getElementById('form-principal').value);
  const rate = parseFloat(document.getElementById('form-rate').value);
  const term = parseInt(document.getElementById('form-term').value);
  const interestType = document.getElementById('form-interest-type').value || 'maturity';
  const startDate = document.getElementById('form-start-date').value;
  const demandRate = parseFloat(document.getElementById('form-demand-rate').value) || 0.5;
  const accountNo = document.getElementById('form-account-no').value.trim();
  const notes = document.getElementById('form-notes').value.trim();
  const status = document.getElementById('form-status').value;
  
  if (!name || !bank || !principal || !rate || !startDate) {
    showToast('Vui lòng điền đầy đủ thông tin bắt buộc (*)', 'error');
    return;
  }
  
  // Kiểm tra trùng số sổ
  if (accountNo) {
    const duplicateExists = savings.some(s => {
      // Nếu đang sửa, bỏ qua sổ đang sửa
      if (currentEditingId && s.id === currentEditingId) {
        return false;
      }
      // Kiểm tra số sổ có trùng không (không phân biệt hoa thường)
      return s.accountNo && s.accountNo.toLowerCase() === accountNo.toLowerCase();
    });
    
    if (duplicateExists) {
      showToast(`Số sổ "${accountNo}" đã tồn tại! Vui lòng nhập số sổ khác.`, 'error');
      // Highlight input field
      const accountInput = document.getElementById('form-account-no');
      accountInput.classList.add('border-red-500', 'bg-red-50');
      accountInput.focus();
      setTimeout(() => {
        accountInput.classList.remove('border-red-500', 'bg-red-50');
      }, 3000);
      return;
    }
  }
  
  const maturityDate = dayjs(startDate).add(term, 'month').format('YYYY-MM-DD');
  
  if (currentEditingId) {
    // Edit
    const idx = savings.findIndex(s => s.id === currentEditingId);
    savings[idx] = {
      ...savings[idx],
      name, bank, principal, rate, term, interestType, startDate, maturityDate,
      demandRate, accountNo, notes, status
    };
    showToast('Đã cập nhật sổ tiết kiệm', 'success');
  } else {
    // Add
    const newSaving = {
      id: Date.now(),
      name, bank, principal, rate, term, interestType, startDate, maturityDate,
      demandRate, accountNo, notes, status,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    };
    savings.push(newSaving);
    showToast('Đã thêm sổ tiết kiệm mới', 'success');
  }
  
  saveToStorage();
  renderAll();
  closeModal('modal-savings');
}

function viewSavingDetail(id) {
  const s = savings.find(sv => sv.id === id);
  if (!s) return;
  
  const maturityInterest = calculateMaturityInterest(s);
  const currentInterest = calculateCurrentInterest(s);
  const days = getDaysUntilMaturity(s);
  const progress = calculateProgress(s);
  const status = getSavingStatus(s);
  
  const statusText = {
    'active': 'Đang gửi',
    'due-soon': 'Sắp đến hạn',
    'overdue': 'Quá hạn',
    'matured': 'Đã đáo hạn',
    'withdrawn': 'Đã rút'
  };
  
  const interestTypeText = {
    'maturity': 'Cuối kỳ (Đáo hạn)',
    'monthly': 'Hàng tháng',
    'quarterly': 'Định kỳ 3 tháng',
    'upfront': 'Đầu kỳ'
  };
  
  const content = `
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-navy to-blue-900 text-white rounded-xl p-5">
        <div class="text-sm text-blue-200 mb-1">Tổng Nhận Khi Đáo Hạn</div>
        <div class="text-3xl font-bold">${formatCurrency(s.principal + maturityInterest)}</div>
        <div class="text-sm text-blue-200 mt-2">Vốn ${formatCurrency(s.principal)} + Lãi ${formatCurrency(maturityInterest)}</div>
      </div>
      
      <table class="detail-table">
        <tr><td>Tên / Ghi chú:</td><td>${s.name}</td></tr>
        <tr><td>Ngân hàng:</td><td>${s.bank}</td></tr>
        <tr><td>Số tài khoản / Số sổ:</td><td>${s.accountNo || '—'}</td></tr>
        <tr><td>Số tiền gốc:</td><td class="text-navy">${formatCurrency(s.principal)}</td></tr>
        <tr><td>Lãi suất:</td><td class="text-green-600">${s.rate}%/năm</td></tr>
        <tr><td>Kỳ hạn:</td><td>${s.term} tháng</td></tr>
        <tr><td>Hình thức lãi:</td><td>${interestTypeText[s.interestType || 'maturity'] || 'Cuối kỳ (Đáo hạn)'}</td></tr>
        <tr><td>Ngày gửi:</td><td>${dayjs(s.startDate).format('DD/MM/YYYY')}</td></tr>
        <tr><td>Ngày đáo hạn:</td><td>${dayjs(s.maturityDate).format('DD/MM/YYYY')}</td></tr>
        <tr><td>Trạng thái:</td><td><span class="badge badge-${status}">${statusText[status]}</span></td></tr>
        <tr><td>Tiến độ:</td><td>${progress}% (${days >= 0 ? 'Còn ' + days + ' ngày' : 'Quá ' + Math.abs(days) + ' ngày'})</td></tr>
      </table>
      
      <div class="progress-bar h-3">
        <div class="progress-fill bg-gradient-to-r from-navy to-gold" style="width: ${progress}%"></div>
      </div>
      
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-xs text-blue-600 mb-1">${(s.interestType === 'monthly' || s.interestType === 'quarterly') ? 'Lãi Đã Nhận / Tích Lũy' : s.interestType === 'upfront' ? 'Lãi Đã Nhận (Đầu Kỳ)' : 'Lãi Tích Lũy Hiện Tại'}</div>
          <div class="text-lg font-bold text-blue-700">${formatCurrency(currentInterest)}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-xs text-green-600 mb-1">${s.interestType === 'monthly' ? 'Lãi/Tháng' : s.interestType === 'quarterly' ? 'Lãi/3 Tháng' : 'Lãi Khi Đáo Hạn'}</div>
          <div class="text-lg font-bold text-green-700">${s.interestType === 'monthly' ? formatCurrency(getMonthlyInterestAmount(s)) + '/tháng' : s.interestType === 'quarterly' ? formatCurrency(getMonthlyInterestAmount(s) * 3) + '/3T' : formatCurrency(maturityInterest)}</div>
        </div>
      </div>

      ${s.interestType === 'monthly' ? `
      <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div class="text-xs font-semibold text-indigo-700 mb-2"><i class="fa-solid fa-calendar-check mr-1"></i>Lịch Nhận Lãi Hàng Tháng</div>
        <div class="text-sm text-indigo-800">
          Ngày nhận lãi tiếp theo: <strong>${getNextInterestPaymentDate(s)?.format('DD/MM/YYYY') || '—'}</strong><br/>
          Mỗi tháng nhận: <strong>${formatCurrency(getMonthlyInterestAmount(s))}</strong>
        </div>
      </div>` : ''}
      ${s.interestType === 'quarterly' ? `
      <div class="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div class="text-xs font-semibold text-teal-700 mb-2"><i class="fa-solid fa-calendar-check mr-1"></i>Lịch Nhận Lãi Định Kỳ 3 Tháng</div>
        <div class="text-sm text-teal-800">
          Ngày nhận lãi tiếp theo: <strong>${getNextInterestPaymentDate(s)?.format('DD/MM/YYYY') || '—'}</strong><br/>
          Mỗi kỳ nhận (3 tháng): <strong>${formatCurrency(getMonthlyInterestAmount(s) * 3)}</strong>
        </div>
      </div>` : ''}
      
      ${s.notes ? `<div class="bg-gray-50 rounded-lg p-4"><div class="text-xs text-gray-500 mb-1">Ghi chú:</div><div class="text-sm">${s.notes}</div></div>` : ''}
      
      <div class="text-xs text-gray-400">
        Tạo lúc: ${s.createdAt || '—'} · ID: ${s.id}
      </div>
    </div>
  `;
  
  document.getElementById('modal-detail-title').textContent = s.name;
  document.getElementById('modal-detail-content').innerHTML = content;
  
  document.getElementById('detail-edit-btn').onclick = () => {
    closeModal('modal-detail');
    editSaving(id);
  };
  
  document.getElementById('detail-delete-btn').onclick = () => {
    if (confirm(`Bạn có chắc muốn xóa sổ tiết kiệm "${s.name}"?`)) {
      deleteSaving(id);
      closeModal('modal-detail');
    }
  };
  
  document.getElementById('modal-detail').classList.remove('hidden');
}

function editSaving(id) {
  const s = savings.find(sv => sv.id === id);
  if (!s) return;
  
  currentEditingId = id;
  document.getElementById('modal-savings-title').textContent = 'Chỉnh Sửa Sổ Tiết Kiệm';
  document.getElementById('form-savings-id').value = id;
  document.getElementById('form-name').value = s.name;
  document.getElementById('form-bank').value = s.bank;
  document.getElementById('form-principal').value = formatMoneyValue(s.principal);
  document.getElementById('form-rate').value = s.rate;
  document.getElementById('form-term').value = s.term;
  document.getElementById('form-interest-type').value = s.interestType || 'maturity';
  document.getElementById('form-start-date').value = s.startDate;
  document.getElementById('form-demand-rate').value = s.demandRate;
  document.getElementById('form-account-no').value = s.accountNo || '';
  document.getElementById('form-notes').value = s.notes || '';
  document.getElementById('form-status').value = s.status;
  
  document.getElementById('modal-savings').classList.remove('hidden');
}

function deleteSaving(id) {
  savings = savings.filter(s => s.id !== id);
  saveToStorage();
  renderAll();
  showToast('Đã xóa sổ tiết kiệm', 'success');
}

// ===== NOTIFICATIONS =====
function showNotifications() {
  const content = document.getElementById('notif-content');
  const alerts = [];
  const today = dayjs();
  
  savings.forEach(s => {
    if (s.status === 'matured' || s.status === 'withdrawn') return;
    
    const days = getDaysUntilMaturity(s);
    const sub = `${s.bank}${s.accountNo ? ` · #${s.accountNo}` : ''} · Gửi ${dayjs(s.startDate).format('DD/MM/YYYY')}`;

    if (days < 0) {
      alerts.push({
        type: 'error', icon: 'fa-circle-exclamation',
        title: s.name, sub,
        desc: `Đã quá hạn ${Math.abs(days)} ngày (${dayjs(s.maturityDate).format('DD/MM/YYYY')})`,
        time: s.maturityDate, id: s.id
      });
    } else if (days === 0) {
      alerts.push({
        type: 'warning', icon: 'fa-calendar-check',
        title: s.name, sub,
        desc: `Đến hạn hôm nay`,
        time: s.maturityDate, id: s.id
      });
    } else if (days <= 7) {
      alerts.push({
        type: 'warning', icon: 'fa-clock',
        title: s.name, sub,
        desc: `Sẽ đến hạn trong ${days} ngày (${dayjs(s.maturityDate).format('DD/MM/YYYY')})`,
        time: s.maturityDate, id: s.id
      });
    } else if (days <= settings.warnDays) {
      alerts.push({
        type: 'info', icon: 'fa-bell',
        title: s.name, sub,
        desc: `Còn ${days} ngày đến hạn (${dayjs(s.maturityDate).format('DD/MM/YYYY')})`,
        time: s.maturityDate, id: s.id
      });
    }

    // Nhận lãi hàng tháng
    if (s.interestType === 'monthly') {
      const monthly = getMonthlyInterestAmount(s);
      const nextPay = getNextInterestPaymentDate(s);
      if (nextPay) {
        const daysTo = nextPay.diff(today.startOf('day'), 'day');
        if (daysTo === 0) {
          alerts.push({
            type: 'success', icon: 'fa-money-bill-wave',
            title: s.name, sub,
            desc: `Hôm nay nhận lãi: ${formatCurrency(monthly)}`,
            time: nextPay.format('YYYY-MM-DD'), id: s.id
          });
        } else if (daysTo > 0 && daysTo <= settings.warnInterestDays) {
          alerts.push({
            type: 'info', icon: 'fa-calendar-check',
            title: s.name, sub,
            desc: `Còn ${daysTo} ngày nhận lãi: ${formatCurrency(monthly)} (${nextPay.format('DD/MM/YYYY')})`,
            time: nextPay.format('YYYY-MM-DD'), id: s.id
          });
        }
      }
    }
  });
  
  alerts.sort((a,b) => new Date(a.time) - new Date(b.time));
  
  if (alerts.length === 0) {
    content.innerHTML = '<div class="text-gray-400 text-sm text-center py-8">Không có thông báo nào</div>';
  } else {
    const colors = {
      error: 'bg-red-50 border-red-200',
      warning: 'bg-yellow-50 border-yellow-200',
      info: 'bg-blue-50 border-blue-200',
      success: 'bg-green-50 border-green-200'
    };
    const iconColors = {
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600',
      success: 'text-green-600'
    };
    
    content.innerHTML = alerts.map(a => `
      <div class="p-3 rounded-lg border ${colors[a.type]} flex items-start gap-3 ${a.id ? 'cursor-pointer hover:brightness-95' : ''}"
           ${a.id ? `onclick="closeModal('modal-notif'); viewSavingDetail(${a.id})"` : ''}>
        <i class="fa-solid ${a.icon} ${iconColors[a.type]} mt-1 flex-shrink-0"></i>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm text-gray-800">${a.title}</div>
          <div class="text-xs text-gray-500 mt-0.5">${a.sub}</div>
          <div class="text-xs text-gray-700 mt-1">${a.desc}</div>
        </div>
        ${a.id ? `<i class="fa-solid fa-chevron-right text-gray-300 self-center flex-shrink-0"></i>` : ''}
      </div>
    `).join('');
  }
  
  document.getElementById('modal-notif').classList.remove('hidden');
}

// ===== SETTINGS =====
document.getElementById('setting-warn-days')?.addEventListener('change', (e) => {
  settings.warnDays = parseInt(e.target.value);
  saveToStorage();
  renderAll();
});

document.getElementById('setting-warn-interest-days')?.addEventListener('change', (e) => {
  settings.warnInterestDays = parseInt(e.target.value);
  saveToStorage();
  renderAll();
});

document.getElementById('setting-loss-threshold')?.addEventListener('change', (e) => {
  settings.lossThreshold = parseInt(e.target.value);
  saveToStorage();
});

// ===== DATA MANAGEMENT =====
function exportData() {
  const data = { savings, bankRates, settings };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `savings-backup-${dayjs().format('YYYYMMDD-HHmmss')}.json`;
  a.click();
  
  // Lưu thời gian export để theo dõi
  updateLastExportDate();
  
  showToast('✓ Đã xuất dữ liệu thành công', 'success');
}

function importData() {
  document.getElementById('import-file').click();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.savings) savings = data.savings;
      if (data.bankRates) bankRates = data.bankRates;
      if (data.settings) settings = data.settings;
      
      // Normalize dữ liệu cũ - thêm giá trị mặc định cho interestType
      savings = savings.map(s => ({
        ...s,
        interestType: s.interestType || 'maturity'
      }));
      
      saveToStorage();
      renderAll();
      showToast('Đã nhập dữ liệu thành công', 'success');
    } catch(err) {
      showToast('File không hợp lệ', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function confirmClearData() {
  if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa TẤT CẢ dữ liệu? Hành động này không thể hoàn tác!')) {
    if (confirm('Xác nhận lần cuối: Xóa tất cả dữ liệu?')) {
      savings = [];
      bankRates = DEFAULT_BANK_RATES;
      settings = { warnDays: 30, lossThreshold: 10, warnInterestDays: 7 };
      saveToStorage();
      renderAll();
      showToast('Đã xóa tất cả dữ liệu', 'success');
    }
  }
}

// ===== BACKUP UI FUNCTIONS =====
function refreshBackupStatus() {
  renderBackupList();
  showBackupStatus();
  showToast('Đã làm mới trạng thái backup', 'success');
}

function renderBackupList() {
  try {
    const backupsStr = localStorage.getItem(BACKUP_CONFIG.autoBackupKey);
    const backups = backupsStr ? JSON.parse(backupsStr) : [];
    const container = document.getElementById('backup-list');
    
    if (!container) return;
    
    if (backups.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-gray-400 text-sm">
          <i class="fa-solid fa-inbox text-2xl mb-2"></i>
          <div>Chưa có auto-backup nào</div>
        </div>
      `;
      return;
    }
    
    let html = '<div class="space-y-2">';
    html += '<h3 class="font-medium text-sm text-gray-700 mb-2">Danh Sách Auto-Backup:</h3>';
    
    backups.forEach((backup, index) => {
      const date = dayjs(backup.timestamp);
      const isLatest = index === 0;
      
      html += `
        <div class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-clock-rotate-left text-blue-500"></i>
            <div>
              <div class="font-medium">${date.format('DD/MM/YYYY HH:mm:ss')}</div>
              <div class="text-xs text-gray-500">
                ${backup.itemCount} sổ tiết kiệm
                ${isLatest ? '<span class="ml-2 text-green-600 font-semibold">● Mới nhất</span>' : ''}
              </div>
            </div>
          </div>
          <button onclick="restoreFromBackup(${index})" 
                  class="px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600">
            <i class="fa-solid fa-rotate-left mr-1"></i> Khôi phục
          </button>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  } catch (e) {
    console.error('Lỗi render backup list:', e);
  }
}

// Call renderBackupList when Settings page is shown
function showSettingsPage() {
  renderBackupList();
  showBackupStatus();
}

// ===== UPLOAD SAVINGS LIST =====
function uploadSavingsList() {
  document.getElementById('upload-savings-file').click();
}

function handleUploadSavings(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const fileName = file.name.toLowerCase();
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      let data = [];
      
      if (fileName.endsWith('.json')) {
        // JSON format
        const jsonData = JSON.parse(e.target.result);
        data = Array.isArray(jsonData) ? jsonData : (jsonData.savings || []);
      } else if (fileName.endsWith('.csv')) {
        // CSV format
        data = parseCSVFile(e.target.result);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Excel format
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        data = normalizeImportData(jsonData);
      }
      
      if (data.length === 0) {
        showToast('Không tìm thấy dữ liệu trong file', 'warning');
        return;
      }
      
      // Validate and preview
      const validData = validateImportData(data);
      if (validData.length === 0) {
        showToast('Không có dữ liệu hợp lệ để import', 'error');
        return;
      }
      
      previewData = validData;
      showPreviewModal(validData);
      
    } catch(err) {
      console.error(err);
      showToast('Lỗi khi đọc file: ' + err.message, 'error');
    }
  };
  
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    reader.readAsBinaryString(file);
  } else {
    reader.readAsText(file);
  }
  
  event.target.value = '';
}

function parseCSVFile(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });
    data.push(obj);
  }
  
  return normalizeImportData(data);
}

function normalizeImportData(data) {
  // Map các tên cột khác nhau về tên chuẩn
  const fieldMap = {
    'tên': 'name',
    'ten': 'name',
    'name': 'name',
    'ghi chú': 'name',
    'ghi_chu': 'name',
    
    'ngân hàng': 'bank',
    'ngan_hang': 'bank',
    'bank': 'bank',
    
    'số tiền': 'principal',
    'so_tien': 'principal',
    'tiền gốc': 'principal',
    'tien_goc': 'principal',
    'principal': 'principal',
    'amount': 'principal',
    
    'lãi suất': 'rate',
    'lai_suat': 'rate',
    'rate': 'rate',
    'interest_rate': 'rate',
    
    'kỳ hạn': 'term',
    'ky_han': 'term',
    'term': 'term',
    
    'ngày gửi': 'startDate',
    'ngay_gui': 'startDate',
    'start_date': 'startDate',
    'date': 'startDate',
    
    'hình thức lãi': 'interestType',
    'hinh_thuc_lai': 'interestType',
    'interest_type': 'interestType',
    
    'lãi suất không kỳ hạn': 'demandRate',
    'lai_suat_khong_ky_han': 'demandRate',
    'demand_rate': 'demandRate',
    
    'số tài khoản': 'accountNo',
    'so_tai_khoan': 'accountNo',
    'account_no': 'accountNo',
    
    'ghi chú thêm': 'notes',
    'notes': 'notes',
    
    'trạng thái': 'status',
    'trang_thai': 'status',
    'status': 'status'
  };
  
  return data.map(row => {
    const normalized = {};
    
    Object.keys(row).forEach(key => {
      const lowerKey = key.toLowerCase().trim();
      const mappedKey = fieldMap[lowerKey];
      if (mappedKey) {
        normalized[mappedKey] = row[key];
      }
    });
    
    return normalized;
  });
}

function validateImportData(data) {
  const validated = [];
  
  data.forEach((row, idx) => {
    // Required fields
    if (!row.name || !row.bank || !row.principal || !row.rate) {
      console.warn(`Row ${idx + 1} bị bỏ qua: thiếu thông tin bắt buộc`);
      return;
    }
    
    const saving = {
      id: Date.now() + idx,
      name: String(row.name).trim(),
      bank: String(row.bank).trim(),
      principal: parseFloat(String(row.principal).replace(/[,\.]/g, '')) || 0,
      rate: parseFloat(String(row.rate).replace(/[,%]/g, '')) || 0,
      term: parseInt(row.term) || 12,
      interestType: row.interestType || 'maturity',
      startDate: parseDate(row.startDate) || dayjs().format('YYYY-MM-DD'),
      demandRate: parseFloat(row.demandRate) || 0.5,
      accountNo: String(row.accountNo || '').trim(),
      notes: row.notes || '',
      status: row.status || 'active',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      isDuplicate: false // Flag để đánh dấu trùng số sổ
    };
    
    // Calculate maturity date
    saving.maturityDate = dayjs(saving.startDate).add(saving.term, 'month').format('YYYY-MM-DD');
    
    // Kiểm tra trùng số sổ với dữ liệu hiện tại
    if (saving.accountNo) {
      const existsInCurrent = savings.some(s => 
        s.accountNo && s.accountNo.toLowerCase() === saving.accountNo.toLowerCase()
      );
      
      // Kiểm tra trùng trong chính file import
      const existsInImport = validated.some(s => 
        s.accountNo && s.accountNo.toLowerCase() === saving.accountNo.toLowerCase()
      );
      
      if (existsInCurrent || existsInImport) {
        saving.isDuplicate = true;
        saving.duplicateReason = existsInCurrent ? 'Trùng với dữ liệu hiện có' : 'Trùng trong file import';
      }
    }
    
    if (saving.principal > 0 && saving.rate > 0) {
      validated.push(saving);
    }
  });
  
  return validated;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Try various date formats
  const str = String(dateStr).trim();
  
  // YYYY-MM-DD (ISO format - internal storage)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  
  // DD/MM/YYYY (Định dạng chuẩn hiển thị - ưu tiên)
  const match = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  
  // Excel serial date (số nguyên hoặc số thập phân)
  if (/^\d+(\.\d+)?$/.test(str)) {
    const excelDate = parseFloat(str);
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return dayjs(date).format('YYYY-MM-DD');
  }
  
  // Fallback: thử parse bằng dayjs
  return dayjs(str).format('YYYY-MM-DD');
}

function showPreviewModal(data) {
  const preview = document.getElementById('preview-content');
  const duplicateCount = data.filter(s => s.isDuplicate).length;
  const validCount = data.length - duplicateCount;
  
  document.getElementById('preview-count').textContent = `${data.length}`;
  
  const html = `
    ${duplicateCount > 0 ? `
    <div class="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm">
      <div class="flex items-start gap-2">
        <i class="fa-solid fa-triangle-exclamation text-yellow-600 mt-0.5"></i>
        <div>
          <div class="font-semibold text-yellow-800 mb-1">Phát hiện ${duplicateCount} sổ bị trùng số!</div>
          <div class="text-yellow-700">Các sổ bị trùng (màu đỏ) sẽ bị bỏ qua khi import. Chỉ ${validCount} sổ hợp lệ sẽ được thêm vào.</div>
        </div>
      </div>
    </div>
    ` : ''}
    <table class="w-full text-xs border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 text-left border">STT</th>
          <th class="p-2 text-left border">Tên</th>
          <th class="p-2 text-left border">Ngân Hàng</th>
          <th class="p-2 text-left border">Số TK</th>
          <th class="p-2 text-right border">Số Tiền</th>
          <th class="p-2 text-center border">Lãi Suất</th>
          <th class="p-2 text-center border">Kỳ Hạn</th>
          <th class="p-2 text-center border">Ngày Gửi</th>
          <th class="p-2 text-center border">Đáo Hạn</th>
          <th class="p-2 text-center border">Trạng Thái</th>
        </tr>
      </thead>
      <tbody>
        ${data.map((s, idx) => `
          <tr class="${s.isDuplicate ? 'bg-red-50' : (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50')}">
            <td class="p-2 border ${s.isDuplicate ? 'text-red-600' : ''}">${idx + 1}</td>
            <td class="p-2 border font-medium ${s.isDuplicate ? 'text-red-600' : ''}">${s.name}</td>
            <td class="p-2 border ${s.isDuplicate ? 'text-red-600' : ''}">${s.bank}</td>
            <td class="p-2 border ${s.isDuplicate ? 'text-red-600 font-semibold' : 'text-gray-600'}">
              ${s.accountNo || '—'}
              ${s.isDuplicate ? '<i class="fa-solid fa-triangle-exclamation ml-1 text-red-500" title="' + s.duplicateReason + '"></i>' : ''}
            </td>
            <td class="p-2 border text-right font-semibold ${s.isDuplicate ? 'text-red-600' : 'text-navy'}">${formatCurrency(s.principal, true)}</td>
            <td class="p-2 border text-center ${s.isDuplicate ? 'text-red-600' : 'text-green-600'} font-semibold">${s.rate}%</td>
            <td class="p-2 border text-center ${s.isDuplicate ? 'text-red-600' : ''}">${s.term}T</td>
            <td class="p-2 border text-center ${s.isDuplicate ? 'text-red-600' : ''}">${dayjs(s.startDate).format('DD/MM/YYYY')}</td>
            <td class="p-2 border text-center ${s.isDuplicate ? 'text-red-600' : ''}">${dayjs(s.maturityDate).format('DD/MM/YYYY')}</td>
            <td class="p-2 border text-center text-xs">
              ${s.isDuplicate ? '<span class="text-red-600 font-semibold">✗ Bỏ qua</span>' : '<span class="text-green-600 font-semibold">✓ OK</span>'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  preview.innerHTML = html;
  document.getElementById('modal-preview').classList.remove('hidden');
}

function confirmImportSavings() {
  const mode = document.querySelector('input[name="import-mode"]:checked').value;
  
  if (mode === 'replace') {
    if (!confirm('Bạn có chắc muốn THAY THẾ toàn bộ dữ liệu hiện tại?')) {
      return;
    }
    savings = [];
  }
  
  // Lọc và chỉ thêm các sổ không bị trùng
  const validSavings = previewData.filter(s => !s.isDuplicate);
  const skippedCount = previewData.length - validSavings.length;
  
  // Add imported savings (remove isDuplicate and duplicateReason fields)
  validSavings.forEach(s => {
    const { isDuplicate, duplicateReason, ...cleanSaving } = s;
    savings.push(cleanSaving);
  });
  
  saveToStorage();
  renderAll();
  closeModal('modal-preview');
  
  if (skippedCount > 0) {
    showToast(
      `Đã import ${validSavings.length} sổ tiết kiệm. Bỏ qua ${skippedCount} sổ bị trùng số.`, 
      'warning'
    );
  } else {
    showToast(`Đã import ${validSavings.length} sổ tiết kiệm thành công`, 'success');
  }
  
  previewData = [];
}

function downloadTemplate() {
  // Create sample Excel file
  const template = [
    {
      'Tên': 'Sổ TK CEP 12 tháng - Huy động vốn',
      'Ngân Hàng': 'CEP - Tổ chức Tài chính Vi mô',
      'Số Tiền': 50000000,
      'Lãi Suất': 5.80,
      'Kỳ Hạn': 12,
      'Ngày Gửi': '01/01/2026',
      'Hình Thức Lãi': 'maturity',
      'Lãi Suất Không KH': 0.20,
      'Số Tài Khoản': 'CEP001234567',
      'Ghi Chú': 'Sổ tiết kiệm CEP lãi suất ưu đãi',
      'Trạng Thái': 'active'
    },
    {
      'Tên': 'Sổ TK CEP 6 tháng - Tiết kiệm linh hoạt',
      'Ngân Hàng': 'CEP - Tổ chức Tài chính Vi mô',
      'Số Tiền': 30000000,
      'Lãi Suất': 5.40,
      'Kỳ Hạn': 6,
      'Ngày Gửi': '01/02/2026',
      'Hình Thức Lãi': 'maturity',
      'Lãi Suất Không KH': 0.20,
      'Số Tài Khoản': 'CEP001234568',
      'Ghi Chú': 'Kỳ hạn ngắn',
      'Trạng Thái': 'active'
    }
  ];
  
  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Sổ TK');
  
  // Auto-size columns
  const colWidths = [
    { wch: 25 }, // Tên
    { wch: 15 }, // Ngân Hàng
    { wch: 12 }, // Số Tiền
    { wch: 10 }, // Lãi Suất
    { wch: 8 },  // Kỳ Hạn
    { wch: 12 }, // Ngày Gửi
    { wch: 12 }, // Hình Thức Lãi
    { wch: 12 }, // Lãi Suất KKH
    { wch: 15 }, // Số TK
    { wch: 20 }, // Ghi Chú
    { wch: 10 }  // Trạng Thái
  ];
  ws['!cols'] = colWidths;
  
  XLSX.writeFile(wb, 'mau-danh-sach-so-tiet-kiem.xlsx');
  showToast('Đã tải file mẫu thành công', 'success');
}

// ===== CALCULATIONS =====
function calculateInterest(principal, rate, term, interestType) {
  return (principal * rate / 100 / 12) * term;
}

function calculateMaturityInterest(saving) {
  return calculateInterest(saving.principal, saving.rate, saving.term, saving.interestType);
}

// Lãi hàng tháng mỗi kỳ
function getMonthlyInterestAmount(saving) {
  return saving.principal * saving.rate / 100 / 12;
}

// Ngày nhận lãi tiếp theo (dùng cho interestType === 'monthly' hoặc 'quarterly')
function getNextInterestPaymentDate(saving) {
  if (saving.interestType !== 'monthly' && saving.interestType !== 'quarterly') return null;
  
  const start = dayjs(saving.startDate);
  const maturity = dayjs(saving.maturityDate);
  const todayStart = dayjs().startOf('day');
  
  const period = saving.interestType === 'quarterly' ? 3 : 1;
  let candidate = start.add(period, 'month');
  
  while (candidate.isBefore(todayStart)) {
    candidate = candidate.add(period, 'month');
  }
  
  return candidate.isAfter(maturity) ? maturity : candidate;
}

function calculateCurrentInterest(saving) {
  const start = dayjs(saving.startDate);
  const today = dayjs();
  const maturity = dayjs(saving.maturityDate);

  if (saving.interestType === 'upfront') {
    // Lãi đã nhận toàn bộ từ ngày đầu
    return calculateMaturityInterest(saving);
  }

  if (saving.interestType === 'monthly' || saving.interestType === 'quarterly') {
    // Số tháng hoàn chỉnh đã qua => đã nhận lãi
    const ref = today.isAfter(maturity) ? maturity : today;
    const period = saving.interestType === 'quarterly' ? 3 : 1;
    const completedPeriods = Math.floor(ref.diff(start, 'month', true) / period);
    const periodInterest = getMonthlyInterestAmount(saving) * period;
    // Lãi đã nhận + lãi đang tích lũy trong kỳ hiện tại
    const lastPayDate = start.add(completedPeriods * period, 'month');
    const nextPayDate = lastPayDate.add(period, 'month').isAfter(maturity)
      ? maturity : lastPayDate.add(period, 'month');
    const daysInPeriod = nextPayDate.diff(lastPayDate, 'day');
    const daysElapsedInPeriod = daysInPeriod > 0 ? Math.min(ref.diff(lastPayDate, 'day'), daysInPeriod) : 0;
    const accruingPartial = daysInPeriod > 0 ? (periodInterest * daysElapsedInPeriod / daysInPeriod) : 0;
    return completedPeriods * periodInterest + accruingPartial;
  }

  // maturity: phân bổ tuyến tính
  if (today.isAfter(maturity)) return calculateMaturityInterest(saving);
  const daysElapsed = today.diff(start, 'day');
  const totalDays = maturity.diff(start, 'day');
  if (totalDays === 0) return 0;
  return (calculateMaturityInterest(saving) * daysElapsed) / totalDays;
}

function getDaysUntilMaturity(saving) {
  return dayjs(saving.maturityDate).diff(dayjs(), 'day');
}

function calculateProgress(saving) {
  const start = dayjs(saving.startDate);
  const today = dayjs();
  const maturity = dayjs(saving.maturityDate);
  
  const total = maturity.diff(start, 'day');
  const elapsed = today.diff(start, 'day');
  
  if (elapsed <= 0) return 0;
  if (elapsed >= total) return 100;
  
  return Math.round((elapsed / total) * 100);
}

function getSavingStatus(saving) {
  if (saving.status === 'matured' || saving.status === 'withdrawn') {
    return saving.status;
  }
  
  const days = getDaysUntilMaturity(saving);
  
  if (days < 0) return 'overdue';
  if (days <= settings.warnDays) return 'due-soon';
  return 'active';
}

// ===== ALERTS =====
function checkAlerts() {
  // This runs on init to update status
  savings.forEach(s => {
    const status = getSavingStatus(s);
    if (s.status !== status && s.status !== 'matured' && s.status !== 'withdrawn') {
      s.status = status;
    }
  });
  saveToStorage();
}

// ===== UTILITIES =====
function formatCurrency(value, short = false) {
  if (short) {
    if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B';
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value);
}

function generateColors(count) {
  const palette = [
    '#0f2d5e', '#e8a020', '#3b82f6', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
  ];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(palette[i % palette.length]);
  }
  return result;
}

// ===== MODAL CONTROLS =====
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// ===== TOAST =====
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  const msg = document.getElementById('toast-msg');
  
  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };
  
  icon.className = `fa-solid ${icons[type]}`;
  msg.textContent = message;
  toast.className = `toast ${type} fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2`;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Close modals on outside click
document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });
});
