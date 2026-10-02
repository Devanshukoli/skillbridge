# Session boot. Layout preview skeleton

Candidate `boot-b`. Replace the dark `AppShellSkeleton` with a light layout preview that copies the authenticated app chrome. Session is still unknown, so this is a geometric preview, not a user-specific dashboard.

## Types

```ts
/** Width of one shimmer bone, as a Tailwind width class already used in the app. */
type BoneWidthClass =
  | 'w-16'
  | 'w-20'
  | 'w-24'
  | 'w-28'
  | 'w-32'
  | 'w-40'
  | 'w-48'
  | 'w-56'
  | 'w-2/5'
  | 'w-1/2'
  | 'w-3/5'
  | 'w-2/3'
  | 'w-3/4';

type BoneHeightClass = 'h-2' | 'h-2.5' | 'h-3' | 'h-3.5' | 'h-4' | 'h-8' | 'h-10';

type BoneSpec = {
  readonly height: BoneHeightClass;
  readonly width: BoneWidthClass;
};

/**
 * Fixed geometry for the preview. Matches App + Navbar defaults.
 * Collapsed sidebar is not a state we have during session fetch.
 * Default in App is `isSidebarCollapsed === false`, so the preview is always expanded.
 */
type ShellChrome = {
  readonly sidebarWidthClass: 'w-64';
  readonly mainOffsetClass: 'lg:ml-64';
  readonly mobileHeaderClass: 'lg:hidden';
  readonly shellBgClass: 'bg-slate-50';
};

type NavBoneCount = 5;

declare const MAIN_BONES: readonly BoneSpec[];
declare const NAV_BONES: readonly BoneSpec[];
declare const SHELL_CHROME: ShellChrome;
```

No props on the public component. No `user`, no `variant`, no `collapsed`. Those values do not exist until `/api/auth/me` returns. Encoding them as optional props would invite a caller to lie with defaults.

`DashboardSkeleton` and the other view skeletons stay on `SkeletonBlock`. They load after session and after the shell is real. This candidate does not retarget them.

## Signatures

```ts
import type { JSX } from 'react';

/** Only symbol App imports for session boot. */
export function AppShellSkeleton(): JSX.Element {
  throw new Error('not implemented');
}

/** Existing helper. Unchanged public contract. Not used inside AppShellSkeleton. */
export function SkeletonBlock(props: { className?: string }): JSX.Element {
  throw new Error('not implemented');
}

/** File-private. Sweep highlight, not opacity pulse. */
function ShimmerBone(props: {
  height: BoneHeightClass;
  width: BoneWidthClass;
  className?: string;
}): JSX.Element {
  throw new Error('not implemented');
}

function ShellSidebarPreview(): JSX.Element {
  throw new Error('not implemented');
}

function ShellMainPreview(): JSX.Element {
  throw new Error('not implemented');
}
```

`ShellSidebarPreview` and `ShellMainPreview` are private. If either has only one caller and no extra policy, inline it. Do not export them.

`App.tsx` stays:

```tsx
if (loadingSession) {
  return <AppShellSkeleton />;
}
```

Legal routes still short-circuit before this return. Privacy and terms never see the preview.

## Module map

```
frontend/src/App.tsx                 # unchanged caller
frontend/src/components/Skeleton.tsx # rewrite AppShellSkeleton only
frontend/src/index.css               # boot-shimmer keyframes + reduced-motion
frontend/src/components/Navbar.tsx   # geometry source of truth. do not import it
```

Do not add `SessionBoot.tsx`, `BootGate.tsx`, or a theme-aware wrapper. The preview copies class names from `App` and `Navbar`. It does not mount `Navbar`. `Navbar` needs `user`.

Do not share a layout component with the live shell in this change. Extracting `AppShell` would be a larger refactor than the boot brief.

## Tokens

Keep Inter and JetBrains Mono from `index.css` `--font-sans` / `--font-mono`. Do not add a display face. Do not add purple, cream, serif, or acid green.

| Token | Value | Use |
| --- | --- | --- |
| `--boot-bone` | `#e2e8f0` (slate-200) | Bone fill. Low contrast on slate-50 |
| `--boot-bone-mid` | `#f1f5f9` (slate-100) | Shimmer highlight |
| `--boot-bone-edge` | `#f8fafc` (slate-50) | Sweep edge, same as shell bg |
| `--boot-sidebar-bg` | `#ffffff` | Matches `--app-surface` / Navbar |
| `--boot-border` | `#e2e8f0` | Matches `--app-border` |
| `--boot-shimmer-ms` | `1400ms` | One sweep |
| `--boot-shimmer-easing` | `linear` | Continuous, not bounce |
| Sidebar width | `16rem` (`w-64`) | Matches expanded Navbar |
| Main offset | `lg:ml-64` | Matches App `main` |
| Main padding | `p-6 lg:p-10 pb-24 lg:pb-10` | Matches App `main` |
| Mobile bar | `p-4`, `lg:hidden` | Matches Navbar header |
| Logo mark | `bg-blue-600` 8x8 rounded | Same mark as Navbar. Not a gradient |

Bone radii stay small (`rounded` / `rounded-md`). No `rounded-3xl` cards. No `border` on bones. No `shadow`. No four-up metric grid.

Active nav hint. One of the five nav bones may use a `bg-blue-50` row behind it, same as Navbar's selected item. Do not color the bone itself blue-600 except the tiny logo square.

`data-theme="dark"` is unset until a user loads. Boot uses the light `:root` tokens and `bg-slate-50` on purpose. Do not read `prefers-color-scheme` for this screen.

## ASCII wireframe

Desktop, `lg` and up. Not a centered splash.

```
+------------------+--------------------------------------------+
| [■] SkillBridge  |                                            |
|                  |  ========                                  |
|  ( )  ------     |  ========================                  |
|       ----       |  ==============                            |
|                  |                                            |
|  o  --------     |  ==========                                |
|  o  ----------   |  =====================                     |
|  o  ------       |  ================                          |
|  o  ----------   |  ===================                       |
|  o  --------     |  ==========                                |
|                  |                                            |
|  o  Log out      |                                            |
+------------------+--------------------------------------------+
 aside w-64         main flex-1 p-6 lg:p-10  max-w-7xl mx-auto
 bg-white           bg-slate-50
 border-r
```

Mobile.

```
+------------------------------------------+
| [■] SkillBridge                     [=]  |  sticky header
+------------------------------------------+
|                                          |
|  ========                                |
|  ========================                |
|  ==============                          |
|                                          |
|  ==========                              |
|  =====================                   |
|  ================                        |
+------------------------------------------+
 aside translated off-screen, same as Navbar closed
```

Main column content, top to bottom.

1. Eyebrow bone `h-2.5 w-24`
2. Title bone `h-8 w-3/5`
3. Subtitle bone `h-3 w-2/5`
4. Gap
5. Five list rows. Icon square `h-3.5 w-3.5` plus a line. Widths `w-3/4`, `w-1/2`, `w-2/3`, `w-3/5`, `w-2/5`

No hero banner. No stat cards. Varied line lengths are the only texture.

## Motion spec

**While mounted.** Bones use a CSS background sweep class, for example `boot-shimmer`. Translate a light band across `--boot-bone` on the X axis. Duration `--boot-shimmer-ms`. Infinite. Stagger is optional and at most `80ms` per row, via `animation-delay` on the bone list. Do not use Tailwind `animate-pulse`. Pulse reads as chunky opacity blocks, which is the current failure.

**When session resolves.** `App` unmounts this tree in one commit and mounts `AuthView` or the real shell. There is no exit controller and no extra React state. Smoothness comes from matching chrome. For a signed-in user, sidebar and main padding stay put. Main copy then uses the existing `animate-fade-in` on Dashboard and siblings. For a guest, the landing page replaces the shell. That swap is accepted in the rationale. Do not keep the skeleton mounted to crossfade. That would change the `loadingSession` contract.

**prefers-reduced-motion.** In `index.css`:

```css
.boot-shimmer {
  background-image: linear-gradient(
    90deg,
    var(--boot-bone) 0%,
    var(--boot-bone-mid) 45%,
    var(--boot-bone-edge) 50%,
    var(--boot-bone-mid) 55%,
    var(--boot-bone) 100%
  );
  background-size: 200% 100%;
  animation: boot-shimmer-sweep var(--boot-shimmer-ms) var(--boot-shimmer-easing) infinite;
}

@keyframes boot-shimmer-sweep {
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .boot-shimmer {
    animation: none;
    background-image: none;
    background-color: var(--boot-bone);
  }

  .animate-fade-in {
    animation: none;
  }
}
```

The `.animate-fade-in` rule already exists. Gating it under reduced motion belongs in the same CSS edit so the handoff does not slide. Do not add `transform` on the boot root. A transform on the shell would fight later paint of `Navbar`.

**A11y.** Root of `AppShellSkeleton`:

```tsx
<div
  className="app-shell min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row"
  role="status"
  aria-busy="true"
  aria-live="polite"
  aria-label="Loading session"
>
```

Bones are `aria-hidden`. No live text that updates on a timer.

## Invariants

- Public boot API is `AppShellSkeleton()` with zero arguments.
- Preview geometry tracks expanded student or admin chrome, not LandingView.
- Bones are lines and one logo square. Not cards.
- Motion is CSS only. No JS motion library.
- `SkeletonBlock` pulse may remain for in-view loaders until a later change.
