// components/chart-bar/chart-bar.js
// 纯 Canvas 2D 柱状图组件

const { CHART_COLORS_LIGHT, CHART_COLORS_DARK } = require('../../utils/constants');

Component({
  properties: {
    // 数据: [{label, value}]
    data: { type: Array, value: [], observer: 'draw' },
    // 图表标题
    title: { type: String, value: '' },
    // Y 轴格式化函数名: 'days' | 'price' | 'none'
    valueFormat: { type: String, value: 'none' },
    // 柱状图颜色数组
    colors: { type: Array, value: [] },
    // 深色模式
    isDark: { type: Boolean, value: false },
  },

  data: {
    canvasWidth: 690,
    canvasHeight: 400,
    _ctx: null,
    _canvas: null,
  },

  lifetimes: {
    ready() {
      this.initCanvas();
    },
  },

  methods: {
    initCanvas() {
      const query = this.createSelectorQuery();
      query.select('#barCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0]) return;
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const dpr = wx.getSystemInfoSync().pixelRatio;
          const width = res[0].width;
          const height = res[0].height;

          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);

          this.setData({
            _canvas: canvas,
            _ctx: ctx,
            canvasWidth: width,
            canvasHeight: height,
          }, () => {
            this.draw();
          });
        });
    },

    draw() {
      const ctx = this.data._ctx;
      if (!ctx) return;

      const { data: chartData, isDark, valueFormat, colors, canvasWidth, canvasHeight } = this.data;
      if (!chartData || chartData.length === 0) {
        this.drawEmpty(ctx, canvasWidth, canvasHeight);
        return;
      }

      const W = canvasWidth;
      const H = canvasHeight;
      const padding = { top: 20, right: 20, bottom: 55, left: 50 };
      const pw = W - padding.left - padding.right;
      const ph = H - padding.top - padding.bottom;

      ctx.clearRect(0, 0, W, H);

      // 文本色
      const textColor = isDark ? '#98989D' : '#6E6E73';
      const gridColor = isDark ? '#38383A' : '#E5E5EA';
      const defaultColors = isDark ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;
      const barColors = colors.length > 0 ? colors : defaultColors;

      const values = chartData.map((d) => d.value);
      const maxVal = Math.max(...values, 1);
      const barCount = chartData.length;
      const barGap = Math.min(20, (pw / barCount) * 0.3);
      const barW = Math.max(12, (pw - barGap * (barCount + 1)) / barCount);

      // Y 轴刻度
      const ySteps = 4;
      const yStep = Math.ceil(maxVal / ySteps);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      ctx.fillStyle = textColor;
      ctx.font = '20rpx -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      for (let i = 0; i <= ySteps; i++) {
        const y = padding.top + ph - (ph * i) / ySteps;
        const val = Math.round(yStep * i);

        // 网格线
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(W - padding.right, y);
        ctx.stroke();

        // Y 轴标签
        let label = String(val);
        if (valueFormat === 'days') label = val + '天';
        else if (valueFormat === 'price') label = '¥' + val;
        ctx.fillText(label, padding.left - 8, y);
      }

      // X 轴 & 柱状图
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      for (let i = 0; i < barCount; i++) {
        const x = padding.left + barGap + i * (barW + barGap);
        const val = chartData[i].value;
        const barH = (val / maxVal) * ph;
        const y = padding.top + ph - barH;
        const color = barColors[i % barColors.length];

        // 柱子
        const radius = Math.min(5, barW / 3);
        this.roundRect(ctx, x, y, barW, barH, radius, color);

        // 数值标签
        ctx.fillStyle = textColor;
        ctx.font = '18rpx -apple-system, sans-serif';
        let valLabel = String(val);
        if (valueFormat === 'price') valLabel = '¥' + val;
        ctx.fillText(valLabel, x + barW / 2, y - 16);

        // X 轴标签（截断长文本）
        let xLabel = chartData[i].label || '';
        if (xLabel.length > 5) xLabel = xLabel.slice(0, 5) + '…';
        ctx.fillText(xLabel, x + barW / 2, padding.top + ph + 8);
      }
    },

    roundRect(ctx, x, y, w, h, r, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      ctx.fill();
    },

    drawEmpty(ctx, W, H) {
      ctx.fillStyle = this.data.isDark ? '#98989D' : '#8E8E93';
      ctx.font = '24rpx -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('暂无数据', W / 2, H / 2);
    },
  },
});
