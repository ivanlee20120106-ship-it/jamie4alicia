

# Fix Map Popup Photo Frame to 1:1 Square

## Problem

The photo in the map marker popup uses a rectangular frame (`w-full h-28`), which distorts or crops photos unevenly depending on whether they are landscape or portrait orientation.

## Solution

Change the image container in `MapPopup.tsx` to use a 1:1 square aspect ratio, so both landscape and portrait photos are uniformly displayed within a square frame using `object-cover` (already applied).

## Changes

### File: `src/components/map/MapPopup.tsx`

Replace the image container (currently `w-full h-28`) with a square container using `aspect-square`:

```
Before:  <div className="relative w-full h-28 mb-2 rounded overflow-hidden ...">
After:   <div className="relative w-full aspect-square mb-2 rounded overflow-hidden ...">
```

This single change ensures:
- The frame is always a perfect square, matching the popup width
- `object-cover` (already on the `<img>`) crops and centers both landscape and portrait photos to fill the square without distortion
- The loading spinner remains centered in the square frame

No other files need changes.

