

# 添加音乐开关按钮（🔊/🔇）

## 改动内容

### `src/components/MusicButton.tsx`

参考用户提供的 HTML 代码，在现有纯后台播放基础上添加一个浮动的音量切换按钮：

1. **新增 `isPlaying` 状态**：追踪当前播放/暂停状态
2. **添加切换按钮**：固定在页面右下角，显示 🔊（播放中）或 🔇（已暂停）
3. **点击切换逻辑**：
   - 播放中 -> 点击暂停，图标变 🔇
   - 已暂停 -> 点击播放，图标变 🔊
4. **自动播放时同步状态**：`tryPlay` 成功后设置 `isPlaying = true`
5. **保留现有逻辑不变**：云端曲目获取、循环播放、浏览器自动播放降级处理全部保留

### 按钮样式

- 固定定位右下角 (`fixed bottom-6 right-6`)
- 半透明背景 + 毛玻璃效果，与网站整体风格一致
- `z-50` 确保始终在最上层

### 技术细节

```text
组件结构:
  <audio ref={audioRef} />          -- 隐藏的音频元素（不变）
  <button onClick={toggle}>        -- 新增浮动按钮
    🔊 或 🔇
  </button>

toggle 逻辑:
  if (audio.paused) {
    audio.play() -> isPlaying = true
  } else {
    audio.pause() -> isPlaying = false
  }
```

### 改动文件

- `src/components/MusicButton.tsx`：添加 `isPlaying` 状态和浮动切换按钮

