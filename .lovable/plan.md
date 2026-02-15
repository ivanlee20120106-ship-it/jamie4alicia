

# Auto-Fill Coordinates from City Name via Geocoding

## Overview

When a user types an English city name in the "Place name" field of the Add Place dialog, the system will automatically look up and fill in the latitude and longitude using the OpenStreetMap Nominatim geocoding API (already used elsewhere in the project).

## Approach

Add a geocoding lookup triggered by a small "Locate" button next to the name input. When clicked (or when the user presses Enter in the name field), it queries Nominatim, and if a result is found, auto-fills the lat/lng fields.

A debounce-based auto-suggest was considered but rejected to avoid excessive API calls and UI complexity. A manual trigger button is cleaner and aligns with Nominatim's usage policy.

## Changes

### File: `src/components/AddMarkerDialog.tsx`

1. Add a `geocoding` loading state (`boolean`)
2. Add a `geocodeName` async function that:
   - Calls `https://nominatim.openstreetmap.org/search?q={name}&format=json&limit=1&accept-language=en`
   - If result found, sets `lat` and `lng` state from the response
   - Shows a toast on success ("Coordinates found!") or failure ("Location not found")
3. Wrap the name input in a flex row with a small icon button (MapPin or Search icon) on the right side
4. Trigger geocoding on button click, or when user presses Enter in the name field (without submitting the form)

### UI Layout Change

```
Before:  [  Place name *                          ]

After:   [  Place name *                    ] [pin]
```

The pin button shows a spinner while geocoding is in progress.

## Technical Detail

```typescript
// New state
const [geocoding, setGeocoding] = useState(false);

// Geocode function
const geocodeName = async () => {
  if (!name.trim()) return;
  setGeocoding(true);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name.trim())}&format=json&limit=1&accept-language=en`
    );
    const data = await res.json();
    if (data.length > 0) {
      setLat(parseFloat(data[0].lat).toFixed(4));
      setLng(parseFloat(data[0].lon).toFixed(4));
      toast.success("Coordinates found!");
    } else {
      toast.error("Location not found");
    }
  } catch {
    toast.error("Geocoding failed");
  } finally {
    setGeocoding(false);
  }
};
```

Name input row:
```tsx
<div className="flex gap-2">
  <input
    type="text"
    placeholder="Place name *"
    value={name}
    onChange={(e) => setName(e.target.value)}
    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); geocodeName(); } }}
    required
    className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
  />
  <button
    type="button"
    onClick={geocodeName}
    disabled={geocoding || !name.trim()}
    className="px-3 py-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors disabled:opacity-50"
  >
    {geocoding ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
  </button>
</div>
```

## Files Modified
- `src/components/AddMarkerDialog.tsx` -- add geocoding state, function, and updated name input row

