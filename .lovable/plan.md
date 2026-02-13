

# 图片上传功能 Bug 检查报告与修复计划

## 发现的 Bug

### Bug 1: 移动端心形网格溢出 (严重)

9 列网格在移动端 (390px) 宽度下溢出屏幕：
- 计算：9 x 40px + 8 x 6px (gap-1.5) = 408px
- 可用宽度：390px - 24px (px-3 padding) = 366px
- **结果：网格右侧被裁切，照片显示不完整**

### Bug 2: compressImage 小图会被放大 (中等)

```text
const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
```
当原图尺寸小于 1200px 时，ratio > 1，图片会被放大导致模糊且文件变大。应限制 ratio 不超过 1。

### Bug 3: ObjectURL 内存泄漏 (轻微)

`compressImage` 中 `URL.createObjectURL(file)` 创建的临时 URL 从未被 `URL.revokeObjectURL()` 释放，频繁上传会导致内存泄漏。

### Bug 4: 部分失败时仍显示成功提示 (中等)

即使某些照片验证失败或上传出错，第 120 行的 `toast.success("Photos uploaded successfully!")` 仍会执行，给用户错误的反馈。

### Bug 5: iOS HEIC 格式处理不友好 (轻微)

iOS 相机默认拍摄 HEIC 格式，`accept="image/*"` 允许选择 HEIC 文件，但 Magic Bytes 验证会拒绝它，用户只会看到一个通用错误提示。

---

## 修复方案

### 文件：`src/components/PhotoWall.tsx`

| Bug | 修复内容 |
|-----|---------|
| Bug 1 | 将移动端单元格从 40px 缩小至 34px，使总宽度为 9x34 + 8x6 = 354px，适配 390px 屏幕 |
| Bug 2 | 在 ratio 计算后加 `Math.min(ratio, 1)` 防止放大 |
| Bug 3 | 在 `img.onload` 回调开头添加 `URL.revokeObjectURL(img.src)` |
| Bug 4 | 添加成功/失败计数器，根据实际结果显示对应提示 |
| Bug 5 | 在 MIME/扩展名检查中加入 HEIC/HEIF，并在 Magic Bytes 错误提示中提醒 iOS 用户切换为 JPG 格式 |

