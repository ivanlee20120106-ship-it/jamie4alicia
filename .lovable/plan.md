

# 天数计算校准

## 问题

当前 `getDaysTogether` 返回 `todayDays - annivDays`，在纪念日当天（2022.09.18）结果为 0。按照规则，纪念日当天应计为第 1 天。

## 改动

**文件：`src/components/HeroSection.tsx`**

第 11 行：

```text
// 当前
return todayDays - annivDays;

// 修改为
return todayDays - annivDays + 1;
```

这样 2022.09.18 当天显示 1 天，今天（2026.02.14）显示 1246 天。

| 文件 | 改动 |
|------|------|
| `src/components/HeroSection.tsx` | 第 11 行加 `+ 1`，纪念日当天算第 1 天 |

