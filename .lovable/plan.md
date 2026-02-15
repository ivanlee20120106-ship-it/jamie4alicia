

# 卡片色块视觉设计优化

## 问题分析

从截图可以看到，红框标注的 5 个卡片元素（2 个生日徽章、1 个纪念日徽章、2 个里程碑卡片）视觉效果过于平淡：
- 纯色深蓝背景 + 单像素边框，缺乏层次感
- 没有渐变、光晕等装饰效果，与页面的浪漫艺术风格不协调
- 所有卡片样式雷同，没有主次区分

## 设计方案

### 1. DateBadge（生日 + 纪念日）

**普通尺寸（生日）**：
- 边框改为金色渐变边框（`border-gold/30`），增加 1px 金色微光
- 背景加上从左上到右下的微妙渐变（`bg-gradient-to-br from-card/60 to-card/40`）
- 添加内部光晕效果（`shadow-[inset_0_1px_0_0_hsl(var(--gold)/0.1)]`）
- 添加底部柔和金色投影（`shadow-lg shadow-gold/5`）

**大尺寸（纪念日）**：
- 在普通基础上增强效果：更宽的内边距、更明显的金色边框光晕
- 添加微妙的外发光（`shadow-[0_0_20px_hsl(var(--gold)/0.08)]`）

### 2. MilestoneBadge（周年 + 情人节）

- 渐变背景：`bg-gradient-to-br from-card/70 via-card/50 to-muted/30`
- 金色渐变上边框装饰线（伪元素或顶部 border-t）
- 更柔和的圆角（`rounded-xl`）
- 悬停时微妙放大 + 光晕增强（`hover:scale-[1.02] transition-transform`）
- 底部投影增加深度感

### 3. 统一提升

- 所有卡片的 `backdrop-blur` 从 `sm` 提升到 `md`，增强毛玻璃质感
- 边框从 `border-border/50` 改为 `border-gold/20`，与金色主题统一
- 添加过渡动画 `transition-all duration-300`

## 技术细节

**文件：`src/components/HeroSection.tsx`**

DateBadge 组件改动：
```text
// 当前
<div className="text-center px-4 py-2 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">

// 优化后（普通）
<div className="text-center px-5 py-3 rounded-xl
  border border-gold/20
  bg-gradient-to-br from-card/60 via-card/50 to-muted/30
  backdrop-blur-md
  shadow-[0_2px_16px_hsl(var(--gold)/0.06),inset_0_1px_0_hsl(var(--gold)/0.1)]
  transition-all duration-300 hover:border-gold/30 hover:shadow-[0_4px_24px_hsl(var(--gold)/0.1)]">

// 优化后（大 - 纪念日）
<div className="text-center px-10 py-5 rounded-xl
  border border-gold/25
  bg-gradient-to-br from-card/70 via-card/50 to-muted/30
  backdrop-blur-md
  shadow-[0_4px_24px_hsl(var(--gold)/0.08),inset_0_1px_0_hsl(var(--gold)/0.15)]
  transition-all duration-300 hover:border-gold/35 hover:shadow-[0_6px_32px_hsl(var(--gold)/0.12)]">
```

MilestoneBadge 组件改动：
```text
// 当前
<div className="text-center px-6 py-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm flex flex-col justify-center min-w-[180px]">

// 优化后
<div className="text-center px-8 py-6 rounded-xl
  border border-gold/20 border-t-gold/40
  bg-gradient-to-br from-card/70 via-card/50 to-muted/30
  backdrop-blur-md
  shadow-[0_4px_24px_hsl(var(--gold)/0.06),inset_0_1px_0_hsl(var(--gold)/0.12)]
  transition-all duration-300 hover:scale-[1.02] hover:border-gold/30 hover:shadow-[0_8px_32px_hsl(var(--gold)/0.1)]
  flex flex-col justify-center min-w-[200px]">
```

| 文件 | 改动 |
|------|------|
| `src/components/HeroSection.tsx` | DateBadge 和 MilestoneBadge 的渐变背景、金色边框、光晕投影、悬停动效 |

