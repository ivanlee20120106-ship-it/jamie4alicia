

# Fix: Auto-fill Latitude/Longitude from City Name

## Problem
When adding a place via the "Add a Place" dialog, users must manually fill in latitude and longitude even after typing a city name. The geocoding search button exists but the experience is unreliable -- users expect coordinates to auto-fill when they enter a city name.

## Solution
Improve the AddMarkerDialog so that geocoding is more automatic and robust:

### Changes to `src/components/AddMarkerDialog.tsx`

1. **Auto-geocode on blur** -- When the user finishes typing a city name and leaves the input field (blur event), automatically trigger geocoding if the lat/lng fields are still empty. This means users don't need to know about the search button.

2. **Auto-geocode on search button click** -- Keep the existing search button behavior but add better error feedback and ensure coordinates are reliably written to state.

3. **Visual feedback** -- Show a brief loading state on the lat/lng fields while geocoding is in progress (e.g., placeholder changes to "Looking up...").

4. **Prevent submission without coordinates** -- Add validation that prevents form submission if lat/lng are empty, with a toast message like "Please enter a place name and search for coordinates, or fill them in manually."

5. **Debounced auto-search** -- Optionally trigger geocoding automatically after the user stops typing for 1.5 seconds (respecting Nominatim's rate limit), so coordinates appear without any extra action.

### Technical Details

- The `geocodeName` function already exists and works correctly. The fix focuses on triggering it at the right moments.
- The Nominatim API throttle (1.1s interval) is already implemented in `src/lib/geocoding.ts` and will be respected.
- Add an `onBlur` handler to the name input that calls `geocodeName()` when lat/lng are empty.
- Add a subtle loading indicator on the coordinate fields during geocoding.
- The search button remains as a manual fallback.

### Files Modified
- `src/components/AddMarkerDialog.tsx` -- Add auto-geocode on blur, loading states, and better validation.

