

# 给 Header 添加底部内边距

从截图可以看到，Header 底部边框与下方内容（"Jamie & Alica"）之间缺少间距，显得过于紧凑。

## 改动

**文件**: `src/components/Header.tsx`

将 header 的 `py-4` 改为 `pt-4 pb-6`（或类似值如 `pb-8`），增加底部内边距，让 Header 与下方内容之间有更多呼吸空间。

这是一个单行修改，只调整 className 中的 padding 值。

