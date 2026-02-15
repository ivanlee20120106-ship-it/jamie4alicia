

# 地图样式改造：去掉深色 popup + 替换功能按钮

## 改动概述

1. **去掉深色 popup**：删除 CSS 中的深色 popup 覆盖样式，恢复 Leaflet 默认浅色 popup
2. **切换为浅色地图瓦片**：从 CARTO dark 切换到标准 OpenStreetMap 瓦片，匹配截图中的浅色地图
3. **替换右下角按钮**：移除"定位"和"重置视图"按钮，替换为"添加已去过"(🚩) 和"添加计划中"(✈️) 两个快捷打点按钮，点击后弹出城市搜索输入框，搜索到城市后直接添加对应类型的标记
4. **调整 MapPopup 文字颜色**：由于 popup 改为浅色背景，内部文字需改为深色

## 需要修改的文件

| 文件 | 改动 |
|------|------|
| `src/index.css` | 删除 `.leaflet-popup-content-wrapper` 等深色覆盖样式（第 270-292 行） |
| `src/components/map/MapContent.tsx` | 将 TileLayer URL 从 CARTO dark 改为 OpenStreetMap 标准瓦片 |
| `src/components/map/MapButtons.tsx` | 移除 Locate 和 Reset 按钮，替换为"添加已去过"和"添加计划中"按钮，点击后展开城市搜索框，搜索 Nominatim 后直接调用 onAddMarker 回调 |
| `src/components/map/MapPopup.tsx` | 文字颜色改为深色系以适配浅色 popup 背景 |
| `src/components/TravelMap.tsx` | 新增 handleAddFromMap 回调传给 MapContent，支持从按钮直接添加标记到数据库；移除地图容器的深色背景样式 |

## 按钮交互流程

1. 用户点击右下角 🚩 或 ✈️ 按钮
2. 按钮左侧展开城市搜索输入框（复用现有搜索逻辑）
3. 用户输入城市名并回车
4. 通过 Nominatim 搜索获取坐标
5. 自动将该城市以对应类型（visited/planned）插入数据库
6. 地图飞到该位置并显示新标记

## 视觉对照

- 地图瓦片：浅色标准地图（OpenStreetMap）
- Popup：Leaflet 默认白色背景
- 标记图标：保持现有旗帜和飞机 SVG 图标不变
- 右下角按钮：搜索 + 添加已去过 + 添加计划中（3 个按钮）

