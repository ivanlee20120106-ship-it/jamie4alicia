
# 照片墙优化：去除编号 + Bug 修复

## 1. 去除照片左上角数字

从截图和代码中确认，每个照片格子上有一个半透明编号标签（01-36）。需要删除 `PhotoWall.tsx` 中第 266-268 行的 `<span>` 标签及相关的 `label` 变量（第 258 行）。

## 2. 移动端显示检查结果

已在 390px 宽度下测试，发现以下情况：
- 照片墙心形布局正常显示，未溢出屏幕
- 照片格子尺寸为 34px，整体心形可辨识
- Lightbox 弹窗正常，左右导航箭头和键盘操作均正常
- 第 1 张照片无左箭头，最后一张无右箭头，逻辑正确

**无需修改移动端布局。**

## 3. 发现的 Bug

### Bug 1：未使用的导入 `Heart`
第 3 行导入了 `Heart` 图标但未使用，应移除。

### Bug 2：未使用的常量 `FILLED_CELLS`
第 17 行定义了 `FILLED_CELLS` 但从未使用，应移除。

### Bug 3：`CompressResult.isOriginal` 未被使用
`compressImage` 返回 `isOriginal` 字段，但调用处（第 168 行）解构时只取了 `blob`，`isOriginal` 已无用途（HEIC 转换后不再需要判断）。可移除该字段简化接口。

### Bug 4：渲染中使用可变变量 `photoIndex`
第 218 行的 `let photoIndex = 0` 在 render 函数体中作为可变计数器使用。在 React Strict Mode（开发模式下双重渲染）中可能导致编号错乱。应改为在 `map` 回调中通过累计 `HEART_GRID` 前面的 filled cells 来计算索引，而非依赖外部可变变量。

## 技术改动

| 文件 | 改动 |
|------|------|
| `src/components/PhotoWall.tsx` | 移除编号 span、移除 Heart 导入、移除 FILLED_CELLS、移除 CompressResult.isOriginal、重构 photoIndex 为纯计算 |
