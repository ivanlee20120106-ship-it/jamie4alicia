

# 修复上传 17 张照片后报错的问题

## 问题分析

经排查，发现以下可能导致上传失败的原因：

1. **并发压力过大**：6 路并发上传 + 同时进行图片压缩，在处理大量照片时可能导致浏览器内存压力或请求超时
2. **缺少批次间延迟**：连续发送 3 批（每批 6 张）请求之间没有间隔，可能触发后端速率限制
3. **错误信息不够具体**：`uploadWithRetry` 中 Supabase 返回的具体错误被吞掉，只显示通用的"上传出错"

## 修改方案

### 文件：`src/components/PhotoWall.tsx`

#### 1. 在批次之间添加延迟

在每个并发批次完成后，添加 500ms 延迟，避免触发后端速率限制：

```text
for (let i = 0; i < total; i += CONCURRENT_LIMIT) {
  const batch = ...;
  const results = await Promise.all(...);
  // 批次间添加延迟
  if (i + batch.length < total) {
    await new Promise(r => setTimeout(r, 500));
  }
}
```

#### 2. 增强错误日志

在 `uploadWithRetry` 中记录每次失败的具体错误信息（包括 status code 和 message），以便定位问题：

```text
const uploadWithRetry = async (fileName, blob, retries = 1) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const { error } = await supabase.storage.from("photos").upload(...);
    if (!error) return true;
    console.error(`Upload attempt ${attempt + 1} failed for ${fileName}:`, error.message, error);
    if (attempt < retries) await new Promise(r => setTimeout(r, 1500));
  }
  return false;
};
```

#### 3. 增加重试等待时间

将重试间隔从 1 秒增加到 1.5 秒，给后端更多恢复时间。

### 技术细节

| 项目 | 当前值 | 修改后 |
|------|--------|--------|
| 批次间延迟 | 无 | 500ms |
| 重试间隔 | 1000ms | 1500ms |
| 错误日志 | 仅最后一次 console.error | 每次失败都记录详细信息 |

修改完成后，下次上传如果仍有失败，控制台会显示具体的错误原因（如 rate limit / timeout / payload error），帮助进一步定位。

