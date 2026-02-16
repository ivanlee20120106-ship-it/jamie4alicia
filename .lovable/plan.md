

# Fix: Mobile iOS/Android Map Viewport and Display Issues

## Problem Analysis

The map has several known issues on mobile browsers (iOS Safari, Android Chrome):

1. **`vh` units are unreliable on mobile** -- iOS Safari's address bar causes `55vh` to include space behind the browser chrome, so the map container height changes as the user scrolls and the address bar hides/shows. This leads to grey tiles, partial rendering, and layout jumps.

2. **Leaflet doesn't auto-resize** -- When the mobile browser viewport changes dynamically (address bar hide/show, orientation change), Leaflet's internal size cache becomes stale. Tiles don't fill the container properly until `map.invalidateSize()` is called.

3. **Map buttons overlap mobile browser UI** -- The floating action buttons at `bottom-4 right-4` can clash with iOS Safari's bottom toolbar and Android's navigation gestures, making them hard to tap.

4. **Touch interactions** -- No `touch-action` CSS is set on the map container, which can cause unintended page scrolling while trying to pan the map.

5. **Missing viewport meta for iOS** -- The `index.html` lacks `viewport-fit=cover` and safe-area inset support, which affects layout on notched devices.

---

## Changes

### 1. index.html -- Add mobile viewport support

- Add `viewport-fit=cover` to the existing viewport meta tag
- This enables safe-area-inset CSS variables for notched devices (iPhone X+)

### 2. src/index.css -- Mobile map fixes

Add CSS rules for:
- `touch-action: none` on `.leaflet-container` to prevent page scroll conflicts
- Safe-area padding utilities using `env(safe-area-inset-bottom)` for map buttons
- Use `dvh` (dynamic viewport height) with `vh` fallback for map container height
- Fix Leaflet popup/control z-index stacking on mobile

### 3. src/components/TravelMap.tsx -- Dynamic height + resize handling

- Replace fixed `h-[55vh]` class with a responsive approach:
  - Use `h-[55dvh]` (dynamic viewport height) with `h-[55vh]` as fallback for older browsers
  - Keep `min-h-[350px]` and responsive breakpoints `sm:h-[500px] lg:h-[650px]`
- Add a `useEffect` inside `MapContent` that calls `map.invalidateSize()` on window `resize` and `orientationchange` events, so tiles re-render properly when the mobile browser chrome hides/shows

### 4. src/components/map/MapContent.tsx -- Resize observer

- Add a `useEffect` hook that listens to `resize` and `orientationchange` events
- On each event, call `map.invalidateSize({ animate: false })` after a small debounce (150ms)
- This ensures tiles fill the container correctly after address bar transitions

### 5. src/components/map/MapButtons.tsx -- Safe-area bottom padding

- Change `bottom-4` to `bottom-[calc(1rem+env(safe-area-inset-bottom))]` so buttons sit above iOS Safari's bottom toolbar and Android gesture bars
- Reduce button size slightly on very small screens using responsive classes (`w-10 h-10 sm:w-12 sm:h-12`)
- Reduce search input width on small screens (`w-[9rem] sm:w-[12rem]`)

---

## Technical Details

### Dynamic Viewport Height

```css
/* Fallback for browsers without dvh support */
.map-container-height {
  height: 55vh;
  height: 55dvh;
}
```

Modern iOS Safari (15.4+) and Android Chrome (108+) support `dvh`. Older browsers gracefully fall back to `vh`.

### InvalidateSize on Resize

```typescript
// Inside MapContent
const map = useMap();
useEffect(() => {
  let timeout: ReturnType<typeof setTimeout>;
  const handler = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => map.invalidateSize({ animate: false }), 150);
  };
  window.addEventListener("resize", handler);
  window.addEventListener("orientationchange", handler);
  return () => {
    clearTimeout(timeout);
    window.removeEventListener("resize", handler);
    window.removeEventListener("orientationchange", handler);
  };
}, [map]);
```

### Safe Area for Buttons

```css
/* Ensures buttons don't overlap iOS/Android system UI */
.map-buttons {
  bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
}
```

### Files to Modify

| File | Change |
|---|---|
| `index.html` | Add `viewport-fit=cover` to viewport meta |
| `src/index.css` | Add `touch-action`, `dvh` height class, safe-area utilities |
| `src/components/TravelMap.tsx` | Use new responsive height class |
| `src/components/map/MapContent.tsx` | Add resize/orientationchange invalidateSize listener |
| `src/components/map/MapButtons.tsx` | Safe-area bottom offset, responsive button/input sizes |

