

## 地图样式优化方案

参考 Destinero 项目的视觉风格，对当前地图组件进行样式升级，使地图更具视觉表现力和交互感。

---

## 改动概要

### 1. 瓦片图层升级

当前使用 CartoDB Light（纯灰白色调），改为 **MapTiler Streets** 风格（更丰富的彩色地图），与 Destinero 保持一致。使用免费的 OpenStreetMap 标准瓦片作为备选（无需 API Key）。

**文件**: `src/components/map/MapContent.tsx`
- 将 TileLayer URL 从 `cartocdn.com/light_all` 改为 `tile.openstreetmap.org` 标准彩色瓦片

### 2. 标记图标增强

参考 Destinero 的图标风格，将当前 SVG 内联图标改为更大、更鲜明的样式：

- **Visited（已访问）**: 深蓝色旗帜图标 (`#003380`)，对应 Destinero 的 `PiFlagPennantFill`
- **Planned（计划中）**: 粉红色飞机图标 (`#ff249c`)，对应 Destinero 的 `BiSolidPlaneAlt`
- **Highlighted 标记**: 新增心跳脉冲动画效果（参考 Destinero 的 `pulse` 动画）
- 图标 hover 时放大效果（已有，保持一致）

**文件**: `src/components/map/MapMarker.tsx`
- 更新 `flagSvg` 和 `planeSvg` 的颜色方案
- 调整 `iconAnchor` 使图标定位更精确

**文件**: `src/components/map/MapContent.tsx`
- 更新 `clickedIcon`、`searchedIcon`、`liveIcon` 颜色

### 3. 弹窗（Popup）样式优化

参考 Destinero 的弹窗设计，优化 Leaflet 弹窗样式：

- 弹窗内容居中对齐
- 图片 hover 时微缩放 + 绿色辉光边框效果
- 坐标文字使用等宽字体
- 国旗 emoji 展示（为动态标记增加国家标识）

**文件**: `src/components/map/MapPopup.tsx`
- 增加图片 hover 效果
- 为动态标记（clicked/searched/live）添加国家代码解析和国旗展示
- 优化标题样式

**文件**: `src/index.css`
- 添加 `.leaflet-popup-content-wrapper` 的全局样式覆写
- 添加弹窗图片 hover 效果 CSS

### 4. 按钮样式对齐

参考 Destinero 的蓝色实心按钮风格：

- 按钮背景改为蓝色实心 (`rgb(0, 94, 172)`)
- 图标改为白色
- 搜索框展开动画（从右侧滑出）
- 新增「重置视图」和「定位」按钮

**文件**: `src/components/map/MapButtons.tsx`
- 更新按钮样式为蓝色实心风格
- 添加全屏重置按钮
- 添加实时定位按钮
- 搜索输入框使用 CSS 过渡动画展开

### 5. CSS 动画增强

**文件**: `src/index.css`
- 新增 marker `pulse` 动画关键帧（用于高亮标记）
- 新增搜索框滑出过渡动画
- 优化 `.custom-div-icon` 的过渡效果
- 弹窗图片 hover 缩放 + 辉光效果

---

## 涉及文件一览

| 操作 | 文件 | 改动内容 |
|------|------|----------|
| 修改 | `src/components/map/MapContent.tsx` | 瓦片图层 URL、动态图标颜色 |
| 修改 | `src/components/map/MapMarker.tsx` | 标记图标 SVG 颜色方案 |
| 修改 | `src/components/map/MapPopup.tsx` | 弹窗图片 hover 效果、国旗展示 |
| 修改 | `src/components/map/MapButtons.tsx` | 蓝色实心按钮、定位/重置按钮、搜索框动画 |
| 修改 | `src/index.css` | 弹窗全局样式、pulse 动画、搜索框动画 |

---

## 技术要点

- 不引入新依赖，继续使用 lucide-react 图标
- 保持现有功能（筛选、删除、添加标记）完全不变
- 颜色方案融合项目现有主题（gold/love/primary）与 Destinero 的蓝+粉配色
- 瓦片使用免费的 OpenStreetMap 标准瓦片，无需 API Key

