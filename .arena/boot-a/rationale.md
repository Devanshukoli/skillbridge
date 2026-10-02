# Session boot rationale

## Problem

Session start today paints `AppShellSkeleton`, a dark `slate-950` fake dashboard of chunky pulse blocks. `/api/auth/me` has not decided who the person is yet. Most of those waits end on `AuthView` / `LandingView` (`slate-50`, blue mark, orange accents). The rest end on the light app-shell. The skeleton lies about destination and fights the fonts and colors that already exist. The replacement has to feel like SkillBridge, stay quiet, and leave without `App.tsx` growing enter/hold/leave flags.

## Usage (caller's view)

`App.tsx` keeps `loadingSession`. Legal URLs still bypass boot. After legal, wrap the existing Auth / onboarding / portal tree in `SessionBoot loading={loadingSession}`. Delete the `if (loadingSession) return <AppShellSkeleton />` branch and the `AppShellSkeleton` import. One prop. No `bootPhase` on `App`. See SHAPE.md for the exact JSX.

## Shape

Boot is an identity ritual, not a layout placeholder. Center the existing Code-in-blue-600 tile and the Inter wordmark `SkillBridge`. One motion, an orange hairline that draws left to right under the name. That is the brand pun, a bridge, without a second animation language.

Domain state is `BootState`, a splash phase or `ready` (`per principle-model-the-domain`, `per principle-type-system-discipline`). `reduceBoot` is the only writer. React only dispatches `loading`, elapsed, and reduced-motion events (`per principle-foundational-thinking`). `App` does not duplicate those phases (`per principle-laziness-protocol`).

The public API is `SessionBoot({ loading, children })`. Overlay timing, copy, reduced-motion, and when children mount live behind it. That is the whole interface because the caller already has the only fact that matters, whether session fetch is done (`per principle-minimize-reader-load`).

Children stay unmounted during `entering` and `holding` so a guest never sees the portal and a member never sees Landing. They mount at `leaving` so the overlay can fade on top of the real next screen (`per principle-experience-first`). `loading` flipping true again re-enters. Duplicate elapsed events no-op (`per principle-make-operations-idempotent`).

Reduced-motion is a CSS media query plus 0ms elapsed events, not a third boolean on `App` (`per principle-boundary-discipline`, `per principle-encode-lessons-in-structure`).

`AppShellSkeleton` is deleted in the same wave as the caller change (`per principle-migrate-callers-then-delete-legacy-apis`, `per principle-subtract-before-you-add`). View skeletons stay. They wait on curriculum, which is a different wait. Fonts stay Inter and JetBrains Mono. No new family. No purple wash. Background is slate-50 so the handoff does not cross a dark/light cliff (`per principle-redesign-from-first-principles`).

## Synthesis decision

## Tradeoffs accepted

- We accept wrapping the post-legal tree instead of keeping the early return, in exchange for a real leave transition. Unmounting on `loadingSession === false` cannot fade out.
- We accept mounting destination UI only at `leaving`, in exchange for no guest/member flash. Slow session plus a 320ms fade is still shorter than teaching the eye a fake dashboard.
- We accept a hairline travel on long holds, in exchange for not adding a second spinner. It is the same element as the signature draw.
- We accept not theming the splash with `data-theme`. Session runs before `user.profile.appearance` applies. The wait matches Landing and the default light shell, which is where almost every boot lands.
- We accept one file plus a few `index.css` keyframes, in exchange for not splitting enter/hold/leave components.

## Alternatives considered

- **Refined layout skeleton (rejected).** Light `slate-50` sidebar, thin bars, `SkeletonBlock` without `slate-950` or jumbo pulse tiles. Closer to the signed-in shell and less of a theme slap. Still a layout skeleton. Unauthenticated people then get Landing, so the wait still previews the wrong product. Callers would keep an early return, so leave motion dies. Interface looks the same (`<AppShellSkeleton />`) while hiding none of the destination policy. Rejected so this candidate stays a splash, not a prettier lie.
- **Early-return splash with no leave.** `if (loadingSession) return <SessionBoot />`. Smaller `App` diff. Overlay cannot fade into Auth. Hard cut. Loses the brief's smooth handoff.
- **Full-viewport spinner on a blank slate.** Tiny API. No identity. Feels like a generic SaaS wait, and the Code mark already exists for this job.

## Open questions and risks

- If `/api/auth/me` often returns in under 200ms, does the enter animation overstay its welcome, and should `reduceBoot` skip to `leaving` when `loading` is already false before enter elapsed?
- Should legal routes ever show the splash if session fetch is in flight behind them, or is today's skip still correct?
- If `fetchSession` later can restart without remounting `App`, is re-entering from `ready` the right product, or should a second fetch stay silent?

## Next implementation step

Add `reduceBoot` and `SessionBoot` in `frontend/src/components/SessionBoot.tsx` against the types above, then swap the `App.tsx` early return for the gate and delete `AppShellSkeleton`.
