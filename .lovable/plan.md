

# 在照片墙中支持 HEIC 格式图片上传和展示

## 当前问题

目前当用户上传 HEIC 格式照片时（iOS 默认格式），非 Safari 浏览器无法渲染该格式，导致压缩失败后直接跳过上传并提示用户更改手机设置。这对用户体验不友好。

## 解决方案

引入 `heic2any` 库，在上传时自动将 HEIC/HEIF 文件转换为 JPEG，再进行压缩和上传。使用动态导入（`import()`）确保该库仅在需要时加载，不影响首屏性能。

## 具体改动

### 1. 安装依赖

- 添加 `heic2any`（MIT 协议，~454K 周下载量）

### 2. 修改 `src/components/PhotoWall.tsx`

新增一个 `convertHeicToJpeg` 辅助函数，在 `handleUpload` 的压缩步骤之前调用：

```text
用户选择文件
  -> 验证文件类型（Magic Bytes）
  -> 如果是 HEIC/HEIF 格式:
       -> 动态导入 heic2any
       -> 转换为 JPEG Blob
       -> 显示"正在转换格式..."提示
  -> compressImage() 压缩（此时已是 JPEG，所有浏览器都能渲染）
  -> 上传
```

关键改动点：
- 新增 `convertHeicIfNeeded(file)` 函数：检测文件是否为 HEIC（通过 Magic Bytes 的 ftyp 标志），如果是则用 `heic2any` 转为 JPEG
- 移除之前的 `isOriginal` 拒绝逻辑，因为 HEIC 文件现在会被转换而非拒绝
- `compressImage` 的 `CompressResult` 接口保持不变，仍可处理其他不可渲染格式的降级

### 3. 上传流程变化

| 步骤 | 之前 | 之后 |
|------|------|------|
| HEIC 文件 | 压缩失败 -> 跳过并报错 | 自动转换为 JPEG -> 正常压缩上传 |
| 用户体验 | 提示用户改手机设置 | 无感知，自动处理 |
| 首屏加载 | 不受影响 | 不受影响（动态导入） |

## 技术细节

### 文件变更

| 文件 | 变更 |
|------|------|
| `package.json` | 添加 `heic2any` 依赖 |
| `src/components/PhotoWall.tsx` | 新增 HEIC 转换逻辑，移除 HEIC 拒绝逻辑 |

### `convertHeicIfNeeded` 实现思路

```text
const convertHeicIfNeeded = async (file: File): Promise<File> => {
  // 检查是否为 HEIC（通过 ftyp magic bytes 或文件扩展名）
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const isFTYP = bytes[4]===0x66 && bytes[5]===0x74 && bytes[6]===0x79 && bytes[7]===0x70;
  const ext = file.name.toLowerCase();
  const isHeic = isFTYP || ext.endsWith('.heic') || ext.endsWith('.heif');
  
  if (!isHeic) return file;
  
  // 动态导入 heic2any（仅在需要时加载）
  const heic2any = (await import('heic2any')).default;
  const jpegBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
  const blob = Array.isArray(jpegBlob) ? jpegBlob[0] : jpegBlob;
  return new File([blob], file.name.replace(/\.heic|\.heif/i, '.jpg'), { type: 'image/jpeg' });
};
```

### 性能考量

- `heic2any` 仅在用户实际上传 HEIC 文件时才加载（动态 import）
- 转换后的 JPEG 文件会继续经过 `compressImage` 压缩到 1200px 宽度
- 转换过程中显示"正在转换格式..."提示

