// components/device-form/device-form.js
const app = getApp();

Component({
  options: { styleIsolation: 'shared' },

  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    editDevice: {
      type: Object,
      value: null,
      observer: 'onEditDeviceChange',
    },
  },

  data: {
    isEdit: false,
    formData: {
      name: '',
      category: '',
      price: '',
      purchaseDate: '',
      warrantyEnd: '',
      appleCareEnd: '',
    },
    categories: [],
    catIndex: 0,
    catRange: [],
    purchaseDateText: '请选择购买日期',
    warrantyDateText: '请选择（可选）',
    acDateText: '请选择（可选）',
  },

  methods: {
    onEditDeviceChange(val) {
      if (val && val.id) {
        const cats = app.getCategories();
        const catNames = cats.map((c) => c.name);
        const idx = catNames.indexOf(val.category || '');
        this.setData({
          isEdit: true,
          catIndex: idx >= 0 ? idx : 0,
          formData: {
            name: val.name || '',
            category: val.category || '',
            price: val.purchasePrice ? String(val.purchasePrice) : '',
            purchaseDate: val.purchaseDate || '',
            warrantyEnd: val.warrantyEnd || '',
            appleCareEnd: val.appleCareEnd || '',
          },
          purchaseDateText: val.purchaseDate || '请选择购买日期',
          warrantyDateText: val.warrantyEnd || '请选择（可选）',
          acDateText: val.appleCareEnd || '请选择（可选）',
        });
      }
    },

    // 初始化分类选项
    initCategories() {
      const cats = app.getCategories();
      const catNames = cats.map((c) => c.name);
      this.setData({
        categories: cats,
        catRange: catNames,
      });
    },

    // 名称
    onNameChange(e) {
      this.setData({ 'formData.name': e.detail.value });
    },

    // 分类 picker
    onCatChange(e) {
      const idx = parseInt(e.detail.value);
      const cat = this.data.categories[idx];
      this.setData({
        catIndex: idx,
        'formData.category': cat ? cat.name : '',
      });
    },

    // 价格（仅数字小数点）
    onPriceChange(e) {
      let val = e.detail.value;
      val = val.replace(/[^\d.]/g, '');
      // 仅保留一个小数点
      const parts = val.split('.');
      if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
      // 最多2位小数
      if (parts.length === 2 && parts[1].length > 2) {
        val = parts[0] + '.' + parts[1].slice(0, 2);
      }
      this.setData({ 'formData.price': val });
    },

    // 日期选择
    onPurchaseDateChange(e) {
      const val = e.detail.value;
      this.setData({
        'formData.purchaseDate': val,
        purchaseDateText: val,
      });
    },
    onWarrantyDateChange(e) {
      const val = e.detail.value;
      this.setData({
        'formData.warrantyEnd': val,
        warrantyDateText: val,
      });
    },
    onAcDateChange(e) {
      const val = e.detail.value;
      this.setData({
        'formData.appleCareEnd': val,
        acDateText: val,
      });
    },

    // 取消
    onCancel() {
      this.triggerEvent('close');
    },

    // 保存
    onSave() {
      const { name, category, price, purchaseDate, warrantyEnd, appleCareEnd } = this.data.formData;

      // 校验
      if (!name || !name.trim()) {
        wx.showToast({ title: '请输入设备名称', icon: 'none' });
        return;
      }
      if (!category) {
        wx.showToast({ title: '请选择设备分类', icon: 'none' });
        return;
      }
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        wx.showToast({ title: '请输入有效的购买金额', icon: 'none' });
        return;
      }
      if (!purchaseDate) {
        wx.showToast({ title: '请选择购买日期', icon: 'none' });
        return;
      }
      if (new Date(purchaseDate) > new Date()) {
        wx.showToast({ title: '购买日期不能晚于今天', icon: 'none' });
        return;
      }
      if (warrantyEnd && new Date(warrantyEnd) < new Date(purchaseDate)) {
        wx.showToast({ title: '保修截止日不能早于购买日', icon: 'none' });
        return;
      }
      if (appleCareEnd && new Date(appleCareEnd) < new Date(purchaseDate)) {
        wx.showToast({ title: '延保到期日不能早于购买日', icon: 'none' });
        return;
      }

      const device = {
        name: name.trim(),
        category,
        purchasePrice: priceNum,
        purchaseDate,
        warrantyEnd: warrantyEnd || null,
        appleCareEnd: appleCareEnd || null,
      };

      if (this.data.isEdit && this.properties.editDevice) {
        device.id = this.properties.editDevice.id;
      } else {
        device.id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      }

      this.triggerEvent('save', { device });
    },

    // 重置表单
    resetForm() {
      this.setData({
        isEdit: false,
        catIndex: 0,
        formData: {
          name: '',
          category: '',
          price: '',
          purchaseDate: '',
          warrantyEnd: '',
          appleCareEnd: '',
        },
        purchaseDateText: '请选择购买日期',
        warrantyDateText: '请选择（可选）',
        acDateText: '请选择（可选）',
      });
    },

    // Popup 关闭
    onVisibleChange(e) {
      if (!e.detail.visible) {
        this.triggerEvent('close');
      }
    },
  },

  observers: {
    'visible'(val) {
      if (val) {
        this.initCategories();
      }
    },
  },
});
