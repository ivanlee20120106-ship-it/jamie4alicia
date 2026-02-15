

# Fix: Geocoded Coordinates Being Overwritten (Showing 0,0)

## Root Cause

There are two issues in `src/components/AddMarkerDialog.tsx`:

1. **Render-time state mutation (lines 50-54)**: The code calls `setLat`/`setLng` directly during the render phase (not inside a `useEffect`). This is a React anti-pattern that can silently override the geocoded values when the component re-renders.

2. **Fallback to 0 on submit (line 107-108)**: `parseFloat(lat) || 0` silently converts empty or invalid inputs to `0` instead of warning the user.

## Fix

### File: `src/components/AddMarkerDialog.tsx`

1. **Replace the render-time sync block (lines 50-54) with a proper `useEffect`** that only runs when `clickedLatLng` actually changes, and does NOT override user-entered or geocoded values:

```typescript
// Remove lines 50-54 and add useEffect import
import { useState, useEffect } from "react";

useEffect(() => {
  if (clickedLatLng) {
    setLat(clickedLatLng[0].toFixed(4));
    setLng(clickedLatLng[1].toFixed(4));
  }
}, [clickedLatLng]);
```

2. **Add validation before submit** -- if lat/lng are still empty after geocoding, warn the user instead of silently using 0:

```typescript
// In handleSubmit, before the insert
const parsedLat = parseFloat(lat);
const parsedLng = parseFloat(lng);
if (isNaN(parsedLat) || isNaN(parsedLng)) {
  toast.error("Please search for coordinates or enter them manually");
  setSubmitting(false);
  return;
}
```

3. **Reset lat/lng on dialog close** to avoid stale state when reopening:

```typescript
// In the reset section after successful submit (line 121)
setName(""); setDescription(""); setVisitDate(undefined); 
setImageFile(null); setLat(""); setLng("");
```

## Summary of Changes

| What | Why |
|---|---|
| Move sync logic into `useEffect` | Prevents geocoded values from being overwritten on re-render |
| Add coordinate validation on submit | Prevents silent 0,0 fallback; prompts user to geocode first |
| Reset lat/lng on close | Prevents stale coordinates from previous entries |

## File Modified
- `src/components/AddMarkerDialog.tsx` -- fix render-time state mutation, add validation, reset state

