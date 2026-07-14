// app.js — 电子产品吃灰计算器
const storage = require('./utils/storage');
const { PRESET_CATEGORIES } = require('./utils/constants');

App({
  globalData: {
    devices: [],
    categories: [],
    isDark: false,
  },

  onLaunch() {
    // 检测系统主题
    const sysInfo = wx.getSystemInfoSync();
    this.globalData.isDark = sysInfo.theme === 'dark';

    // 监听主题变化
    wx.onThemeChange((res) => {
      this.globalData.isDark = res.theme === 'dark';
    });

    // 初始化分类数据
    this.initCategories();
  },

  onShow() {
    this.loadData();
  },

  // 初始化预设分类
  initCategories() {
    let cats = storage.getCategories();
    if (cats.length === 0) {
      cats = PRESET_CATEGORIES.map((name) => ({
        id: `preset_${name}`,
        name,
        isPreset: true,
      }));
      storage.saveCategories(cats);
    }
    this.globalData.categories = cats;
  },

  // 从 Storage 加载全量数据
  loadData() {
    this.globalData.devices = storage.getDevices();
    this.globalData.categories = storage.getCategories();
  },

  // 刷新数据（页面 onShow 时调用）
  refresh() {
    this.loadData();
  },

  getDevices() {
    return this.globalData.devices;
  },

  getCategories() {
    return this.globalData.categories;
  },

  isDarkMode() {
    return this.globalData.isDark;
  },
});
