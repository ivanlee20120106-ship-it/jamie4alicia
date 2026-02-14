

# 照片墙编号 + 左右方向键导航

## 功能概述

1. 在照片墙每个格子上叠加显示编号（01-36），按从左到右、从上到下的顺序
2. 在 Lightbox（照片放大浏览）中添加左右箭头按钮，支持在照片之间切换
3. 第 1 张照片（01）不显示左箭头，最后一张照片不显示右箭头

## 具体改动

### 1. `src/components/PhotoWall.tsx`

- 将 `selectedPhoto` 从存储照片名称改为存储**照片索引**（数字），方便左右导航
- 在心形网格渲染中，每个有照片的格子叠加一个半透明编号标签（如 "01", "02"...），使用 `absolute` 定位在左上角
- 将照片列表 `photos` 传递给 `PhotoLightbox`，同时传入当前选中的索引和切换回调

### 2. `src/components/PhotoLightbox.tsx`

- 接口改为接收整个照片列表、当前索引、以及 `onPrev` / `onNext` 回调
- 添加左右箭头按钮（使用 lucide-react 的 `ChevronLeft` / `ChevronRight`）
- 当索引为 0 时隐藏左箭头；当索引为最后一张时隐藏右箭头
- 添加键盘事件监听（`ArrowLeft` / `ArrowRight`），支持键盘操作

## 技术细节

### PhotoWall 状态变更

```text
// 之前
const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

// 之后
const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
```

### PhotoLightbox 接口变更

```text
// 之前
interface PhotoLightboxProps {
  photoName: string;
  onClose: () => void;
  onDelete: (name: string) => void;
  canDelete?: boolean;
}

// 之后
interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onDelete: (name: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canDelete?: boolean;
}
```

### 编号标签样式

在每个照片格子上叠加一个小标签，使用半透明黑底白字，不影响照片查看：

```text
<span className="absolute top-0.5 left-0.5 text-[8px] sm:text-[10px] 
  bg-black/50 text-white rounded px-0.5 leading-tight">
  {编号}
</span>
```

### 键盘导航

在 `PhotoLightbox` 中使用 `useEffect` 监听 `keydown` 事件，处理 `ArrowLeft` 和 `ArrowRight` 键。

### 文件变更总结

| 文件 | 变更 |
|------|------|
| `src/components/PhotoWall.tsx` | 状态改为索引、格子叠加编号、传递导航回调给 Lightbox |
| `src/components/PhotoLightbox.tsx` | 接收照片列表和索引、添加左右箭头按钮、键盘事件监听 |

