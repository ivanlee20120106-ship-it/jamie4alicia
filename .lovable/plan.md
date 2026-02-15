

# Optimize Add Marker Dialog: Remove Required Coordinates + Date Picker UI

## Changes

### 1. Remove mandatory lat/lng validation
- Remove `!lat || !lng` from the validation check on line 49 -- only `name` remains required
- Remove `required` attribute from both lat/lng inputs (lines 155, 164)
- Change placeholder text from "Latitude *" / "Longitude *" to "Latitude" / "Longitude"
- Update error message to "Please enter a place name"
- Keep lat/lng inputs visible (users can still enter manually or tap map), but submission allowed without them
- In the insert logic, use `parseFloat(lat) || 0` as fallback when coordinates are empty

### 2. Replace native date input with Popover + Calendar date picker
- Replace `<input type="date">` (line 178-183) with a Popover-based date picker using the existing `Calendar` and `Popover` components
- Change `visitDate` state from `string` to `Date | undefined`
- Display selected date formatted as `DD/MM/YYYY` using `date-fns` `format(date, "dd/MM/yyyy")`
- Style the trigger button to match the existing form field aesthetic (bg-background, border-border, rounded-lg)
- Add `pointer-events-auto` to Calendar wrapper per project conventions
- In the insert logic, format the Date to `yyyy-MM-dd` string for database storage

## Files Modified
- `src/components/AddMarkerDialog.tsx` -- both changes in this single file

## Technical Details

New imports needed:
```typescript
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
```

Date picker UI:
```typescript
<Popover>
  <PopoverTrigger asChild>
    <button type="button" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-left ...">
      <CalendarIcon size={16} />
      {visitDate ? format(visitDate, "dd/MM/yyyy") : "Select a date"}
    </button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar mode="single" selected={visitDate} onSelect={setVisitDate} className="pointer-events-auto" />
  </PopoverContent>
</Popover>
```

Database insert change for visit_date:
```typescript
visit_date: visitDate ? format(visitDate, "yyyy-MM-dd") : null
```
