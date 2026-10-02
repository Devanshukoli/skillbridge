# Boot UI synthesis

Base: brand splash (`SessionBootScreen`), not boot-b layout preview.

Why. [How boot skeleton](7e742a82-7e0e-4d90-88bd-10963a4dfb06) showed guests land on `LandingView` after `/api/auth/me`. A portal skeleton is a lie for that majority path. The old dark dashboard was the same lie plus a theme clash.

Graft from boot-b:
- Zero extra `App.tsx` booleans. Instant unmount when `loadingSession` flips.
- `role="status"` `aria-busy` `aria-live`.
- CSS motion only. `prefers-reduced-motion` also kills `.animate-fade-in`.
- Do not mount `Navbar` with a stub user.

Rejected from boot-b: light sidebar-plus-main bones as the boot screen. Geometry match for signed-in users does not earn a guest flash of portal chrome.

Boot-a package was not on disk when this was written. Splash was specified in the parent brief and matches the user request (cleaner, not a fake layout).
