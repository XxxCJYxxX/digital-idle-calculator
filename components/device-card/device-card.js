// components/device-card/device-card.js
const calc = require('../../utils/calculator');

Component({
  options: { styleIsolation: 'shared' },

  properties: {
    device: {
      type: Object,
      value: {},
      observer: 'onDeviceChange',
    },
    isDark: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    computed: null,
    warrantyStatus: '',
    acStatus: '',
    warrantyLabel: '',
    acLabel: '',
  },

  methods: {
    onDeviceChange() {
      this.recalc();
    },

    recalc() {
      const device = this.properties.device;
      if (!device || !device.id) return;

      const computed = calc.computeDevice(device);
      const wStatus = calc.warrantyStatus(computed.warrantyRemain);
      const acStatus = calc.warrantyStatus(computed.appleCareRemain);
      const isDark = this.properties.isDark;

      this.setData({
        computed,
        warrantyStatus: wStatus,
        acStatus: acStatus,
        warrantyLabel: computed.warrantyRemain !== null
          ? calc.warrantyText(computed.warrantyRemain) : null,
        acLabel: computed.appleCareRemain !== null
          ? calc.warrantyText(computed.appleCareRemain) : null,
        warrantyColor: calc.warrantyColor(computed.warrantyRemain, isDark),
        acColor: calc.warrantyColor(computed.appleCareRemain, isDark),
        priceText: calc.fmtPrice(device.purchasePrice),
        dailyText: calc.fmtPrice(computed.dailyCost),
        totalText: calc.fmtPrice(computed.totalCost),
        dateText: calc.fmtDate(device.purchaseDate),
      });
    },

    onEdit() {
      this.triggerEvent('edit', { device: this.properties.device });
    },

    onDelete() {
      this.triggerEvent('delete', { device: this.properties.device });
    },
  },

  lifetimes: {
    attached() {
      this.recalc();
    },
  },
});
