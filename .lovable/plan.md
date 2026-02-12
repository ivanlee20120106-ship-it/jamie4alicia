

# 移动端音乐自动播放修复 + 倒计时精确刷新

## 问题分析

### 问题 1：移动端音乐无法自动播放

当前代码存在以下问题：

- **交互监听器泄漏**：`useEffect` 的 cleanup 函数只移除了 `ended` 事件监听器，没有移除 `click/touchstart/scroll/keydown` 交互监听器。当 `tracks` 或 `currentTrack` 变化时 effect 重新执行，会注册重复的监听器。
- **iOS Safari 限制**：iOS 要求音频播放必须由直接的用户手势触发，且音频元素需要先通过 `load()` 解锁。当前代码在设置 `audio.src` 后直接尝试 `play()`，没有先调用 `load()`。
- **监听器清理时机**：`startOnInteraction` 内部在触发一次后移除所有监听器，但如果那次 `play()` 仍然失败（比如在某些移动浏览器中），就再也无法重试了。

### 问题 2：倒计时刷新逻辑

当前逻辑每 60 秒轮询一次，存在以下问题：

- 不精确：可能在 UTC+8 午夜后最多延迟 59 秒才刷新
- 无谓轮询：一天中大部分时间天数不会变化，但仍在持续执行

`getDaysTogether()` 函数的日期计算本身是正确的（UTC+8 today 与 anniversary 都转为本地午夜做差），但刷新策略需要优化。

---

## 修复方案

### 1. MusicButton.tsx - 移动端自动播放修复

**改动内容：**

- 使用 `useRef` 保存交互监听器引用，确保 cleanup 时能正确移除
- 在设置 `audio.src` 后调用 `audio.load()` 以兼容 iOS Safari
- 交互监听器触发后，如果 `play()` 仍失败则不移除监听器（保留重试能力）
- 在 `useEffect` cleanup 中统一移除所有交互监听器，防止泄漏
- 添加 `pointerdown` 事件（覆盖更多移动端交互场景）

### 2. HeroSection.tsx - UTC+8 午夜精确刷新

**改动内容：**

- 计算距离下一个 UTC+8 午夜的毫秒数
- 使用 `setTimeout` 在 UTC+8 午夜精确触发刷新，而非每分钟轮询
- 刷新后重新计算下一个午夜时间，设置新的 timeout
- 保留 `getDaysTogether()` 函数不变（计算逻辑正确）

---

## 技术细节

### MusicButton.tsx 改动

```text
改动点:
1. 新增 listenerRef = useRef 保存 startOnInteraction 函数引用
2. audio.src = ... 之后追加 audio.load()
3. startOnInteraction 中: play 成功才移除监听器，失败则保留
4. useEffect cleanup 中: 移除 ended + 所有交互监听器
5. 交互事件列表增加 'pointerdown'
```

### HeroSection.tsx 改动

```text
改动点:
1. 计算 msUntilUtc8Midnight 函数:
   - 获取当前 UTC+8 时间
   - 计算到次日 UTC+8 00:00:00 的毫秒差
2. useEffect 中用 setTimeout 替代 setInterval:
   - 在 UTC+8 午夜触发 setDays(getDaysTogether())
   - 触发后递归设置下一个午夜的 timeout
```

### 改动文件总览

| 文件 | 改动 |
|------|------|
| `src/components/MusicButton.tsx` | 修复交互监听器泄漏、添加 audio.load()、增加 pointerdown 事件、保留重试能力 |
| `src/components/HeroSection.tsx` | 替换 60s 轮询为 UTC+8 午夜精确 setTimeout |

