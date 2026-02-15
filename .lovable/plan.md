

# Match "Our Journey Map" Title to "Jamie & Alicia" Style

## What Changes

Update the "Our Journey Map" heading in `src/components/TravelMap.tsx` (line 74) to use the same gradient and glow classes as the "Jamie & Alicia" title in the hero section.

## Current vs New

| Property | Current ("Our Journey Map") | Target ("Jamie & Alicia" style) |
|---|---|---|
| Gradient | `text-gradient-gold` (gold to cream) | `text-gradient-love` (cornflower blue to gold) |
| Glow | `glow-gold` (gold text-shadow) | `glow-gold` (same, keep) |
| Font | `font-script italic` | `font-script italic` (same) |
| Size | `text-2xl sm:text-3xl` | `text-3xl sm:text-4xl md:text-5xl` (slightly larger to feel more prominent) |

## Technical Detail

Single line change in `src/components/TravelMap.tsx` line 74:

```
// Before
text-2xl sm:text-3xl font-script italic text-center text-gradient-gold glow-gold

// After
text-3xl sm:text-4xl md:text-5xl font-script italic text-center text-gradient-love glow-gold
```

## File Modified
- `src/components/TravelMap.tsx` -- one class change on the h2 element
