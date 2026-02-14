

# 修复上传失败的剩余问题

## 问题总结

经过后端排查，确认以下 3 个问题需要修复：

### 问题 1：存储桶 MIME 类型白名单不完整

`photos` 存储桶的 `allowed_mime_types` 只包含 `[image/jpeg, image/png, image/gif, image/webp, image/bmp]`，缺少 `image/heic` 和 `image/heif`。虽然前端会压缩为 JPEG 再上传（contentType 设为 `image/jpeg`），但如果压缩失败或浏览器不支持 HEIC 渲染，原始文件上传会被后端拒绝。

### 问题 2：HEIC 文件无法在浏览器中压缩

`compressImage` 使用 `<img>` + `<canvas>` 进行压缩，但大多数浏览器（除 Safari）不支持渲染 HEIC/HEIF 格式。这会导致 `img.onerror` 触发，压缩失败后整个上传流程中断，用户只看到通用错误提示。

### 问题 3：长时间上传可能导致 token 过期

上传 36 张照片时，压缩 + 上传 + 批次延迟可能耗时数分钟。如果 JWT token 在此期间过期且未刷新，后续批次会因认证失败而报错。

---

## 修复方案

### 修复 1：更新存储桶 MIME 类型（SQL 迁移）

通过 SQL 迁移为 `photos` 存储桶添加 `image/heic` 和 `image/heif` 支持：

```text
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg','image/png','image/gif','image/webp','image/bmp','image/heic','image/heif']
WHERE name = 'photos';
```

### 修复 2：HEIC 压缩失败时的优雅降级（`src/components/PhotoWall.tsx`）

修改 `compressImage` 函数，在 `img.onerror` 时不直接 reject，而是返回原始文件作为 fallback。同时为 HEIC 文件添加特殊提示，建议用户使用 JPG 格式。

具体改动：
- 将 `compressImage` 改为在渲染失败时返回原始 Blob（而非抛错）
- 在 `handleUpload` 中捕获压缩失败并显示友好提示

### 修复 3：上传前刷新 token（`src/components/PhotoWall.tsx`）

在 `handleUpload` 开始时调用 `supabase.auth.getSession()` 强制刷新 token，确保长时间上传期间认证不会过期。

在 `handleUpload` 函数的 `setUploading(true)` 之后添加：

```text
// Refresh token before starting long upload
await supabase.auth.getSession();
```

---

## 技术细节

### 文件变更

| 文件 | 变更内容 |
|------|----------|
| SQL 迁移 | 更新 `photos` 存储桶的 `allowed_mime_types` |
| `src/components/PhotoWall.tsx` | 1. `compressImage` 增加 HEIC 降级处理 2. 上传前刷新 token |

### `compressImage` 修改逻辑

```text
const compressImage = (file: File, maxWidth = 1200): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // 正常压缩逻辑（不变）
    };
    img.onerror = () => {
      // 新增：渲染失败时返回原始文件
      console.warn(`Cannot render ${file.name} in browser, using original`);
      resolve(file);
    };
    img.src = URL.createObjectURL(file);
  });
};
```

### 上传前 token 刷新

在 `handleUpload` 的 `setUploading(true)` 后立即插入：

```text
await supabase.auth.getSession();
```

这会触发 Supabase SDK 检查 token 是否即将过期并自动刷新。

