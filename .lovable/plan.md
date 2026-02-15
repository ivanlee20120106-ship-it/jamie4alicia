

# Full Data Storage Optimization: Database Tables, Photo Management, and Memory Optimization

## Overview

Rebuild the data layer with 3 new database tables (`photos`, `photo_walls`, `photo_wall_items`), update `travel_markers` to reference the `photos` table, and implement frontend memory management. All image processing stays client-side (HEIC conversion, compression). Existing data will be cleared for a clean start.

---

## Phase 1: Database Schema (PostgreSQL)

### 1.1 Create `photos` table

```sql
CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_filename text,
  file_size bigint NOT NULL,
  mime_type text NOT NULL DEFAULT 'image/jpeg',
  width int,
  height int,
  latitude double precision,
  longitude double precision,
  location_name text,
  address text,
  storage_path text NOT NULL,
  thumbnail_path text,
  compressed_path text,
  is_heif boolean DEFAULT false,
  converted_formats jsonb DEFAULT '[]'::jsonb,
  exif_data jsonb,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_photos_location ON public.photos (latitude, longitude);
CREATE INDEX idx_photos_created ON public.photos (created_at DESC);
CREATE INDEX idx_photos_user ON public.photos (user_id);
```

RLS: public read, authenticated insert/update/delete own rows.

### 1.2 Create `photo_walls` table

```sql
CREATE TABLE public.photo_walls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_photo_id uuid REFERENCES public.photos(id) ON DELETE SET NULL,
  created_by uuid NOT NULL,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

RLS: public read for is_public=true, authenticated CRUD own walls.

### 1.3 Create `photo_wall_items` table

```sql
CREATE TABLE public.photo_wall_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wall_id uuid NOT NULL REFERENCES public.photo_walls(id) ON DELETE CASCADE,
  photo_id uuid NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  sort_order int DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(wall_id, photo_id)
);
```

RLS: same visibility as parent wall.

### 1.4 Add `photo_id` column to `travel_markers`

```sql
ALTER TABLE public.travel_markers
  ADD COLUMN photo_id uuid REFERENCES public.photos(id) ON DELETE SET NULL;
```

This links markers to the photos table while keeping backward compatibility with `image_url`.

### 1.5 Auto-update `updated_at` trigger

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

## Phase 2: Storage Structure

Keep existing buckets (`photos`, `marker-images`) but organize uploads with subfolder structure:

```text
photos/
  {user_id}/
    {uuid}.jpg          -- compressed original (max 1200px)
    {uuid}_thumb.jpg    -- thumbnail (150px, for grid)
    {uuid}_mid.jpg      -- medium (480px, for popups)
```

Client generates all 3 sizes before uploading.

---

## Phase 3: Frontend Changes

### 3.1 Photo Upload Flow (PhotoWall.tsx)

Update upload to:
1. Convert HEIC if needed (existing logic)
2. Generate 3 sizes client-side: original compressed (1200px), medium (480px), thumbnail (150px)
3. Upload all 3 to `photos` storage bucket under `{user_id}/{uuid}_*.jpg`
4. Insert a row into `photos` table with all paths and metadata
5. Insert a row into `photo_wall_items` linking to a default wall

### 3.2 Photo Fetch Flow (PhotoWall.tsx)

Replace `supabase.storage.from("photos").list()` with:

```typescript
const { data } = await supabase
  .from("photos")
  .select("*, photo_wall_items!inner(wall_id)")
  .eq("photo_wall_items.wall_id", defaultWallId)
  .order("created_at", { ascending: false })
  .limit(36);
```

Use `thumbnail_path` for grid, `storage_path` for lightbox.

### 3.3 Map Marker Popups (MapMarker.tsx / MapPopup.tsx)

- Use `compressed_path` (480px) for popup images instead of full-size `image_url`
- Lazy-load popup images: only render `<img>` when popup is opened (track `isOpen` state via popupopen/popupclose events)
- Reset `imgLoaded` state on popup close

### 3.4 AddMarkerDialog.tsx

- After uploading marker image, also insert into `photos` table
- Set `photo_id` on `travel_markers` insert
- Generate medium (480px) version for popup display

### 3.5 PhotoLightbox.tsx

- Use `storage_path` (1200px compressed original) for full viewing
- Add preloading: when viewing photo N, preload photo N+1 and N-1

### 3.6 Frontend Memory Manager (new file: `src/hooks/usePhotoMemoryManager.ts`)

React hook implementing LRU cache for loaded photos:

```typescript
// Tracks loaded image blob URLs
// Max 60MB memory budget
// Evicts least-recently-used entries when over 80% threshold
// Provides loadPhoto(id, quality) -> URL
// Auto-revokes object URLs on eviction
```

### 3.7 Photo Delete Flow

- Delete from `photos` table (CASCADE removes `photo_wall_items`)
- Remove all 3 size variants from storage bucket
- If linked to a marker via `photo_id`, the marker's `photo_id` becomes NULL (ON DELETE SET NULL)

---

## Phase 4: Photo Wall Grouping

### 4.1 Default Wall

On first upload, auto-create a default `photo_walls` entry named "Our Memories" for the user. All uploads go to this wall by default.

### 4.2 Wall Management (future-ready)

The schema supports multiple walls, but the UI will initially show only the default wall. The `photo_walls` and `photo_wall_items` tables are ready for future wall switching/creation features.

---

## Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| Migration SQL | Create | 3 new tables, alter travel_markers, trigger |
| `src/hooks/usePhotoMemoryManager.ts` | Create | LRU memory cache hook |
| `src/components/PhotoWall.tsx` | Rewrite | Use photos table instead of storage listing; multi-size upload |
| `src/components/PhotoLightbox.tsx` | Modify | Use storage_path, add preloading |
| `src/components/AddMarkerDialog.tsx` | Modify | Insert photos table, set photo_id |
| `src/components/map/MapMarker.tsx` | Modify | Lazy popup rendering, use medium image |
| `src/components/map/MapPopup.tsx` | Modify | Reset imgLoaded state |
| `src/components/map/MapContent.tsx` | Modify | Pass medium image URL to markers |
| `src/components/TravelMap.tsx` | Modify | Fetch photo_id/compressed_path with markers |

---

## Technical Details

### Client-side Multi-size Generation

```typescript
// Generate 3 sizes from a single source image
async function generateSizes(file: File) {
  const converted = await convertHeicIfNeeded(file);
  const [original, medium, thumbnail] = await Promise.all([
    compressImage(converted, 1200),  // ~100-300KB
    compressImage(converted, 480),   // ~30-80KB
    compressImage(converted, 150),   // ~5-15KB
  ]);
  return { original, medium, thumbnail };
}
```

### RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| photos | Anyone | auth.uid() = user_id | auth.uid() = user_id | auth.uid() = user_id |
| photo_walls | is_public = true | auth.uid() = created_by | auth.uid() = created_by | auth.uid() = created_by |
| photo_wall_items | via wall visibility | authenticated | authenticated | authenticated |

### Data Flow

```text
Upload: File -> HEIC convert -> 3 sizes -> Upload to storage -> Insert photos row -> Insert wall_item row
Display Grid: Query photos table -> Use thumbnail_path URLs
Lightbox: Use storage_path URL (1200px)
Map Popup: Use compressed_path URL (480px), lazy load on open
Delete: Remove photos row (cascades wall_items) -> Remove 3 files from storage
```

