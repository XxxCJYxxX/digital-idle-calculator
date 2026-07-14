// utils/constants.js — 常量定义

// 预设设备分类
const PRESET_CATEGORIES = [
  '手机', '平板', '笔记本电脑', '台式机',
  '相机', '耳机', '智能手表', '游戏主机', '无人机', '其他'
];

// 排序选项
const SORT_OPTIONS = [
  { label: '购入时间 ↓', value: 'purchaseDate-desc' },
  { label: '购入时间 ↑', value: 'purchaseDate-asc' },
  { label: '日均损耗 ↓', value: 'dailyCost-desc' },
  { label: '日均损耗 ↑', value: 'dailyCost-asc' },
  { label: '总闲置成本 ↓', value: 'totalCost-desc' },
  { label: '总闲置成本 ↑', value: 'totalCost-asc' },
  { label: '保修到期 ↑', value: 'warrantyEnd-asc' },
  { label: '保修到期 ↓', value: 'warrantyEnd-desc' },
];

// 保修状态阈值
const WARRANTY_STATUS = {
  SAFE: 'safe',       // > 90天
  WARNING: 'warning', // 30-90天
  DANGER: 'danger',   // ≤ 30天 或已过期
};

// 图表配色（浅色）
const CHART_COLORS_LIGHT = [
  '#007AFF', '#AF52DE', '#34C759', '#FF9500', '#FF3B30',
  '#5AC8FA', '#FFCC00', '#FF6482', '#32D74B', '#BF5AF2'
];

// 图表配色（深色）
const CHART_COLORS_DARK = [
  '#0A84FF', '#BF5AF2', '#30D158', '#FF9F0A', '#FF453A',
  '#64D2FF', '#FFD60A', '#FF6482', '#32D74B', '#BF5AF2'
];

module.exports = {
  PRESET_CATEGORIES,
  SORT_OPTIONS,
  WARRANTY_STATUS,
  CHART_COLORS_LIGHT,
  CHART_COLORS_DARK,
};
