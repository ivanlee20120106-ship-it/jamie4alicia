

# 移除音乐播放按钮，保留纯后台循环播放

## 问题

用户希望去掉截图中红框标注的 "Now Playing" 音乐按钮 UI，只保留后台自动播放和循环播放功能。

## 具体改动

### 1. `src/components/MusicButton.tsx`

- 删除所有可见的 UI 元素（按钮、播放面板、上传功能）
- 只保留 `<audio>` 标签和自动播放/循环逻辑
- 删除 `isOpen`、`uploading`、`user` 等仅与 UI 相关的状态
- 保留 `tracks`、`currentTrack`、`audioRef` 和自动播放 + 循环的 `useEffect`
- 组件只渲染一个隐藏的 `<audio>` 元素，不渲染任何可见内容

### 2. `src/components/HeroSection.tsx`

- 移除 MusicButton 的包裹 `div`（含 `relative z-20 mt-6`）
- 将 `<MusicButton />` 直接放在 HeroSection 内部（无需包裹容器），因为它不再有可见 UI
- 或者将 MusicButton 移到更上层（如 Index.tsx）也可以，但保持在 HeroSection 内最简单

### 3. 不需要改动的部分

- `src/index.css` 中的 marquee 动画可以保留（不影响功能），或清理掉（因为不再使用）
- 自动播放逻辑（`tryPlay` + 浏览器交互降级）完全保留
- 循环播放逻辑（`handleEnded`）完全保留

