// utils/calculator.js — 闲置成本计算逻辑

const { WARRANTY_STATUS } = require('./constants');

/**
 * 获取今日日期 YYYY-MM-DD
 */
function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 计算两个日期间隔天数
 */
function daysBetween(d1, d2) {
  if (!d1 || !d2) return 0;
  const t1 = new Date(d1).getTime();
  const t2 = new Date(d2).getTime();
  return Math.max(0, Math.floor((t2 - t1) / 86400000));
}

/**
 * 格式化日期显示
 */
function fmtDate(d) {
  if (!d) return '—';
  if (typeof d === 'string' && d.includes('-')) {
    const parts = d.split('-');
    return `${parseInt(parts[1])}月${parseInt(parts[2])}日`;
  }
  return d;
}

/**
 * 格式化金额
 */
function fmtPrice(n) {
  if (isNaN(n) || n === null || n === undefined) return '—';
  return Number(n).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * 计算单台设备的闲置指标
 */
function computeDevice(device) {
  if (!device) return null;
  const today = getToday();
  const totalDays = Math.max(1, daysBetween(device.purchaseDate, today));
  const dailyCost = (device.purchasePrice || 0) / totalDays;
  const totalCost = device.purchasePrice || 0; // 100% 闲置假设
  const warrantyRemain = device.warrantyEnd
    ? daysBetween(today, device.warrantyEnd)
    : null;
  const appleCareRemain = device.appleCareEnd
    ? daysBetween(today, device.appleCareEnd)
    : null;

  return {
    ...device,
    totalDays,
    dailyCost,
    totalCost,
    warrantyRemain,
    appleCareRemain,
  };
}

/**
 * 获取保修状态
 */
function warrantyStatus(days) {
  if (days === null || days === undefined) return null;
  if (days > 90) return WARRANTY_STATUS.SAFE;
  if (days > 30) return WARRANTY_STATUS.WARNING;
  return WARRANTY_STATUS.DANGER;
}

/**
 * 获取保修状态颜色
 */
function warrantyColor(days, isDark) {
  const status = warrantyStatus(days);
  if (status === WARRANTY_STATUS.SAFE) return isDark ? '#30D158' : '#34C759';
  if (status === WARRANTY_STATUS.WARNING) return isDark ? '#FF9F0A' : '#FF9500';
  return isDark ? '#FF453A' : '#FF3B30';
}

/**
 * 保修剩余文本
 */
function warrantyText(days) {
  if (days === null || days === undefined) return null;
  if (days <= 0) return '已过期';
  if (days <= 30) return `${days}天`;
  if (days <= 90) return `${days}天`;
  const y = Math.floor(days / 365);
  const m = Math.floor((days % 365) / 30);
  const d = days % 30;
  const parts = [];
  if (y > 0) parts.push(`${y}年`);
  if (m > 0) parts.push(`${m}个月`);
  if (parts.length === 0 && d > 0) parts.push(`${d}天`);
  return parts.join('') || `${d}天`;
}

/**
 * 过滤并排序设备列表
 */
function filterAndSort(devices, catFilter, sortVal) {
  let list = devices.map(computeDevice).filter(Boolean);

  // 分类过滤
  if (catFilter) {
    list = list.filter((d) => d.category === catFilter);
  }

  // 排序
  if (sortVal) {
    const [field, dir] = sortVal.split('-');
    const mult = dir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      let va, vb;
      switch (field) {
        case 'purchaseDate':
          va = a.purchaseDate || '';
          vb = b.purchaseDate || '';
          break;
        case 'dailyCost':
          va = a.dailyCost;
          vb = b.dailyCost;
          break;
        case 'totalCost':
          va = a.totalCost;
          vb = b.totalCost;
          break;
        case 'warrantyEnd':
          va = a.warrantyRemain ?? -99999;
          vb = b.warrantyRemain ?? -99999;
          break;
        default:
          va = 0;
          vb = 0;
      }
      if (va < vb) return -1 * mult;
      if (va > vb) return 1 * mult;
      return 0;
    });
  }
  return list;
}

module.exports = {
  getToday,
  daysBetween,
  fmtDate,
  fmtPrice,
  computeDevice,
  warrantyStatus,
  warrantyColor,
  warrantyText,
  filterAndSort,
};
