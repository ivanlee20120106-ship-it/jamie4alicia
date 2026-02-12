

# 修复 iOS 漂浮爱心只显示红色 emoji 的问题

## 问题原因

iOS Safari 会将 Unicode 字符 `♥`（U+2665）自动渲染为彩色 emoji，忽略 CSS 的 `color` 属性。这导致所有 12 种颜色的心形在 iOS 上都显示为系统默认的红色 emoji 心。

## 解决方案

将文本字符 `♥` 替换为 **SVG 心形**，SVG 使用 `fill: currentColor`，这样就能正确继承 Tailwind 的 `text-*` 颜色类，在所有平台（包括 iOS）上都能显示正确的颜色。

## 技术细节

### 改动文件：`src/components/FloatingHearts.tsx`

- 将 `<span>♥</span>` 替换为内联 SVG 心形路径
- SVG 使用 `currentColor` 作为 fill，自动继承父元素的 `text-*` 颜色
- 用 `width` 和 `height` 控制大小，替代 `fontSize`
- 其余逻辑（颜色数组、动画、随机参数）保持不变

SVG 心形路径示例：
```text
<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
           2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
           C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
           c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>
```

| 文件 | 改动 |
|------|------|
| `src/components/FloatingHearts.tsx` | 将 `♥` 字符替换为 SVG 心形，使用 `currentColor` 继承颜色 |

