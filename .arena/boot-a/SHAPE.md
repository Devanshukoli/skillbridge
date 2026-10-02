# Session boot. Brand splash

Caller's usage is the spec. Types below follow it.

## Usage

`App.tsx` already owns `loadingSession`. It must not grow a second boolean for enter, hold, or leave.

Legal routes stay outside the boot. They render `LegalView` before any session UI, same as today.

Replace the early return that mounts `AppShellSkeleton` with a gate around the post-legal tree. The gate receives the existing flag and the destination tree. It owns the ritual.

```tsx
if (isPrivacyPath || isTermsPath) {
  return (
    <LegalView
      initialDocument={isPrivacyPath ? 'privacy' : 'terms'}
      onNavigateHome={() => {
        window.history.pushState({}, '', '/');
        setCurrentPath('/');
      }}
    />
  );
}

return (
  <SessionBoot loading={loadingSession}>
    {!user ? (
      <AuthView
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          navigateToSection(getStoredSection(authenticatedUser), authenticatedUser);
        }}
      />
    ) : user.role === 'student' && !user.onboardingCompleted ? (
      <OnboardingFlow
        user={user}
        onOnboardingComplete={(updatedUser) => {
          setUser(updatedUser);
          navigateToSection('dashboard', updatedUser);
        }}
      />
    ) : (
      /* existing app-shell JSX */
      <div className="app-shell min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
        {/* Navbar + views, unchanged */}
      </div>
    )}
  </SessionBoot>
);
```

Do not import `AppShellSkeleton` from `App.tsx`. Delete that export after this caller moves.

`DashboardSkeleton` and the other in-app skeletons stay. They load curriculum, not identity.

## Types

```ts
export type BootPhase = 'entering' | 'holding' | 'leaving';

export type BootState =
  | { kind: 'splash'; phase: BootPhase }
  | { kind: 'ready' };

export type BootEvent =
  | { type: 'loading'; loading: boolean }
  | { type: 'enterElapsed' }
  | { type: 'leaveElapsed' }
  | { type: 'reducedMotion'; enabled: boolean };

export type SessionBootProps = {
  loading: boolean;
  children: React.ReactNode;
};
```

Illegal combinations the union refuses:

- `kind: 'ready'` with a `phase` field
- overlay present after leave has elapsed
- a `leaving` splash while `loading` is still true. `reduceBoot` must send that back to `holding` if session work restarts.

`entering` / `holding` / `leaving` are visual only. They never appear on `App` props.

## Signatures

```ts
export function reduceBoot(state: BootState, event: BootEvent): BootState {
  throw new Error('not implemented');
}

export function SessionBoot(props: SessionBootProps): React.ReactElement {
  throw new Error('not implemented');
}

function BootMark(): React.ReactElement {
  throw new Error('not implemented');
}

function readPrefersReducedMotion(): boolean {
  throw new Error('not implemented');
}
```

`reduceBoot` is pure. React effects dispatch events. They do not invent a parallel phase flag.

`SessionBoot` renders children under the overlay once `phase === 'leaving'`, and children alone once `kind === 'ready'`. During `entering` and `holding` it does not mount destination UI. Guests must not flash the portal. Authenticated users must not flash `AuthView`.

## Module map

```
frontend/src/App.tsx
  One caller. Passes loadingSession. No boot phase state.

frontend/src/components/SessionBoot.tsx
  SessionBoot, reduceBoot, BootMark, reduced-motion read.
  Owns the ritual. One file.

frontend/src/index.css
  Boot tokens, keyframes, prefers-reduced-motion overrides.
  Keep --font-sans Inter and --font-mono JetBrains Mono. Do not add families.

frontend/src/components/Skeleton.tsx
  Delete AppShellSkeleton. Keep SkeletonBlock and view skeletons.
```

No `boot/` folder. No `useBootPhase` hook file. Phase knowledge stays next to the component that paints it.

## CSS tokens

Reuse slate-50 / blue-600 / orange-500 already on `LandingView` and the signed-in shell. Do not introduce purple, cream paper, or a second sans.

```css
:root {
  --boot-bg: #f8fafc;              /* slate-50, matches Auth and app-shell */
  --boot-ink: #0f172a;             /* slate-900 wordmark */
  --boot-muted: #64748b;           /* unused unless a sr-only fallback needs paint */
  --boot-mark: #2563eb;            /* blue-600, Navbar / Landing mark tile */
  --boot-mark-edge: #1d4ed8;       /* blue-700, one-step depth, not a purple mix */
  --boot-accent: #f97316;          /* orange-500, hairline only */
  --boot-line-track: #e2e8f0;      /* slate-200, the bridge before fill */
  --boot-enter-ms: 480ms;
  --boot-leave-ms: 320ms;
  --boot-hold-travel-ms: 1800ms;   /* hairline shimmer while /api/auth/me is slow */
  --boot-ease: cubic-bezier(0.16, 1, 0.3, 1); /* same as .animate-fade-in */
}

@keyframes boot-enter { /* not implemented */ }
@keyframes boot-leave { /* not implemented */ }
@keyframes boot-bridge-draw { /* not implemented */ }
@keyframes boot-bridge-travel { /* not implemented */ }

.boot-root { /* not implemented */ }
.boot-stage { /* not implemented */ }
.boot-mark { /* not implemented */ }
.boot-wordmark { /* not implemented */ }
.boot-bridge { /* not implemented */ }

@media (prefers-reduced-motion: reduce) {
  .boot-root,
  .boot-mark,
  .boot-wordmark,
  .boot-bridge {
    animation: none;
    transition: none;
  }
}
```

Tailwind may set layout (`min-h-screen`, flex center). Motion and tokens live in `index.css` so reduced-motion is one override, not a prop.

## ASCII wireframe

Centered identity. Not a sidebar. Not metric cards.

```
+------------------------------------------------------+
|                                                      |
|                      slate-50                        |
|                                                      |
|                                                      |
|                      +------+                        |
|                      |  </> |  blue-600 rounded-xl   |
|                      +------+  Code icon, white      |
|                                                      |
|                     SkillBridge                      |
|                     Inter extrabold, slate-900       |
|                                                      |
|                  ____________                        |
|                  40px hairline                       |
|                  orange draws L->R                   |
|                                                      |
|                                                      |
|                                                      |
+------------------------------------------------------+
```

Leaving. Same frame, opacity falling, destination (Landing or app-shell) already mounted underneath.

```
+------------------------------------------------------+
|  Landing or app-shell (children, full viewport)      |
|  +----------------------------------------------+    |
|  | splash overlay, opacity -> 0                 |    |
|  |           [</>]  SkillBridge  ____           |    |
|  +----------------------------------------------+    |
+------------------------------------------------------+
```

## Copy

Visible wordmark. `SkillBridge`. No tagline. No "Paid Coding Tracks". No "Loading dashboard".

Accessible name on the overlay. `Loading session`. `role="status"` and `aria-busy="true"` while `kind === 'splash'`. `aria-busy` false when `ready`.

Do not show a mono status sentence. The hairline is the only busy signal.

## Motion spec

One signature. The orange hairline drawing under the wordmark, the bridge. Everything else is opacity and a 4% scale settle so the mark does not pop.

**entering** (480ms, `--boot-ease`)

- Overlay and stage opacity 0 to 1.
- Mark and wordmark scale 0.96 to 1.
- Hairline `stroke-dashoffset` (or scaleX from 0 on transform-origin left) 0 to 1.

**holding**

- Still, unless `/api/auth/me` is still running after enter elapsed.
- Then a 12% brighter segment travels along the already-drawn hairline (`--boot-hold-travel-ms`). Same element. Not a second gadget. Not `animate-pulse` blocks.

**leaving** (320ms, `--boot-ease`)

- Overlay opacity 1 to 0.
- Stage scale 1 to 0.98.
- Children are mounted at the start of this phase so Auth or the portal is there when the overlay clears.

**prefers-reduced-motion**

- Skip keyframes. First paint of splash is full opacity, full hairline, scale 1.
- `enterElapsed` and `leaveElapsed` fire on the next frame (or 0ms timeouts).
- No travel on the hairline.

**handoff colors**

- Splash background `#f8fafc`. `AuthView` / `LandingView` use `bg-slate-50`. Signed-in shell uses `app-shell` + `bg-slate-50`. The eye should not see a dark-to-light flash.

**idempotence**

- `loading: true` during `leaving` or `ready` returns to `{ kind: 'splash', phase: 'entering' }` unless reduced-motion, in which case it lands on `holding` immediately.
- Double `enterElapsed` while already `holding` is a no-op.
- Double `leaveElapsed` while already `ready` is a no-op.

## Invariants the public API hides

Callers never choose durations, copy, mark geometry, or phase. They pass `loading` and the tree that should exist after session resolution.

`SessionBoot` does not fetch `/api/auth/me`. `App` keeps that effect.

`SessionBoot` does not read `user`. Mounting children only after `loading` is false, and only from `leaving` onward, is enough to prevent the wrong destination from painting during the wait.
