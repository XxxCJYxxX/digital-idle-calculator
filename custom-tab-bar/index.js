// custom-tab-bar/index.js
Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '设备列表', icon: '📱' },
      { pagePath: '/pages/stats/stats', text: '统计', icon: '📊' },
      { pagePath: '/pages/compare/compare', text: '对比', icon: '📋' },
    ],
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.list[index];
      wx.switchTab({ url: item.pagePath });
    },
  },
});
