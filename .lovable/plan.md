

# 去掉 Leaflet/OpenStreetMap 归属标签

## 问题

虽然已经在 `MapContainer` 上设置了 `attributionControl={false}`，但 `TileLayer` 组件本身仍然通过 `attribution` 属性传递了归属文本，这会重新创建归属标签。

## 解决方案

在 `src/components/map/MapContent.tsx` 的 `TileLayer` 中移除 `attribution` 属性，这样归属文字就不会再显示。

## 修改文件

| 文件 | 改动 |
|------|------|
| `src/components/map/MapContent.tsx` | 删除 TileLayer 的 `attribution` 属性（第 61 行） |

