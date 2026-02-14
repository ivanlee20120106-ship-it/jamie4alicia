

# 安卓移动端照片墙显示 Bug 修复

## 问题分析

从截图可以看到，照片墙的心形网格在安卓端出现列对齐错位问题。根本原因是 CSS Grid 使用了 `gridTemplateColumns: "repeat(9, 1fr)"`，`1fr` 会将可用空间等分为 9 列，但每列实际宽度大于固定的 34px 单元格宽度，导致单元格在列内左对齐，造成行与行之间不对齐。

此外，没有照片的心形格子显示了 `bg-muted/40` 背景色，在底部形成了空的占位方块，视觉效果不佳。

## 解决方案

**文件：`src/components/PhotoWall.tsx`**

1. **修复网格对齐**：将 `gridTemplateColumns` 从 `repeat(9, 1fr)` 改为使用固定尺寸匹配单元格宽度，并添加 `place-items: center`。使用响应式内联样式：
   - 移动端：`repeat(9, 34px)`
   - 平板 (sm)：`repeat(9, 55px)`
   - 桌面 (md)：`repeat(9, 70px)`

2. **优化空格子显示**：将没有照片的心形格子的 `bg-muted/40` 改为更透明的 `bg-muted/20`，减少视觉干扰

3. **移除单元格固定宽高类**：改用 `aspect-ratio: 1` + `w-full` 让单元格自动适应列宽，避免尺寸冲突

## 技术细节

核心改动 -- 将 inline style 的 grid 定义改为使用 CSS 变量或直接固定像素值：

```text
// 替换当前的 grid 容器
<div
  className="grid gap-1.5 sm:gap-2 md:gap-2.5 justify-center"
  style={{
    gridTemplateColumns: "repeat(9, var(--cell-size))"
  }}
>
```

同时用 CSS 自定义属性 `--cell-size` 通过 Tailwind 的响应式断点控制：
- 默认 34px、sm 断点 55px、md 断点 70px

或者更简单地，直接用一个 wrapper div 加上响应式 CSS 类来控制 `--cell-size`。

空格子和无照片格子的背景透明度调低，减少安卓端的视觉噪音。

| 文件 | 改动 |
|------|------|
| `src/components/PhotoWall.tsx` | 修复 grid 列定义为固定像素值、优化空格子样式、提升响应式适配 |

