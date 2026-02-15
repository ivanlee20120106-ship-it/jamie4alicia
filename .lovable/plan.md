

# Pixel-Perfect Replication of Destinero Interactive Map Features

## Overview

Rebuild the TravelMap module to closely replicate Destinero's interactive leaflet map experience, including its marker styles, popup design, map control buttons (search, locate, reset view), click-to-place marker, flyTo animations, and reverse geocoding in popups -- all adapted to fit the existing dark romantic theme.

## Key Destinero Features to Replicate

1. **Marker Icons**: Raw SVG icons (flag for visited, plane for planned) rendered as DivIcon, with hover scale effect, no circular wrapper
2. **Popup Design**: Centered layout with place name, image (with loading spinner), coordinates in monospace font, and a copy-coords button
3. **Map Control Buttons**: Bottom-right floating button stack -- Search (with expandable input), Live Location, Reset View
4. **Click-to-Place**: Clicking the map drops a "clicked location" marker with reverse geocoding via OSM Nominatim
5. **FlyTo Animations**: Smooth animated flyTo when opening a popup or navigating
6. **Auto-Open Popup**: Random marker popup opens on load
7. **Full-viewport map** (adapted to our section-based layout)

## What Changes vs Current Implementation

| Aspect | Current | After |
|--------|---------|-------|
| Marker style | Circular badge with border/glow | Raw SVG icon, 1.8rem, hover scale 1.2x |
| Visited icon color | Gold (hsl 34) | Dark blue (#003380) adapted to gold for our theme |
| Planned icon color | Blue (hsl 219) | Pink (#ff249c) adapted to our theme |
| Popup | Tailwind-styled card with image, type badge, description | Centered popup with name, image+spinner, coords+copy button, reverse geocoding for clicked locations |
| Map buttons | Only filter bar above map + "Add Place" | Bottom-right floating stack: Search, Locate, Reset View |
| Click behavior | Opens AddMarkerDialog | Drops a temporary "clicked" marker with reverse geocoded info |
| FlyTo | None | Smooth flyTo on popup open, search, locate, reset |
| Add Place | Stays as a separate action for authenticated users | Keep existing but improve UX |

## Adapted Color Scheme

Since our project uses a dark romantic theme, we adapt Destinero's colors:
- **Visited marker**: Gold color (`hsl(34, 57%, 70%)`) -- flag icon
- **Planned marker**: Cornflower blue (`hsl(219, 79%, 66%)`) -- plane icon  
- **Clicked marker**: Peru/love color (`hsl(28, 57%, 53%)`) -- location pin
- **Searched marker**: Primary blue
- **Live location**: Red
- **Popup background**: Semi-transparent dark card (`rgba(15, 20, 35, 0.95)`) instead of Destinero's light teal
- **Map buttons**: Gold-tinted dark buttons matching the theme
- **Popup close button**: Styled to match dark theme

## Component Architecture

```text
src/components/
  TravelMap.tsx            -- Main section wrapper (keeps filter bar, title, add-place button)
  map/
    MapContent.tsx         -- Inner map content (TileLayer + markers + buttons + click listener)
    MapMarker.tsx          -- Individual marker with DivIcon + Popup + flyTo
    MapPopup.tsx           -- Popup content (name, image, coords, copy, reverse geocode)
    MapButtons.tsx         -- Bottom-right button stack (search, locate, reset)
    useMapFlyTo.ts         -- flyTo hook
    useClickedMarker.ts    -- Click listener + reverse geocode logic
```

## Detailed Implementation

### 1. MapMarker.tsx (replaces MarkerPopup.tsx inline usage)
- Uses Leaflet DivIcon with raw SVG icon HTML (no circular wrapper)
- Icon types: `PiFlagPennantFill` style for visited, `BiSolidPlaneAlt` style for planned (using Lucide equivalents: `Flag` and `Plane`)
- CSS class `custom-div-icon` with 1.8rem font-size, hover scale 1.2x
- On popup open: `map.flyTo(coords, currentZoom, { duration: 0.6 })`
- Supports `autoOpen` prop to open popup on mount

### 2. MapPopup.tsx (replaces MarkerPopup.tsx)
- Centered layout, 15rem width
- For database markers (visited/planned): Show name + image (with loading spinner) + coords + copy button
- For dynamic markers (clicked/searched/live): Reverse geocode via OSM Nominatim, show resolved address + country info
- Coordinates shown in monospace font with copy-to-clipboard button (blue button, turns green on copy)
- Delete button for authenticated users on database markers
- Dark theme adaptation: popup wrapper background `rgba(15, 20, 35, 0.95)`, light text

### 3. MapButtons.tsx
- Positioned absolute bottom-right, z-index 1000
- Three buttons stacked vertically with 0.75rem gap:
  1. **Search**: Expandable input that slides left on focus, searches via Nominatim, drops a "searched" marker
  2. **Locate**: Gets user GPS, drops a "live" marker, flyTo zoom 15
  3. **Reset View**: flyTo center [35, 105] zoom 4 (our default)
- Button style: 3rem square, rounded, gold/dark themed, with Lucide icons (Search, Navigation, Maximize)
- Loading states with spinning icon

### 4. useClickedMarker.ts
- Listen for map clicks (excluding controls, markers, popups, buttons)
- Drop a temporary "clicked" marker at click location
- Popup shows reverse-geocoded address from Nominatim

### 5. useMapFlyTo.ts
- Simple hook wrapping `map.flyTo()` with promise resolution on `moveend`

### 6. TravelMap.tsx Updates
- Keep existing filter bar, title, add-place button
- Pass all marker types to MapContent
- Combine database markers + dynamic markers (clicked, searched, live)
- Random auto-open on one static marker

### 7. CSS Changes (src/index.css)
- Add Destinero-inspired marker CSS (custom-div-icon hover, icon colors)
- Add popup CSS overrides for dark theme (wrapper bg, tip color, close button style)
- Add map-buttons CSS (positioned stack, search input expand animation)
- Add spinner keyframes

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/map/MapContent.tsx` | Create | Inner map component with all markers + buttons + click listener |
| `src/components/map/MapMarker.tsx` | Create | Individual marker with DivIcon + flyTo |
| `src/components/map/MapPopup.tsx` | Create | Popup content with geocoding + copy coords |
| `src/components/map/MapButtons.tsx` | Create | Search/locate/reset button stack |
| `src/components/map/useMapFlyTo.ts` | Create | flyTo promise hook |
| `src/components/map/useClickedMarker.ts` | Create | Click listener hook |
| `src/components/TravelMap.tsx` | Rewrite | Use new sub-components |
| `src/components/MarkerPopup.tsx` | Delete | Replaced by MapPopup |
| `src/index.css` | Modify | Add marker/popup/buttons CSS |
| `src/components/AddMarkerDialog.tsx` | Keep | Minor adjustments only |

## Key Behavioral Details

- **Search**: Input expands from right side of search button on click/focus, collapses on blur if empty
- **FlyTo duration**: 0.6s for popup open, 3s for search/locate/reset
- **Reverse geocode**: Only for clicked/searched/live markers, shows spinner while loading
- **Copy coords**: Format `lat, lng` with 5 decimal places, button flashes green with checkmark for 2s
- **Auto-open**: One random visited/planned marker popup opens automatically on page load
- **Image in popup**: Shows loading spinner until image loads, then fades in
- **Marker hover**: Scale 1.2x with 0.2s ease transition

