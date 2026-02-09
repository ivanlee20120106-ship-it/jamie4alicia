
# Mobile Adaptation + Heart-Shaped Photo Grid

## Overview
Two main changes: (1) Add responsive mobile adaptations across all components, and (2) Rebuild the photo wall using a pixel-art heart grid layout (based on the reference image) with a 9-column CSS grid.

---

## 1. Photo Wall - Heart Grid Layout

Based on the reference image, the heart shape is a 9-column grid where specific cells are filled to form a pixelated heart. The grid map (row by row) is:

```text
Row 0:  _ X X _ _ X X _ _
Row 1:  X X X X X X X X _
Row 2:  X X X X X X X X X
Row 3:  _ X X X X X X X _
Row 4:  _ _ X X X X X _ _
Row 5:  _ _ _ X X X _ _ _
Row 6:  _ _ _ _ X _ _ _ _
```

Total filled cells: ~41 slots

### Changes to `src/components/PhotoWall.tsx`:
- Remove the old `generateHeartPositions` and `generateHeartGrid` functions
- Define a static `HEART_GRID` array marking which cells in a 9x7 grid are filled
- Use CSS Grid (`grid-template-columns: repeat(9, 1fr)`) for layout
- Empty cells render as invisible placeholders; filled cells show photos
- Each photo cell is a square with rounded corners, matching the reference
- Photos repeat cyclically if fewer than grid slots
- Responsive sizing: cells scale from ~40px on mobile to ~80px on desktop

---

## 2. Mobile Responsive Adaptations

### `src/components/HeroSection.tsx`:
- Reduce title font size for small screens (e.g., `text-4xl` on mobile)
- Reduce day counter font size on mobile
- Tighten spacing/padding for compact mobile layouts

### `src/components/Header.tsx`:
- Already responsive, minor padding adjustments

### `src/components/PhotoWall.tsx`:
- Grid cells scale responsively using `w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20`
- Grid gap reduces on mobile
- Section padding adjusts for smaller screens

### `src/components/MusicButton.tsx`:
- Music player panel width adjusts for mobile (`w-72` on small screens)
- Ensure panel doesn't overflow viewport edges

### `src/components/FloatingHearts.tsx`:
- No changes needed (already viewport-relative)

### `src/components/OrbitingSwatches.tsx`:
- Reduce orbit radius on mobile to prevent overflow

### `src/pages/Index.tsx`:
- No structural changes needed (already uses responsive classes)

---

## Technical Details

### Heart Grid Data Structure
```typescript
const HEART_GRID = [
  [0,1,1,0,0,1,1,0,0],
  [1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,0,0,0],
  [0,0,0,0,1,0,0,0,0],
];
```

### Responsive Grid CSS
- `grid-template-columns: repeat(9, 1fr)` with `gap` scaling by breakpoint
- Each cell uses aspect-ratio 1:1 for perfect squares
- Background uses theme color (`bg-card`) instead of black for consistency

### Files to modify:
1. **`src/components/PhotoWall.tsx`** - Complete rewrite of grid layout
2. **`src/components/HeroSection.tsx`** - Mobile font/spacing tweaks
3. **`src/components/MusicButton.tsx`** - Mobile panel width
4. **`src/components/OrbitingSwatches.tsx`** - Smaller orbit on mobile
