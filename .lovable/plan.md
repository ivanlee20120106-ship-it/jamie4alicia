

## 改动内容

### 1. 添加 Footer 组件

新建 `src/components/Footer.tsx`，展示版权信息：

```
(c) 2026 Jamie & Alicia. Good Night! Love You! Every Single Day! All rights reserved.
```

- 使用项目现有字体风格（font-body / font-script）
- 半透明背景 + 金色文字，与整体暗色主题一致
- 底部安全区域适配（`pb-safe`），兼容 iPhone 底部横条

### 2. 在首页添加 Footer

修改 `src/pages/Index.tsx`，在 `<LazyTravelMap />` 下方插入 `<Footer />`。

### 3. 移动端 iOS / Android 浏览器兼容修复

在 `index.html` 和 `src/index.css` 中增加以下优化：

**index.html:**
- 添加 `apple-mobile-web-app-capable` 和 `apple-mobile-web-app-status-bar-style` meta 标签
- 添加 `theme-color` meta 标签（匹配深色背景色）
- 更新 `<title>` 为 "Jamie & Alicia"

**src/index.css:**
- 添加 `100dvh`（动态视口高度）支持，解决 iOS Safari 地址栏收缩导致的高度问题
- 添加 `-webkit-overflow-scrolling: touch` 改善 iOS 滚动流畅度
- 添加 `env(safe-area-inset-bottom)` padding 确保内容不被 iPhone 底部横条遮挡
- 修复 `overflow-x: hidden` 在 iOS 上的已知滚动 bug（添加 `position: relative`）

---

## 涉及文件

| 操作 | 文件 | 改动 |
|------|------|------|
| 新建 | `src/components/Footer.tsx` | Footer 组件 |
| 修改 | `src/pages/Index.tsx` | 引入 Footer |
| 修改 | `index.html` | 移动端 meta 标签、标题更新 |
| 修改 | `src/index.css` | dvh 支持、iOS 滚动修复、安全区域适配 |
