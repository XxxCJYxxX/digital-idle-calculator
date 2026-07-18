# 吃灰计算器 · Idle Device Calculator

追踪闲置电子产品的贬值和保修期限。数据全部存在本地，没有账号，没有云端。

Track how fast your unused gadgets lose value and when their warranties expire. Everything stays on your device: no accounts, no cloud.

---

## 简体中文

### 为什么做这个

买回来吃灰的设备有两个隐形成本：购入价被持有时间一天天摊薄，保修期在不知不觉中走完。这个工具把两件事都算清楚：

- **日均损耗** = 购入价 ÷ 已持有天数。持有越久单日数字越小，但总数不变，钱已经花了。
- **保修倒计时**：剩余 90 天以上绿色，30–90 天黄色，30 天内或已过期红色。

### 功能

**设备管理**
- 手动录入，或从 618 条预设中直接选（手机 378、平板 37、耳机 36、笔记本 33、手表 32、相机 28、VR/AR 20、游戏机 17、无人机 15、外设 11、音箱 11）
- 手机预设价格取自中关村在线参考价，覆盖华为、vivo、OPPO、小米、荣耀、iQOO、一加、三星、苹果九个品牌
- 品类筛选，8 种排序（购入时间、日均损耗、总成本、保修到期）

**订阅管理**（Web 版）
- 163 条订阅预设，13 个分类：视频、音乐、云存储、办公效率、设计创意、游戏、阅读、购物、出行、AI 工具、网络、运动健康、知识付费
- 月付、季付、年付自动推算下次续费日期

**统计与对比**
- 品类占比、成本构成图表
- 多设备并排对比

**外观**（Web 版）
- 5 套主题：浅色、深色、奥古斯塔（大理石金色调）、Kallen、Sonetto（含深色变体）
- 自定义背景图，存入 IndexedDB，不占 localStorage 配额
- 毛玻璃质感界面

### 两个版本

|  | Web 版 | 微信小程序版 |
|---|---|---|
| 位置 | `index.html`（单文件 275 KB） | 仓库其余文件 |
| 依赖 | Chart.js（CDN 引入），无构建步骤 | TDesign 组件库 |
| 图表 | Chart.js | Canvas 2D 自绘，零外部依赖 |
| 存储 | localStorage + IndexedDB | wx.Storage |
| 结构 | 单页 4 个 Tab | 3 个页面 + 自定义 TabBar |
| 预设库 | 618 条设备 + 163 条订阅 | 暂无，手动录入 |

### 使用

**Web 版**：下载 `index.html`，浏览器直接打开就能用。开启 GitHub Pages（Settings → Pages → main 分支 → root 目录）后可在线访问。

**小程序版**：克隆仓库，用微信开发者工具导入，替换成自己的 AppID 后预览。

### 数据与隐私

所有记录只存在你自己的设备上。没有账号系统，没有服务器，没有统计埋点。清空浏览器数据或删除小程序会一并清掉记录，导出备份功能在计划中。

---

## English

### Why this exists

A gadget gathering dust carries two hidden costs: the purchase price spreads thinner over each day you keep it, and the warranty clock keeps running whether you notice or not. This tool tracks both:

- **Daily cost** = purchase price ÷ days owned. The longer you hold it, the smaller the daily figure gets, but the total never shrinks. The money is already spent.
- **Warranty countdown**: green above 90 days remaining, yellow between 30 and 90, red under 30 or expired.

### Features

**Device tracking**
- Add devices by hand or pick from 618 presets (378 phones, 37 tablets, 36 earphones, 33 laptops, 32 watches, 28 cameras, 20 VR/AR headsets, 17 consoles, 15 drones, 11 peripherals, 11 speakers)
- Phone preset prices come from ZOL (zol.com.cn) reference data, covering Huawei, vivo, OPPO, Xiaomi, Honor, iQOO, OnePlus, Samsung and Apple
- Category filters and 8 sort orders (purchase date, daily cost, total cost, warranty expiry)

**Subscription tracking** (web version)
- 163 subscription presets in 13 categories: video, music, cloud storage, productivity, design, gaming, reading, shopping, transport, AI tools, network, fitness, paid content
- Monthly, quarterly and yearly billing with automatic renewal dates

**Stats and comparison**
- Category breakdown and cost charts
- Side-by-side device comparison

**Appearance** (web version)
- 5 themes: light, dark, Augusta (marble and gold), Kallen, Sonetto (plus a dark variant)
- Custom background images stored in IndexedDB, outside the localStorage quota
- Frosted-glass interface

### Two versions

|  | Web | WeChat Mini Program |
|---|---|---|
| Location | `index.html` (single file, 275 KB) | everything else in this repo |
| Dependencies | Chart.js via CDN, no build step | TDesign component library |
| Charts | Chart.js | hand-drawn Canvas 2D, no dependencies |
| Storage | localStorage + IndexedDB | wx.Storage |
| Layout | one page, 4 tabs | 3 pages + custom tab bar |
| Presets | 618 devices + 163 subscriptions | none yet, manual entry |

### Getting started

**Web**: download `index.html` and open it in any browser. Enable GitHub Pages (Settings → Pages → main branch → root) to host it online.

**Mini program**: clone the repo, import it into WeChat DevTools, replace the AppID with your own, and preview.

### Data and privacy

Every record lives on your own device. No account system, no server, no analytics. Clearing browser data or removing the mini program wipes your records; export and backup are planned.
