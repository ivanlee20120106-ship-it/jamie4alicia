

# 用 SVG 心形 + 心电图波形替换现有心跳动画

## 概述

参照用户提供的 Vivus.js 心跳代码，将当前两个简单的 `♥` 文字符号替换为带有以下特性的 SVG 心形组件：

1. **SVG 心形轮廓** - 使用 stroke 描边的心形路径（无填充），带发光阴影
2. **心电图（ECG）波形** - 每颗心下方显示一条循环滚动的心电图线
3. **心跳跳动动画** - 保留 scale 缩放的心跳效果（左 1.73x，右 1.58x）
4. **标签与 BPM 显示** - 左心标注 "TA"（72 BPM），右心标注 "你"（75 BPM）

## 设计适配

由于当前项目使用 React + Tailwind，不引入 Vivus.js 库，而是用纯 CSS 动画实现：
- 心形 SVG 路径使用 `stroke-dasharray` + `stroke-dashoffset` 动画模拟描绘效果
- 心电图使用 CSS `translateX` 动画实现无限滚动
- 颜色适配项目现有配色体系（gold / love 色调），不改变整体配色

## 涉及文件

### 1. 新建 `src/components/HeartbeatHeart.tsx`

独立的心跳心形组件，接收 props：
- `label`: 显示文字（"TA" / "你"）
- `bpm`: 心率数值
- `variant`: "left" | "right"，控制颜色和动画差异
- `className`: 外部样式

组件结构：
```text
+------------------+
|    [SVG 心形]     |   <- 带 stroke 描边 + drop-shadow 发光
|  (跳动动画)       |
|                  |
| [心电图 ECG 波形] |   <- SVG polyline 水平滚动
|                  |
|      TA          |   <- 标签
|   72 BPM         |   <- 心率
+------------------+
```

技术细节：
- SVG viewBox 设为 `0 0 200 200`，心形路径取自用户代码
- 心电图用 SVG `polyline`，路径数据取自用户代码的 ECG 波形点
- 左心颜色使用 `hsl(var(--love))` (peru 棕)，右心使用 `hsl(var(--gold))` (burlywood)
- 心跳 scale 动画复用现有 `animate-heartbeat-left` / `animate-heartbeat-right`，但 scale 值需要调回接近 1 的范围（因为 SVG 本身已经有合适大小），改为左心基准 1.0 峰值 1.15，右心基准 1.0 峰值 1.12
- 心电图滚动动画：用 CSS `@keyframes ecg-scroll` 实现 `translateX` 从 0 到 -50% 的循环

### 2. 修改 `src/index.css` - 添加心电图动画 + 调整心跳动画

新增：
- `@keyframes ecg-scroll` - 心电图水平滚动
- `@keyframes heart-draw` - 心形 SVG stroke 描绘动画（页面加载时一次性播放）
- `.animate-ecg-scroll` 类

调整心跳动画 scale 值：
- `heartbeat-left`：基准 1.0，峰值 1.15（因为不再是文字符号，SVG 尺寸已经足够大）
- `heartbeat-right`：基准 1.0，峰值 1.12

### 3. 修改 `src/components/HeroSection.tsx` - 替换心形区域

将生日行中间的两个 `♥` span 替换为两个 `HeartbeatHeart` 组件：

```text
<DateBadge "1992.01.06" />
<HeartbeatHeart label="TA" bpm={72} variant="left" />
<HeartbeatHeart label="你" bpm={75} variant="right" />
<DateBadge "1994.10.21" />
```

布局调整：
- 整行改为 `flex-wrap` 以适配移动端（小屏时心形可能换行）
- 心形组件宽度约 120-150px，确保与 DateBadge 在一行内平衡
- 移动端（< sm）心形缩小到 80-100px

## 不改动的部分

- 整体配色方案
- MusicButton、Anniversary、Day Counter 等其他区域
- FloatingHearts 背景动画
- Header 组件

