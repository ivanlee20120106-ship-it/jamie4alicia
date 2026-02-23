

# Remove "Admin" Link and Redesign Footer

## What Changes
- Remove the visible "Admin" link from the footer
- Keep the admin login accessible via direct URL `/admin/login` only (security through obscurity for a personal site)
- Clean up the footer layout so it's a single, elegant centered line without the extra link below

## Technical Details

### File: `src/components/Footer.tsx`
- Delete the `<Link to="/admin/login">Admin</Link>` element and its surrounding markup
- The footer will simply show: `© 2026 Jamie & Alicia. Good Night! Love You! Every Single Day! All rights reserved.`
- Keep the existing safe-area-inset-bottom padding and backdrop styling unchanged

