

# 地形图图层 + 全英文城市展示

## 改动内容

### 1. 切换为地形图瓦片图层
将当前的 OpenStreetMap 标准瓦片替换为带有地形效果的瓦片，同时确保城市/地名标注为英文。

使用 OpenTopoMap 或 CartoDB Positron（英文标注）作为底图。推荐使用 **CartoDB Positron**，因为它风格简洁优雅，与项目的浪漫艺术风格更搭配，且默认英文标注。

备选方案：使用 Esri World Terrain Base + Esri 英文标注叠加层。

| 文件 | 改动 |
|------|------|
| `src/components/map/MapContent.tsx` | TileLayer URL 替换为 CartoDB Positron 英文瓦片 |

### 2. Nominatim 搜索结果改为英文返回
当前 `MapButtons.tsx` 中的 Nominatim API 使用 `accept-language=zh`（中文），改为 `accept-language=en` 以返回英文地名。

| 文件 | 改动 |
|------|------|
| `src/components/map/MapButtons.tsx` | `accept-language=zh` 改为 `accept-language=en` |

### 3. 地图中剩余中文文字改为英文
- `MapContent.tsx` 第 89 行："点击位置" -> "Clicked Location"
- `MapPopup.tsx` 第 72 行："解析地址中..." -> "Loading address..."
- `MapPopup.tsx` 第 95 行：title="复制坐标" -> title="Copy coordinates"
- `MapPopup.tsx` 第 109 行："删除" -> "Delete"

| 文件 | 改动 |
|------|------|
| `src/components/map/MapContent.tsx` | 中文标签改英文 |
| `src/components/map/MapPopup.tsx` | 中文标签改英文 |

## 技术细节

**CartoDB Positron 瓦片 URL（英文标注）：**
```
https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
```
此瓦片风格为浅色简洁底图，地名默认英文，与项目整体风格一致，且免费使用。

