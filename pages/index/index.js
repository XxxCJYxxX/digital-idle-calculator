// pages/index/index.js — 设备列表
const app = getApp();
const storage = require('../../utils/storage');
const { SORT_OPTIONS } = require('../../utils/constants');
const calc = require('../../utils/calculator');

Page({
  data: {
    isDark: false,
    devices: [],
    categories: [],
    catFilter: '',
    catFilterLabel: '全部分类',
    catFilterIndex: 0,
    sortVal: 'purchaseDate-desc',
    sortLabel: '购入时间 ↓',
    sortIndex: 0,
    categoryOptions: [],
    sortOptions: SORT_OPTIONS,
    formVisible: false,
    editDevice: null,
    statsSummary: { totalDevices: 0, totalValue: '—', avgDaily: '—', expiringCount: 0 },
  },

  onLoad() {
    this.refreshTheme();
  },

  onShow() {
    // 更新自定义 tabBar 选中态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    app.refresh();
    this.refreshData();
    this.refreshTheme();
    this.startTimer();
  },

  onHide() {
    this.stopTimer();
  },

  onUnload() {
    this.stopTimer();
  },

  refreshTheme() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({ isDark: sysInfo.theme === 'dark' });
  },

  refreshData() {
    const rawDevices = app.getDevices();
    const categories = app.getCategories();
    const catNames = categories.map((c) => c.name);

    // 筛选选项
    const catOpts = [{ label: '全部分类', value: '' }];
    catNames.forEach((n) => catOpts.push({ label: n, value: n }));

    // 过滤排序
    const computed = rawDevices.map((d) => calc.computeDevice(d)).filter(Boolean);
    const filtered = calc.filterAndSort(rawDevices, this.data.catFilter, this.data.sortVal);

    // 概览统计
    const totalDevices = computed.length;
    const totalValue = computed.reduce((s, d) => s + d.totalCost, 0);
    const avgDaily = totalDevices > 0
      ? computed.reduce((s, d) => s + d.dailyCost, 0) / totalDevices
      : 0;
    const expiringCount = computed.filter((d) => d.warrantyRemain !== null && d.warrantyRemain <= 30 && d.warrantyRemain >= 0).length;

    this.setData({
      devices: filtered,
      categories,
      categoryOptions: catOpts,
      statsSummary: {
        totalDevices,
        totalValue: calc.fmtPrice(totalValue),
        avgDaily: calc.fmtPrice(avgDaily),
        expiringCount,
      },
    });
  },

  // 筛选
  onFilterChange(e) {
    const val = e.detail.value;
    const cat = this.data.categories.find((c) => c.name === val);
    const idx = this.data.categoryOptions.findIndex((o) => o.value === val);
    this.setData({
      catFilter: val,
      catFilterLabel: val || '全部分类',
      catFilterIndex: idx >= 0 ? idx : 0,
    }, () => this.refreshData());
  },

  // 排序
  onSortChange(e) {
    const val = e.detail.value;
    const opt = SORT_OPTIONS.find((o) => o.value === val);
    const idx2 = SORT_OPTIONS.findIndex((o) => o.value === val);
    this.setData({
      sortVal: val,
      sortLabel: opt ? opt.label : val,
      sortIndex: idx2 >= 0 ? idx2 : 0,
    }, () => this.refreshData());
  },

  // 添加设备
  onAddTap() {
    this.setData({ formVisible: true, editDevice: null });
  },

  // 编辑设备
  onEditDevice(e) {
    this.setData({
      formVisible: true,
      editDevice: e.detail.device,
    });
  },

  // 删除设备
  onDeleteDevice(e) {
    const device = e.detail.device;
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${device.name}」吗？\n此操作无法撤销。`,
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          const devices = app.getDevices().filter((d) => d.id !== device.id);
          storage.saveDevices(devices);
          app.refresh();
          this.refreshData();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  },

  // 表单保存
  onFormSave(e) {
    const device = e.detail.device;
    let devices = app.getDevices();

    if (device.id && devices.find((d) => d.id === device.id)) {
      // 编辑
      devices = devices.map((d) => (d.id === device.id ? device : d));
    } else {
      // 新增
      devices.push(device);
    }

    storage.saveDevices(devices);
    app.refresh();
    this.setData({ formVisible: false, editDevice: null });
    this.refreshData();
    wx.showToast({ title: device.id ? '已更新' : '已添加', icon: 'success' });
  },

  // 表单关闭
  onFormClose() {
    this.setData({ formVisible: false, editDevice: null });
  },

  // 导出 CSV
  onExport() {
    const devices = app.getDevices();
    if (devices.length === 0) {
      wx.showToast({ title: '没有数据可导出', icon: 'none' });
      return;
    }
    const headers = ['设备名称,分类,购买价格,购买日期,保修截止日期,延保到期日期'];
    const rows = devices.map((d) =>
      [d.name, d.category, d.purchasePrice, d.purchaseDate, d.warrantyEnd || '', d.appleCareEnd || '']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = '\uFEFF' + headers.concat(rows).join('\n');

    wx.setClipboardData({
      data: csv,
      success: () => {
        wx.showToast({ title: 'CSV 已复制到剪贴板，可粘贴到文件中保存', icon: 'none', duration: 2500 });
      },
      fail: () => {
        wx.showToast({ title: '复制失败，请重试', icon: 'none' });
      },
    });
  },

  // 导入 CSV
  onImport() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['csv'],
      success: (res) => {
        const filePath = res.tempFiles[0].path;
        const fs = wx.getFileSystemManager();
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          this.parseCSV(content);
        } catch (err) {
          wx.showToast({ title: '文件读取失败', icon: 'none' });
        }
      },
      fail: () => {
        // 用户取消选择
      },
    });
  },

  parseCSV(content) {
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length < 2) {
      wx.showToast({ title: 'CSV 为空或格式错误', icon: 'none' });
      return;
    }

    const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
    const idx = {
      name: headers.indexOf('设备名称'),
      cat: headers.indexOf('分类'),
      price: headers.indexOf('购买价格'),
      purchase: headers.indexOf('购买日期'),
      warranty: headers.indexOf('保修截止日期'),
      ac: headers.indexOf('延保到期日期'),
    };

    if (idx.name < 0 || idx.price < 0 || idx.purchase < 0) {
      wx.showToast({ title: 'CSV 缺少必要列', icon: 'none' });
      return;
    }

    let imported = 0;
    let errors = 0;
    let devices = app.getDevices();
    let categories = app.getCategories();
    const catNames = categories.map((c) => c.name);

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      const name = cols[idx.name];
      const cat = idx.cat >= 0 ? (cols[idx.cat] || '其他') : '其他';
      const price = parseFloat(cols[idx.price]);
      const purchaseDate = cols[idx.purchase];
      const warrantyEnd = idx.warranty >= 0 && cols[idx.warranty] ? cols[idx.warranty] : null;
      const appleCareEnd = idx.ac >= 0 && cols[idx.ac] ? cols[idx.ac] : null;

      if (!name || isNaN(price) || price <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
        errors++;
        continue;
      }

      // 自动创建缺失分类
      if (!catNames.includes(cat)) {
        const newCat = { id: `preset_${cat}`, name: cat, isPreset: false };
        categories.push(newCat);
        catNames.push(cat);
      }

      devices.push({
        id: `import_${Date.now()}_${i}`,
        name: name.trim(),
        category: cat,
        purchasePrice: price,
        purchaseDate,
        warrantyEnd: warrantyEnd && /^\d{4}-\d{2}-\d{2}$/.test(warrantyEnd) ? warrantyEnd : null,
        appleCareEnd: appleCareEnd && /^\d{4}-\d{2}-\d{2}$/.test(appleCareEnd) ? appleCareEnd : null,
      });
      imported++;
    }

    storage.saveDevices(devices);
    storage.saveCategories(categories);
    app.refresh();
    this.refreshData();

    const msg = errors > 0
      ? `导入 ${imported} 条，${errors} 条格式错误已跳过`
      : `成功导入 ${imported} 台设备`;
    wx.showToast({ title: msg, icon: errors > 0 ? 'none' : 'success', duration: 2500 });
  },

  // 管理分类
  onCatManage() {
    wx.showActionSheet({
      itemList: ['添加分类', '删除分类'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.addCategory();
        } else if (res.tapIndex === 1) {
          this.deleteCategory();
        }
      },
    });
  },

  addCategory() {
    wx.showModal({
      title: '添加分类',
      editable: true,
      placeholderText: '输入分类名称',
      success: (res) => {
        if (res.confirm && res.content && res.content.trim()) {
          const name = res.content.trim();
          if (name.length > 10) {
            wx.showToast({ title: '分类名不超过10字', icon: 'none' });
            return;
          }
          let cats = app.getCategories();
          if (cats.some((c) => c.name === name)) {
            wx.showToast({ title: '该分类已存在', icon: 'none' });
            return;
          }
          cats.push({ id: `custom_${Date.now()}`, name, isPreset: false });
          storage.saveCategories(cats);
          app.refresh();
          this.refreshData();
          wx.showToast({ title: '已添加', icon: 'success' });
        }
      },
    });
  },

  deleteCategory() {
    const cats = app.getCategories().filter((c) => !c.isPreset);
    if (cats.length === 0) {
      wx.showToast({ title: '没有可删除的分类', icon: 'none' });
      return;
    }
    const names = cats.map((c) => c.name);
    wx.showActionSheet({
      itemList: names,
      success: (res) => {
        const cat = cats[res.tapIndex];
        const devices = app.getDevices();
        if (devices.some((d) => d.category === cat.name)) {
          wx.showToast({ title: `「${cat.name}」有设备在使用，无法删除`, icon: 'none' });
          return;
        }
        wx.showModal({
          title: '确认删除',
          content: `确定要删除分类「${cat.name}」吗？`,
          confirmColor: '#FF3B30',
          success: (modalRes) => {
            if (modalRes.confirm) {
              let allCats = app.getCategories().filter((c) => c.id !== cat.id);
              storage.saveCategories(allCats);
              app.refresh();
              this.refreshData();
              wx.showToast({ title: '已删除', icon: 'success' });
            }
          },
        });
      },
    });
  },

  // 清空全部数据
  onReset() {
    wx.showModal({
      title: '清空全部数据？',
      content: '这将永久删除所有设备数据和自定义分类。建议先导出备份。',
      confirmText: '继续清空',
      confirmColor: '#FF3B30',
      success: (res1) => {
        if (!res1.confirm) return;
        // 二次确认
        wx.showModal({
          title: '再次确认',
          content: '数据将无法恢复。这是最后一次取消的机会。',
          confirmText: '确认清空',
          confirmColor: '#FF3B30',
          success: (res2) => {
            if (res2.confirm) {
              storage.clearAll();
              app.initCategories();
              app.refresh();
              this.refreshData();
              wx.showToast({ title: '所有数据已清空', icon: 'success' });
            }
          },
        });
      },
    });
  },

  // 定时刷新倒计时
  startTimer() {
    this._timer = setInterval(() => {
      this.refreshData();
    }, 60000);
  },

  stopTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },
});
