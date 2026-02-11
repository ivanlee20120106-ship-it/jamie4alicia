

# 音乐播放器与 Anniversary 区域分离

## 问题

从截图可以看到，音乐播放器的展开面板（包含进度条、播放控制）与下方的 "2022.09.17 Anniversary" 区域重叠，视觉上混在一起。

## 解决方案

### 1. 调整 HeroSection 布局（`src/components/HeroSection.tsx`）

- 将 MusicButton 包裹在一个 `relative` 容器中，并增加足够的 `z-index`，确保播放面板浮在 Anniversary 上方而非穿透
- 增加 MusicButton 与 Anniversary 之间的间距（`mt-10` 或更大），为播放面板展开留出空间

### 2. 调整 MusicButton 面板定位（`src/components/MusicButton.tsx`）

- 播放面板改为向上弹出（`bottom-full mb-4`）而非向下（`top-full mt-4`），这样展开时不会遮挡下方的 Anniversary 区域
- 或者保持向下弹出，但增加 MusicButton 父容器的 `z-50`，确保面板始终浮在 Anniversary 之上且有明确的视觉分层

**推荐方案：面板向上弹出**，这样无论间距多大都不会覆盖 Anniversary。

### 3. 播放功能确认

现有代码已满足需求：
- 点击 Play Music 自动循环播放 "I Love You So (Instrumental)"（单曲时 `handleEnded` 自动重播）
- 播放/暂停按钮正常工作
- 上一首/下一首按钮在多曲目时启用

## 具体改动

### `src/components/MusicButton.tsx`
- 将面板定位从 `absolute top-full mt-4` 改为 `absolute bottom-full mb-4`，使面板向上展开

### `src/components/HeroSection.tsx`
- 为 MusicButton 的包裹 `div` 添加 `relative z-20`，确保面板层级高于 Anniversary
- Anniversary 区域保持不变

