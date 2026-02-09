

# Fix Photo Wall - Heart Shape with Two Humps

## Problem
The current grid has row 1 as `[0,0,0,1,1,0,0,0,0]` (2 blocks centered), which looks like a diamond, not a heart. The reference site uses a classic heart shape with **two humps** at the top (4 blocks at columns 3,4,6,7).

## Changes to `src/components/PhotoWall.tsx`

### 1. Fix HEART_GRID to match the reference heart shape
```typescript
const HEART_GRID = [
  [0,0,1,1,0,1,1,0,0], // Row 1: 4 blocks (two humps)
  [0,1,1,1,1,1,1,1,0], // Row 2: 7 blocks
  [1,1,1,1,1,1,1,1,1], // Row 3: 9 blocks
  [0,1,1,1,1,1,1,1,0], // Row 4: 7 blocks
  [0,0,1,1,1,1,1,0,0], // Row 5: 5 blocks
  [0,0,0,1,1,1,0,0,0], // Row 6: 3 blocks
  [0,0,0,0,1,0,0,0,0], // Row 7: 1 block
];
```

### 2. Update grid styling to match reference CSS
- Cell size: fixed `70px` on desktop, responsive on mobile (`w-[40px] h-[40px] sm:w-[55px] sm:h-[55px] md:w-[70px] md:h-[70px]`)
- Gap: `10px` (responsive: `gap-1.5 sm:gap-2 md:gap-2.5`)
- Border radius: `rounded-xl` (12px)
- Background: black (`bg-black`) behind the grid with `padding: 40px`
- Empty cells remain invisible (no background)
- Photo cells: gray placeholder (`bg-gray-300`) when no photo, otherwise show image

### 3. Add black container behind the heart grid
Wrap the grid in a container with black background and padding, matching the reference.

### Files to modify
- `src/components/PhotoWall.tsx` -- grid data + styling updates

