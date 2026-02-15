

# 修复地图瓦片渲染问题

## 问题分析

截图中地图瓦片呈碎片化分布，没有拼成完整的世界地图。这是一个常见的 Leaflet + Tailwind CSS 冲突问题：Tailwind 的全局样式（如 `img { max-width: 100% }` 和 `* { box-sizing: border-box }`）会破坏 Leaflet 内部的瓦片定位。

## 解决方案

在 `src/index.css` 中添加针对 Leaflet 容器的 CSS 覆盖规则，确保瓦片正确渲染。

## 技术细节

**文件**: `src/index.css`

在 Leaflet CSS 导入之后添加以下覆盖规则：

```css
/* 修复 Leaflet + Tailwind 冲突 */
.leaflet-container img {
  max-width: none !important;
  max-height: none !important;
}
.leaflet-container {
  width: 100%;
  height: 100%;
}
.leaflet-tile-pane img {
  max-width: none !important;
}
```

这些规则解决了：
- Tailwind 的 `img { max-width: 100% }` 导致瓦片尺寸异常
- 瓦片定位偏移导致的碎片化显示

只需修改一个文件，改动很小。

