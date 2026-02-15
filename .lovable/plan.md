

# 优化地图展示效果与加载速度

## 改动概述

针对 Web 端和主流移动端（iPhone SE 375px / iPhone 14 390px / Android 360px / iPad 768px+）优化地图的响应式展示和加载性能。

## 具体改动

### 1. 响应式高度优化
当前地图高度只有两档（`h-[450px]` 和 `sm:h-[650px]`），对中间尺寸（平板）和超小屏适配不够细致。

调整为三档响应式高度：
- 移动端（< 640px）：`h-[55vh]`，使用视口高度百分比自适应不同手机屏幕
- 平板端（640px-1024px）：`sm:h-[500px]`
- 桌面端（>= 1024px）：`lg:h-[650px]`

### 2. 瓦片加载性能优化
- 为 `TileLayer` 添加 `updateWhenZooming={false}` 和 `updateWhenIdle={true}`，减少缩放过程中的瓦片请求，只在停止操作后加载
- 添加 `keepBuffer={2}` 缓冲更多瓦片减少白边闪烁

### 3. 懒加载地图组件
- 使用 React `lazy` + `Suspense` 懒加载 TravelMap 组件，避免地图在首屏时阻塞页面渲染
- 配合 `IntersectionObserver` 实现滚动到视口时才开始加载

### 4. Popup 图片懒加载
- 为 MapPopup 中的图片添加 `loading="lazy"` 属性

## 修改文件

| 文件 | 改动 |
|------|------|
| `src/components/TravelMap.tsx` | 地图容器高度改为三档响应式 |
| `src/components/map/MapContent.tsx` | TileLayer 添加性能参数 |
| `src/components/map/MapPopup.tsx` | 图片添加 `loading="lazy"` |
| `src/pages/Index.tsx` | TravelMap 懒加载 + IntersectionObserver |

## 技术细节

**TravelMap.tsx** - 响应式高度：
```text
变更前: className="h-[450px] sm:h-[650px] w-full"
变更后: className="h-[55vh] min-h-[350px] sm:h-[500px] lg:h-[650px] w-full"
```

**MapContent.tsx** - TileLayer 性能参数：
```typescript
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  updateWhenZooming={false}
  updateWhenIdle={true}
  keepBuffer={2}
/>
```

**Index.tsx** - 懒加载：
```typescript
import { lazy, Suspense, useRef, useState, useEffect } from "react";
const TravelMap = lazy(() => import("@/components/TravelMap"));

// 使用 IntersectionObserver 检测地图区域进入视口
// 进入视口后才渲染 Suspense + TravelMap
```

