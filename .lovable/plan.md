

# 心跳放大 + Hero 区域布局优化

## 目标
1. 将左心放大至 1.73 倍、右心放大至 1.58 倍（通过 CSS scale 实现）
2. 重新设计 HeroSection 布局，使生日、心跳、音乐按钮、纪念日的排列更具设计感
3. 不改变任何配色

## 设计思路

当前布局是所有元素垂直堆叠，缺乏层次感。优化方向：

- **Names**: 保持顶部居中，增加底部间距让标题更有呼吸感
- **Birthday + Heartbeat 行**: 两个生日卡片左右排列，中间放跳动的双心，形成一个视觉焦点行。心跳符号使用更大的字号配合 scale 动画
- **Music Button**: 独立居中放置在生日行下方，作为一个小巧的交互节点
- **Anniversary**: 独立一行，使用 large 样式突出
- **Day Counter**: 底部，保持现有风格

整体通过统一的间距节奏（gap/margin 递进）和动画延迟（stagger）营造优雅的视觉流。

## 涉及文件

### 1. `src/index.css` - 心跳动画 scale 调整

修改 `@keyframes heartbeat-left`：
- 基准 scale 从 1 改为 1.73
- 峰值按比例调整（约 1.35x 原比例 = 2.34，回弹 0.95x = 1.64，二次峰 1.2x = 2.08）

修改 `@keyframes heartbeat-right`：
- 基准 scale 从 1 改为 1.58
- 峰值按比例调整（约 1.35x = 2.13，回弹 0.95x = 1.50，二次峰 1.2x = 1.90）

### 2. `src/components/HeroSection.tsx` - 布局重构

结构调整为：

```text
+------------------------------------------+
|          Jamie & Alica (标题)              |
|                                          |
|  [His Birthday]  ♥ ♥  [Her Birthday]     |
|                                          |
|              [Music ▶]                   |
|                                          |
|           [2022.09.17]                   |
|           Anniversary                    |
|                                          |
|        We have been together for         |
|              1243 days                   |
|        Every day is the best day ♥       |
+------------------------------------------+
```

具体改动：
- 标题下方 mb 增大到 `mb-6 sm:mb-8`，留出呼吸空间
- 生日 + 心跳组成一个 flex 行，用 `gap-4 sm:gap-6 md:gap-10` 控制间距
- 心跳符号字号增大至 `text-2xl sm:text-3xl`，颜色使用 `text-gold`
- MusicButton 独立居中，与生日行之间用 `gap-6 sm:gap-8` 分隔
- Anniversary 和 Day Counter 的动画延迟微调，形成流畅的入场节奏
- 所有元素包裹在 `max-w-2xl` 容器中保持适当宽度

