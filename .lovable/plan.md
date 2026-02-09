
# Improve Sign In / Sign Out Button Design

The current Sign In and Sign Out buttons use generic `LogIn`/`LogOut` icons that feel out of place on this romantic couple's website. The redesign will make the auth buttons blend seamlessly with the love theme while remaining elegant and unobtrusive.

## Design Changes

**Sign In button (logged out state):**
- Replace the `LogIn` icon with a `Heart` icon to match the romantic theme
- Use a subtle gradient border effect matching the gold/love palette
- Add a gentle glow on hover for a warm, inviting feel
- Make the button more compact and icon-focused -- show only the heart icon by default, with text appearing on hover (desktop) or staying as an icon-only button (mobile)

**Sign Out button (logged in state):**
- Replace the `LogOut` icon with a smaller, understated icon-only button using the `X` or `LogOut` icon in muted tones so it doesn't distract from the content
- Keep it minimal since sign-out is a secondary action

**Dialog improvements:**
- Add a heart icon to the dialog header for visual consistency
- Add a subtle love-themed gradient to the submit button

## Technical Details

Only one file needs to be modified: `src/components/AuthDialog.tsx`

- Replace `LogIn` import with `Heart` from lucide-react
- Update the Sign In button to use `Heart` icon with gold/love gradient styling and a hover glow effect
- Refine the Sign Out button to be more subtle and minimal
- Add a small `Heart` icon in the dialog header next to the title
- Apply `text-gradient-love` or `glow-gold` utility classes to tie in with the existing design system
