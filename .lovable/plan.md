

# 添加周年纪念与情人节计数器

## 布局设计

桌面端（md 及以上）：三栏水平排列

```text
+---------------------+-------------------------+---------------------+
| Xth Anniversary     | We have been together   | Xth Valentine's Day |
| We've celebrated    |     1247 days            | We've celebrated    |
| our Xth anniversary | Every day is the best   | our Xth Valentine's |
+---------------------+-------------------------+---------------------+
```

移动端（md 以下）：垂直堆叠

```text
+-------------------------+
| Xth Anniversary         |
+-------------------------+
| We have been together   |
|     1247 days            |
| Every day is the best   |
+-------------------------+
| Xth Valentine's Day     |
+-------------------------+
```

## 动态计算逻辑

**周年纪念**：第 1 个周年纪念 = 2023.09.18，计算公式为 `currentYear - 2022`，若当前日期还没到 9 月 18 日则减 1。

**情人节**：第 1 个情人节 = 2023.02.14（在一起后的首个），计算公式为 `currentYear - 2022`，若当前日期还没到 2 月 14 日则减 1。

两个计数均基于 UTC+8 时区，与天数计算保持一致。

## 技术细节

**文件：`src/components/HeroSection.tsx`**

1. 新增两个计算函数：

```text
const getAnniversaryCount = (): number => {
  // 基于 UTC+8 的当前日期
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 3600000);
  const year = utc8.getUTCFullYear();
  const month = utc8.getUTCMonth(); // 0-indexed
  const day = utc8.getUTCDate();
  // 还没到今年的 9.18 则减 1
  let count = year - 2022;
  if (month < 8 || (month === 8 && day < 18)) count--;
  return Math.max(count, 0);
};

const getValentineCount = (): number => {
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 3600000);
  const year = utc8.getUTCFullYear();
  const month = utc8.getUTCMonth();
  const day = utc8.getUTCDate();
  let count = year - 2022;
  if (month < 1 || (month === 1 && day < 14)) count--;
  return Math.max(count, 0);
};
```

2. 在 `useEffect` 的定时刷新中同时更新这两个值。

3. 将原来的 Day counter 区域（第 62-71 行）重构为三栏响应式布局：

```text
<div className="mt-8 sm:mt-12 animate-fade-in-up flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 md:gap-10 w-full max-w-5xl">
  {/* 左侧 - 周年纪念 */}
  <MilestoneBadge
    ordinal={anniversaries}
    title="Anniversary"
    subtitle="We've celebrated our"
    suffix="anniversary"
  />

  {/* 中间 - 天数（保持原样式） */}
  <div className="text-center">
    <p className="...">We have been together for</p>
    <div className="...">
      <span className="...">{days}</span>
      <span className="...">days</span>
    </div>
    <p className="...">Every day is the best day</p>
  </div>

  {/* 右侧 - 情人节 */}
  <MilestoneBadge
    ordinal={valentines}
    title="Valentine's Day"
    subtitle="We've celebrated our"
    suffix="Valentine's Day"
  />
</div>
```

4. 新增 `MilestoneBadge` 组件，复用 `DateBadge` 的视觉风格（圆角边框、半透明背景、金色文字），显示序数词（1st, 2nd, 3rd, 4th...）。

序数词工具函数：
```text
const getOrdinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
// 3 -> "3rd", 4 -> "4th"
```

## 当前预期值（2026.02.15）

- 周年纪念：第 3 个（3rd Anniversary）
- 情人节：第 4 个（4th Valentine's Day）
- 天数：1247 天

| 文件 | 改动 |
|------|------|
| `src/components/HeroSection.tsx` | 新增周年/情人节计算函数、MilestoneBadge 组件、三栏响应式布局 |

