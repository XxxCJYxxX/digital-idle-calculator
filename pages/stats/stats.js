// pages/stats/stats.js — 可视化统计
const app = getApp();
const calc = require('../../utils/calculator');

Page({
  data: {
    isDark: false,
    devices: [],
    idleData: [],
    costData: [],
    isEmpty: true,
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    this.refreshTheme();
    this.refreshData();
  },

  refreshTheme() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ isDark: sysInfo.theme === 'dark' });
  },

  refreshData() {
    const devices = app.getDevices();
    const computed = devices.map((d) => calc.computeDevice(d)).filter(Boolean);

    if (computed.length === 0) {
      this.setData({ isEmpty: true, idleData: [], costData: [] });
      return;
    }

    // 闲置天数数据
    const idleData = computed.map((d) => ({
      label: d.name,
      value: d.totalDays,
    }));

    // 日均损耗数据
    const costData = computed.map((d) => ({
      label: d.name,
      value: Math.round(d.dailyCost * 100) / 100,
    }));

    const totalCost = computed.reduce((s, d) => s + d.totalCost, 0);

    this.setData({
      isEmpty: false,
      devices: computed,
      idleData,
      costData,
      totalCost: calc.fmtPrice(totalCost),
    });
  },
});
