# Boot layout preview rationale

## Problem

Session boot today is a dark fake dashboard. `App.tsx` returns `AppShellSkeleton` while `loadingSession` is true. That component uses `bg-slate-950`, `rounded-3xl` glass cards, a four-up metric grid, and `animate-pulse` on thick blocks. The real authenticated tree is `min-h-screen bg-slate-50` with a fixed `w-64` sidebar and a padded main column. Guests never see that tree. After `/api/auth/me` they get `AuthView`, which renders `LandingView`. The boot screen therefore has to choose a lie. Either it previews the portal chrome returning users will occupy, or it previews the marketing page guests will occupy. It cannot preview both without knowing the user. The caller cannot pass a user. The fetch is the thing we are waiting on. Legal paths already skip this screen. Fonts stay Inter and JetBrains Mono. No purple gradients. The brief wants a cleaner, minimal, light boot with smooth motion and `prefers-reduced-motion`. The public API should stay the one existing import.

## Usage (caller's view)

App keeps the same early return. Implementers do not add props, providers, or a second boot component.

```tsx
import { AppShellSkeleton } from './components/Skeleton';

if (isPrivacyPath || isTermsPath) {
  return <LegalView /* ... */ />;
}

if (loadingSession) {
  return <AppShellSkeleton />;
}

if (!user) {
  return <AuthView onAuthSuccess={/* ... */} />;
}

return (
  <div className="app-shell min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
    <Navbar /* user required */ />
    <main className={`flex-1 p-6 lg:p-10 pb-24 lg:pb-10 overflow-y-auto max-w-7xl mx-auto w-full ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
      {/* real views */}
    </main>
  </div>
);
```

In-view loaders keep importing `DashboardSkeleton` and friends from the same file. Those symbols are out of scope. They still use `SkeletonBlock`.

```tsx
import { DashboardSkeleton } from './components/Skeleton';

if (loading) return <DashboardSkeleton />;
```

CSS is not imported by App. `index.css` already loads globally. Shimmer and reduced-motion rules live there so the component tree does not grow.

## Shape

The domain value is a session that is not resolved yet. That is one state, not a guest/user fork. Encode it as a zero-argument component. A `variant` or `audience` prop would be a fake discriminant. The caller has no evidence for it. `per type-system-discipline` and `per model-the-domain`.

Data first. A small table of `BoneSpec` widths drives the main column. Nav count is 5, which matches both student and admin Navbar lists. Chrome constants copy `w-64`, `lg:ml-64`, `bg-slate-50`, white sidebar, and the mobile header. The preview always uses the expanded sidebar because App's default is `isSidebarCollapsed === false`. `per foundational-thinking`.

Flow. `AppShellSkeleton` paints shell chrome plus bones. `ShimmerBone` is file-private. `Navbar` is not mounted. It needs `User`. Duplicating a handful of Tailwind classes is cheaper than extracting a shared shell in this change. `per laziness-protocol`. If `ShellSidebarPreview` is a one-caller wrapper with no extra rule, inline it. `per minimize-reader-load`.

What the export hides. Layout copy of App and Navbar, bone table, shimmer CSS class, `role="status"`, reduced-motion via stylesheet. What stays on the caller. The boolean `loadingSession` and the existing early return. The interface is one function because a richer boot API would only expose choices the caller cannot make yet. `per experience-first` for returning users, whose sidebar does not jump. `per encode-lessons-in-structure` for motion. Put reduced motion in CSS, not a React `matchMedia` hook App would have to thread.

What it does not do. It does not wait to pick Landing vs shell. It does not crossfade with JS after `setLoadingSession(false)`. It does not restyle `SkeletonBlock` for curriculum loaders. Subtract the dark cards and pulse from `AppShellSkeleton` only. `per subtract-before-you-add`.

Handoff. Geometry match is the transition for authenticated users. Real views already use `animate-fade-in`. Guests still get a one-frame swap from shell preview to landing. See tradeoffs.

Screened against architect red flags. One deep export, not a boot pipeline of enter/hold/exit modules. No pass-through `SessionBoot` that returns this component. No public wire type for "boot phase".

## Synthesis decision


## Tradeoffs accepted

- We accept a short portal-shaped lie for guests in exchange for a jump-free handoff for signed-in users, and in exchange for leaving `App.tsx` on a one-line return. Guest boot is `/api/auth/me` then `LandingView`. A marketing skeleton would lie to the people who already have a cookie.
- We accept duplicated Tailwind chrome classes in `Skeleton.tsx` in exchange for not extracting `AppShell` or mounting `Navbar` without a user.
- We accept a hard unmount when `loadingSession` flips in exchange for no exit animation state, no `setTimeout`, and no change to the session contract.
- We accept leaving `SkeletonBlock`'s pulse on in-view skeletons in exchange for a smaller diff and a single boot target.
- We accept light `bg-slate-50` even if the OS is in dark mode, because appearance is a user profile field applied only after session. Booting in dark would mismatch both landing and the default light shell.

## Alternatives considered

- Centered brand splash. Full-viewport `bg-slate-50`, SkillBridge mark, maybe a thin spinner, no sidebar. Smaller implementation and honest for guests. It lost because it is a different page than the authenticated shell, so returning users still get a layout pop. It also fights the mandatory shape for this candidate. Callers would still import one component, so the public API is the same size, but the capability behind it is weaker. It hides paint cost and exposes a mismatch to the next frame.
- Dual boot API, `AppShellSkeleton` vs `LandingSkeleton`, chosen in App after a heuristic such as "has any `skillbridge:` localStorage key". That exposes audience policy to the caller and still mis-predicts first visits, cleared storage, and admin vs student. Larger public API, more branches, same unknown until `/api/auth/me`.
- Mount a disabled `Navbar` with a stub `User`. That would reuse real chrome and leak a fake user into a component that runs logout and section navigation. Illegal state made representable.
- Keep the skeleton mounted and opacity-crossfade with the next tree. Needs `loadingSession` to become a three-state machine or a layout wrapper. Bigger App change than the brief's smallest public API.

## Open questions and risks

- If most `/api/auth/me` results are anonymous, is a portal preview the wrong default for the product even if returning users get a smoother shell?
- Navbar and App class names will drift. Who notices when `w-64` becomes `w-72` and the preview is wrong?
- Should `.animate-fade-in` respect `prefers-reduced-motion` in this same CSS edit, given that views outside boot also use it?
- Legal routes skip boot. If a signed-in user hits `/privacy` then Home, do they still flash this preview on the next full load of `/`?

## Next implementation step

Rewrite `AppShellSkeleton` in `frontend/src/components/Skeleton.tsx` to the light sidebar-plus-main bone layout, and add `.boot-shimmer` plus the reduced-motion override in `frontend/src/index.css`, leaving the `App.tsx` call site unchanged.
