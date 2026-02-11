

# 修复移动端布局问题

## 问题 1：生日行在移动端换行错乱（390x844 / 430x930）

当前生日行使用 `flex-wrap`，四个元素（DateBadge + Heart + Heart + DateBadge）在窄屏下放不下一行，导致心形和第二个 DateBadge 被挤到下一行，布局杂乱。

**解决方案**：在小屏幕（< sm）下改为纵向排列，布局为：

```text
[ His Birthday ]  [ Her Birthday ]
      [Heart]  [Heart]
```

具体做法：
- 将生日行改为两行结构：第一行放两个 DateBadge 并排，第二行放两个 Heart 并排
- 仅在 md 及以上屏幕恢复为单行横排（DateBadge - Heart - Heart - DateBadge）

**文件**：`src/components/HeroSection.tsx`（第 30-36 行）

## 问题 2：Header 遮挡标题（375x677）

Header 使用 `fixed` 定位，但 HeroSection 没有足够的顶部间距来避让 Header，导致 "Jamie & Alica" 被遮挡。

**解决方案**：给 HeroSection 添加顶部内边距 `pt-20`（约 80px），确保内容从 Header 下方开始显示。

**文件**：`src/components/HeroSection.tsx`（第 24 行），将 `py-12 sm:py-20` 改为 `pt-20 pb-12 sm:pt-24 sm:pb-20`

## 技术细节

### HeroSection.tsx 改动

1. **顶部间距**：`section` 的 className 中 `py-12 sm:py-20` 改为 `pt-20 pb-12 sm:pt-24 sm:pb-20`

2. **生日+心跳区域重构**：将现有单个 flex 容器拆分为两部分：
   - 外层容器保持 `flex flex-col items-center`
   - 第一行：两个 DateBadge 用 `flex` 横向排列，中间保持间距
   - 第二行：两个 HeartbeatHeart 用 `flex` 横向排列
   - 在 `md` 断点以上，使用 `md:flex-row` 恢复为单行横排（DateBadge - Heart - Heart - DateBadge）

