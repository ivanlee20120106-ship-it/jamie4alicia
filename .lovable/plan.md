

# 修复照片墙 HEIC 文件显示失败问题

## 问题根因

`compressImage` 在浏览器无法渲染 HEIC 文件时，通过 `img.onerror` 降级返回原始文件。但后续上传仍使用 `contentType: "image/jpeg"`，导致实际为 HEIC 内容的文件被标记为 JPEG。浏览器尝试以 JPEG 渲染 HEIC 二进制数据，图片破损。

同时，已损坏的 3 个文件需要被识别并清理。

## 修复方案

### 1. 修改 `compressImage` 返回压缩状态（`src/components/PhotoWall.tsx`）

让 `compressImage` 返回一个对象，包含 Blob 和是否为原始文件的标志：

```text
interface CompressResult {
  blob: Blob;
  isOriginal: boolean;
}

const compressImage = (file: File, maxWidth = 1200): Promise<CompressResult> => {
  return new Promise((resolve) => {
    // ... canvas 逻辑不变
    img.onload = () => {
      // 压缩成功
      resolve({ blob: compressedBlob, isOriginal: false });
    };
    img.onerror = () => {
      // 浏览器无法渲染（HEIC等），返回原始文件并标记
      resolve({ blob: file, isOriginal: true });
    };
  });
};
```

### 2. 在上传逻辑中拒绝无法压缩的非 JPEG 文件

在 `handleUpload` 的验证和压缩阶段，如果 `compressImage` 返回 `isOriginal: true` 且原始文件不是 JPEG/PNG/WebP（即浏览器可直接渲染的格式），则跳过该文件并提示用户：

```text
const { blob, isOriginal } = await compressImage(file);
if (isOriginal && !['image/jpeg','image/png','image/webp'].includes(file.type)) {
  toast.error(`${file.name}: 此浏览器无法处理该格式，请在手机设置中将相机格式改为「兼容性最佳」后重新拍照`);
  continue;
}
```

### 3. 清理已损坏的文件

需要识别并删除存储桶中已损坏的 HEIC 文件（以 `.jpg` 扩展名存储但内容为 HEIC 的文件）。通过登录后在照片墙中点击破损图片，使用 Delete 功能手动删除。

---

## 技术细节

### 文件变更

| 文件 | 变更 |
|------|------|
| `src/components/PhotoWall.tsx` | 1. `compressImage` 返回 `CompressResult` 对象 2. `handleUpload` 检查 `isOriginal` 标志并拒绝不可渲染的格式 |

### 修改后的上传流程

```text
用户选择文件
  -> 验证文件类型（Magic Bytes）
  -> compressImage() 尝试压缩
    -> 成功: 返回 { blob: jpegBlob, isOriginal: false }
    -> 失败 (HEIC等): 返回 { blob: originalFile, isOriginal: true }
  -> 检查 isOriginal
    -> true 且非浏览器可渲染格式: 跳过并提示用户
    -> false 或浏览器可渲染格式: 上传
```

### 为什么不使用客户端 HEIC 转换库

- `heic2any` 等库体积较大（~200KB+），会增加首屏加载时间
- 该网站是轻量级情侣纪念页面，不适合引入重型依赖
- 更好的方案是引导用户在 iOS 设置中将相机格式改为「兼容性最佳」（JPG）

