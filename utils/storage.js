// utils/storage.js — wx.Storage 封装

const DEVICES_KEY = 'idle_devices';
const CATEGORIES_KEY = 'idle_categories';

/** 获取设备列表 */
function getDevices() {
  try {
    const data = wx.getStorageSync(DEVICES_KEY);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('读取设备数据失败:', e);
    return [];
  }
}

/** 保存设备列表 */
function saveDevices(devices) {
  try {
    wx.setStorageSync(DEVICES_KEY, devices);
  } catch (e) {
    console.error('保存设备数据失败:', e);
  }
}

/** 获取分类列表 */
function getCategories() {
  try {
    const data = wx.getStorageSync(CATEGORIES_KEY);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('读取分类数据失败:', e);
    return [];
  }
}

/** 保存分类列表 */
function saveCategories(categories) {
  try {
    wx.setStorageSync(CATEGORIES_KEY, categories);
  } catch (e) {
    console.error('保存分类数据失败:', e);
  }
}

/** 清除全部数据 */
function clearAll() {
  try {
    wx.removeStorageSync(DEVICES_KEY);
    wx.removeStorageSync(CATEGORIES_KEY);
    return true;
  } catch (e) {
    console.error('清除数据失败:', e);
    return false;
  }
}

module.exports = {
  getDevices,
  saveDevices,
  getCategories,
  saveCategories,
  clearAll,
};
