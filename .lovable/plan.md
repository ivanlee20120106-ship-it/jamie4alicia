

# 在照片墙下方添加交互式旅行地图

## 功能概述

在照片墙下方新增一个 Destinero 风格的交互式旅行地图模块，用于记录和展示两人一起去过的地方和计划要去的地方。地图风格与页面现有的浪漫艺术主题保持一致。

## 整体布局

```text
+------------------------------------------+
|              Header                       |
+------------------------------------------+
|           HeroSection                     |
+------------------------------------------+
|           PhotoWall                       |
+------------------------------------------+
|         TravelMap (新增)                   |
|  +--------------------------------------+ |
|  |  "Our Journey Map" 标题               | |
|  +--------------------------------------+ |
|  |  [筛选按钮: All / Visited / Planned]  | |
|  +--------------------------------------+ |
|  |                                      | |
|  |        Leaflet 交互式地图             | |
|  |   (点击标记弹出详情卡片，含图片)       | |
|  |                                      | |
|  +--------------------------------------+ |
|  |  登录用户: [+ Add Place] 按钮         | |
|  +--------------------------------------+ |
+------------------------------------------+
```

## 数据库设计

**新建表 `travel_markers`**：

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | 主键 |
| name | text | 地点名称 |
| lat | double precision | 纬度 |
| lng | double precision | 经度 |
| type | text | 'visited' 或 'planned' |
| description | text (nullable) | 描述 |
| visit_date | date (nullable) | 访问日期 |
| image_url | text (nullable) | 图片 URL |
| created_at | timestamptz | 创建时间 |
| user_id | uuid | 创建者 |

**RLS 策略**：
- SELECT：所有人可读（公开展示）
- INSERT/UPDATE/DELETE：仅登录用户

**新建存储桶 `marker-images`**：
- 公开读取，登录用户可上传
- 单张图片限制 10MB

## 前端组件设计

### 新增依赖
- `leaflet` - 地图引擎
- `react-leaflet` - React 封装

### 组件结构

```text
src/components/
  TravelMap.tsx          -- 主组件（地图 + 标记列表 + 筛选）
  AddMarkerDialog.tsx    -- 添加/编辑地点的弹窗表单
  MarkerPopup.tsx        -- 点击标记后的详情弹窗卡片
```

### TravelMap.tsx（主组件）

- 标题区域：使用 `font-display italic tracking-wide` 保持浪漫风格
- 筛选栏：三个按钮（全部 / 已去过 / 计划中），使用金色主题样式
- 地图区域：
  - 使用深色地图瓦片（与暗色主题匹配），推荐 CartoDB Dark Matter
  - 地图高度：桌面 500px，移动端 350px
  - 圆角边框 + 金色边框光晕（复用 DateBadge 风格）
- 自定义标记图标：
  - 已访问：金色旗帜图标
  - 计划中：蓝色飞机图标
- 登录用户可见的 "Add Place" 按钮

### AddMarkerDialog.tsx（添加地点弹窗）

- 复用 AuthDialog 的 portal 弹窗模式
- 表单字段：地点名称、类型（已去过/计划中）、描述、访问日期、图片上传
- 支持在地图上点击选择坐标，或手动输入
- 图片上传到 `marker-images` 存储桶，压缩后上传

### MarkerPopup.tsx（标记详情卡片）

- 使用 Leaflet Popup 显示
- 卡片内容：地点名称、类型标签、描述、日期、图片缩略图
- 登录用户可见删除按钮
- 样式与页面金色/暗色主题统一

## 地图瓦片选择

使用 CartoDB Dark Matter 瓦片，与页面暗色主题完美融合：

```text
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

## 自定义标记图标

使用 Leaflet DivIcon + Lucide 图标（SVG）生成自定义标记，避免加载外部图片：
- 已访问：MapPin 图标，金色填充
- 计划中：Plane 图标，蓝色填充

## 技术细节

### Leaflet CSS 导入

在 `src/index.css` 顶部添加 Leaflet 样式导入：

```text
@import 'leaflet/dist/leaflet.css';
```

### 地图默认视图

- 中心点：中国中心 [35, 105]
- 默认缩放：4
- 最小缩放：2，最大缩放：18

### 图片上传流程

1. 用户选择图片（限制 10MB）
2. 客户端压缩至最大 1200px 宽度
3. 上传到 `marker-images` 存储桶
4. 将公开 URL 存入 `travel_markers.image_url`

### 响应式适配

- 桌面端：地图高度 500px，筛选按钮水平排列
- 移动端：地图高度 350px，筛选按钮紧凑排列
- 弹窗在移动端全屏显示

| 文件 | 改动 |
|------|------|
| 数据库迁移 | 创建 `travel_markers` 表 + RLS 策略 + `marker-images` 存储桶 |
| `src/index.css` | 添加 Leaflet CSS 导入 |
| `src/components/TravelMap.tsx` | 新建：主地图组件 |
| `src/components/AddMarkerDialog.tsx` | 新建：添加地点弹窗 |
| `src/components/MarkerPopup.tsx` | 新建：标记详情组件 |
| `src/pages/Index.tsx` | 在 PhotoWall 下方添加 TravelMap |
| `package.json` | 新增 leaflet + react-leaflet + @types/leaflet |

