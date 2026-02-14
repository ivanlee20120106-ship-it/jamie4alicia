

# 照片墙移动端加载优化

## 问题分析

当前照片墙的 36 张照片全部以原始分辨率（最大 1200px）加载，但缩略图在移动端仅为 34px、平板 55px、桌面 70px。这导致移动端需要下载大量不必要的数据，加载缓慢。

## 解决方案

利用 Supabase Storage 的图片变换功能，为缩略图生成小尺寸版本，Lightbox 中才加载原图。

### 具体改动

**文件：`src/components/PhotoWall.tsx`**

1. 新增一个工具函数，通过 Supabase Storage 的 `render/image` transform endpoint 生成缩略图 URL：
   - 缩略图使用 `width=150&resize=cover` 参数（覆盖所有屏幕尺寸的 2x 分辨率需求）
   - Photo 接口新增 `thumbnailUrl` 字段

2. 修改 `fetchPhotos` 中的 URL 生成逻辑：
   - `url`：保持原图 URL（用于 Lightbox）
   - `thumbnailUrl`：附加 transform 参数的缩略图 URL

3. 网格渲染中的 `<img>` 标签使用 `thumbnailUrl` 替代 `url`

**文件：`src/components/PhotoLightbox.tsx`**

- 无需改动，已使用 `photo.url`（原图）

### 技术细节

Supabase Storage 图片变换 URL 格式：
```text
{publicUrl}?width=150&resize=cover&quality=75
```

Photo 接口变更：
```text
interface Photo {
  name: string;
  url: string;         // 原图，用于 Lightbox
  thumbnailUrl: string; // 缩略图，用于网格
}
```

fetchPhotos 改动：
```text
.map((f) => {
  const publicUrl = supabase.storage.from("photos").getPublicUrl(f.name).data.publicUrl;
  return {
    name: f.name,
    url: publicUrl,
    thumbnailUrl: `${publicUrl}?width=150&resize=cover&quality=75`,
  };
})
```

### 预期效果

- 每张缩略图从约 100-300KB 降至约 5-15KB
- 36 张照片总加载量从约 5-10MB 降至约 200-500KB
- 移动端加载速度提升 10-20 倍

| 文件 | 改动 |
|------|------|
| `src/components/PhotoWall.tsx` | Photo 接口新增 thumbnailUrl、fetchPhotos 生成缩略图 URL、网格 img 使用缩略图 |

