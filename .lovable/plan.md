

# 扩大地图画幅 + 隐藏 Leaflet 归属标识

## 改动概述

1. **扩大地图高度**：将地图容器从当前的 `h-[350px] sm:h-[500px]` 增大到 `h-[450px] sm:h-[650px]`，并将初始缩放级别从 4 调整为 2，确保完整世界地图可见
2. **隐藏归属标识**：在 MapContainer 上设置 `attributionControl={false}` 来移除右下角的 "Leaflet | © OpenStreetMap" 文字

## 需要修改的文件

| 文件 | 改动 |
|------|------|
| `src/components/TravelMap.tsx` | MapContainer 增加 `attributionControl={false}`，调整 `zoom` 为 2，增大地图容器高度 |

## 技术细节

**TravelMap.tsx** 中 MapContainer 的修改：

```text
变更前：
  center={[35, 105]} zoom={4} className="h-[350px] sm:h-[500px]"

变更后：
  center={[20, 105]} zoom={2} attributionControl={false} className="h-[450px] sm:h-[650px]"
```

- `zoom={2}`：缩小初始视图，让完整世界地图在画面中展示清楚
- `center={[20, 105]}`：稍微下移中心点，让各大洲分布更均匀
- `attributionControl={false}`：隐藏右下角的 Leaflet/OpenStreetMap 归属文字
- 增大高度让地图区域更宽敞

