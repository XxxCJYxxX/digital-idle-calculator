// pages/compare/compare.js — 多设备对比
const app = getApp();
const calc = require('../../utils/calculator');

Page({
  data: {
    devices: [],
    isEmpty: true,
    totalDevices: 0,
    totalCost: '—',
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    this.refreshData();
  },

  refreshData() {
    const devices = app.getDevices();
    const computed = devices.map((d) => calc.computeDevice(d)).filter(Boolean);

    if (computed.length === 0) {
      this.setData({ isEmpty: true, devices: [], totalDevices: 0 });
      return;
    }

    const totalCost = computed.reduce((s, d) => s + d.totalCost, 0);

    // 格式化每行显示
    const rows = computed.map((d) => ({
      ...d,
      priceText: '¥' + calc.fmtPrice(d.purchasePrice),
      dailyText: '¥' + calc.fmtPrice(d.dailyCost),
      totalText: '¥' + calc.fmtPrice(d.totalCost),
      dateText: calc.fmtDate(d.purchaseDate),
      warrantyLabel: d.warrantyRemain !== null ? calc.warrantyText(d.warrantyRemain) : '—',
      acLabel: d.appleCareRemain !== null ? calc.warrantyText(d.appleCareRemain) : '—',
      warrantyStatus: calc.warrantyStatus(d.warrantyRemain),
      acStatus: calc.warrantyStatus(d.appleCareRemain),
    }));

    this.setData({
      isEmpty: false,
      devices: rows,
      totalDevices: computed.length,
      totalCost: calc.fmtPrice(totalCost),
    });
  },
});
