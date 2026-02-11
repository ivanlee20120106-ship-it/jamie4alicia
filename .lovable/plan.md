

# 音乐按钮图标更换 + Bug 修复

## 1. 音乐按钮图标更换

将 emoji（🔊/🔇）替换为 lucide-react 的浪漫风格图标，与网站整体氛围一致：

- **播放中**：使用 `Music` 图标（音符），金色（`text-gold`）
- **已暂停**：使用 `VolumeOff` 图标，灰色（`text-muted-foreground`）

按钮样式保持不变（圆形、毛玻璃、fixed bottom-6 right-6）。

### 改动文件：`src/components/MusicButton.tsx`
- 导入 `Music` 和 `VolumeOff` from `lucide-react`
- 将 emoji 替换为对应图标组件

## 2. Bug 修复：PhotoWall 图片验证

### 问题
`validateImageFile` 中检测 WebP 格式时访问了 `bytes[8]`，但 `file.slice(0, 8)` 只读取了前 8 个字节（索引 0-7），`bytes[8]` 始终为 `undefined`，导致 WebP 文件永远无法通过魔术字节验证。

### 修复
将 `file.slice(0, 8)` 改为 `file.slice(0, 12)`，确保能读取到 WebP 的 RIFF 标识字节。

### 改动文件：`src/components/PhotoWall.tsx`
- 第 90 行：`file.slice(0, 8)` 改为 `file.slice(0, 12)`

## 改动总览

| 文件 | 改动内容 |
|------|---------|
| `MusicButton.tsx` | 图标从 emoji 换为 lucide-react Music/VolumeOff |
| `PhotoWall.tsx` | 修复 WebP 魔术字节检测的切片长度 |

