

# 修复纪念日计数的时区 Bug

## 问题

当前代码将 UTC+8 的年/月/日提取后，传入 `new Date(year, month, date)` 构造函数。该构造函数使用**设备本地时区**的午夜，而非 UTC+8 午夜。这导致：

1. **天数计算**：非 UTC+8 时区的用户可能多算或少算 1 天
2. **午夜刷新**：定时器倒计时到本地午夜而非 UTC+8 午夜，刷新时间可能偏差数小时

## 修复方案

改用纯数学方式计算，完全避免本地时区干扰：

### `getDaysTogether` 修复

```text
// 将 UTC 时间戳加 8 小时得到 UTC+8 时间戳，再除以一天的毫秒数取整得到天数
const utc8Ms = now.getTime() + 8 * 3600000;
const todayDays = Math.floor(utc8Ms / 86400000);

// 纪念日同样用 UTC+8 天数
const annivUtc8Ms = Date.UTC(2022, 8, 17) + 8 * 3600000;
const annivDays = Math.floor(annivUtc8Ms / 86400000);

return todayDays - annivDays;
```

### `getMsUntilUtc8Midnight` 修复

```text
// 当前 UTC+8 时间戳
const utc8Ms = now.getTime() + 8 * 3600000;
// 今天已过的毫秒数
const msSinceMidnight = utc8Ms % 86400000;
// 距离下一个 UTC+8 午夜的毫秒数
return 86400000 - msSinceMidnight + 1000;
```

## 改动文件

| 文件 | 改动 |
|------|------|
| `src/components/HeroSection.tsx` | 重写 `getDaysTogether` 和 `getMsUntilUtc8Midnight`，用纯数学运算替代本地时区构造函数 |

## 验证

修复后无论用户在哪个时区，天数计算和刷新时间都会精确对齐到 UTC+8 午夜 0:00。
