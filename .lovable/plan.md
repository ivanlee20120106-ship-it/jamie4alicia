

# Photo Wall Updates

## Changes to `src/components/PhotoWall.tsx`

### 1. Remove black background container
Remove the `bg-black rounded-2xl` wrapper div, keeping the grid layout and heart shape intact.

### 2. Show empty placeholder grid (no photos state)
Currently when there are no photos, it shows a pulsing heart icon. Instead, always show the heart-shaped grid with gray placeholder cells (`bg-gray-300 rounded-xl`), regardless of whether photos exist. When photos are uploaded later, they fill in the cells.

### 3. Clear all existing photos from storage
Use the Supabase storage API to delete all files in the `photos` bucket. This will be done by listing all files and removing them via a one-time action, or I can provide a SQL migration / manual step.

## Technical Details

**File: `src/components/PhotoWall.tsx`**
- Remove the `<div className="bg-black rounded-2xl p-4 sm:p-6 md:p-10">` wrapper
- Merge the two render paths (photos vs no-photos) into one: always render the heart grid
- If a photo exists for a cell, show it; otherwise show the gray placeholder
- Keep all existing: grid dimensions, gap, rounded corners, hover effects, upload button, lightbox

**Clearing photos:**
- Add a temporary `useEffect` or button that calls `supabase.storage.from("photos").list()` then `.remove()` on all files
- Or I can simply list and delete via the existing `handleDelete` pattern

