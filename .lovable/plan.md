

## 音乐按钮位置调整方案

### 问题
音乐按钮当前使用 `fixed bottom-6 right-6 z-50` 定位，导致它与地图右侧的操作按钮组以及页面底部的 Footer 重叠（如截图所示，按钮被 Footer 半遮挡）。

### 解决方案

将音乐按钮从 **右下角** 移动到 **左下角**，避开地图右侧按钮组的冲突，同时增加底部距离以避开 Footer。

### 具体修改

**文件：`src/components/MusicButton.tsx`**

将按钮的定位 class 从：
```
fixed bottom-6 right-6 z-50
```
改为：
```
fixed bottom-20 left-6 z-50
```

- `left-6`：移到左侧，与地图右侧的搜索/标记/定位按钮完全不冲突
- `bottom-20`：提高位置（约 5rem），避免与 Footer 区域重叠

这是唯一需要修改的文件，改动为一行 class 调整。

