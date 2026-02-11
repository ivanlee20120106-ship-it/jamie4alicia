

# 网站打开自动播放并循环

## 问题

当前需要用户点击 "Play Music" 按钮才能开始播放音乐，用户希望打开网站后自动播放并循环。

## 注意事项

现代浏览器（Chrome、Safari、Firefox）默认阻止自动播放带声音的音频。常见的解决方案是：
- 先尝试自动播放
- 如果被浏览器阻止，则监听用户的第一次点击/触摸/滚动等交互事件，交互后立即自动开始播放

## 具体改动

### `src/components/MusicButton.tsx`

1. **组件加载时自动播放**：在 `useEffect` 中，当 tracks 加载完成后，自动设置 `isPlaying = true` 并调用 `audio.play()`

2. **处理浏览器自动播放限制**：如果 `audio.play()` 被拒绝（返回 rejected promise），添加一个全局的一次性事件监听器（`click` / `touchstart` / `scroll`），在用户首次交互时自动开始播放

3. **保持循环播放逻辑不变**：现有的 `handleEnded` 已实现单曲循环（`audio.currentTime = 0; audio.play()`）

4. **默认展开播放面板**：将 `isOpen` 初始值改为 `true`，让用户一进来就能看到播放状态

### 核心代码逻辑

```
// 在 tracks 加载完成后的 useEffect 中：
useEffect(() => {
  if (tracks.length === 0 || !audioRef.current) return;
  
  const audio = audioRef.current;
  audio.src = tracks[currentTrack]?.url || "";
  
  // 自动尝试播放
  const tryPlay = () => {
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      // 浏览器阻止了自动播放，等待用户交互
      const startOnInteraction = () => {
        audio.play().then(() => setIsPlaying(true));
        ['click','touchstart','scroll','keydown'].forEach(e => 
          document.removeEventListener(e, startOnInteraction)
        );
      };
      ['click','touchstart','scroll','keydown'].forEach(e => 
        document.addEventListener(e, startOnInteraction, { once: false })
      );
    });
  };
  
  tryPlay();
  // ... 其余事件监听保持不变
}, [tracks, currentTrack]);
```

### 改动文件

- `src/components/MusicButton.tsx`：添加自动播放逻辑和浏览器限制的降级处理

