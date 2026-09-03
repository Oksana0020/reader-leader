# Reader Leader Route-Wiring Fix

- [x] Confirm `app/page.tsx` mounts `StoryLibrary` and each story card calls the existing `selectStory` action before navigation.
- [x] Confirm `app/read/page.tsx` mounts the existing `ReadingExperience` without retaining static Phase 1 controls.
- [x] Confirm `app/dashboard/student/page.tsx` mounts the existing hydrated running-record view and existing two-step override flow.
- [x] Apply only minimal corrections required by the active files; do not duplicate helper logic.
- [x] Verify Fat Cat and Brave Knight snapshots, microphone permission and hesitation timers, align-and-celebrate navigation, flagged `knight` evidence, and `accepted-teacher-override` audit persistence.
- [x] Run lint, strict TypeScript, the focused core checks, production build, and live browser flow.

## Production Preview

- [x] Confirm the story-card and microphone buttons retain their existing client `onClick` handlers.
- [x] Configure the managed preview command to run the compiled Next.js server without development HMR.
- [x] Build the production application and restart port 3000 under the production command.
- [x] Verify HTTP response, absence of `/_next/hmr`, React hydration, story navigation, and the microphone permission path on the preview URL.

## Phase 4 Demo Features

- [x] Extend typed session/alignment state for evaluation mode, false-correction rate, and a bounded attempt-audio data URI.
- [x] Advance the active token from VAD speech events and keep the 3s/5s FSM support bound to that token.
- [x] Automatically finish after the final token is spoken and paused, while retaining manual next/finish behavior.
- [x] Capture and persist a real two-second `knight` attempt segment and play it through a clean HTML5 Audio element.
- [x] Revoke temporary object URLs and release all audio graph resources on finish, reset, and unmount.
- [x] Add the Standard RP versus Hiberno-English/Northern Irish evaluation toggle and distinct alignment outcomes.
- [x] Verify strict TypeScript, focused assertions, production build, HTTP 200, hydration, and both evaluation paths.

## Green Band Completion and Session Isolation

- [x] Add The Lost Shield and King’s Ring to the typed Level 5 catalogue without changing The Brave Knight contract.
- [x] Render three consistent, interactive Green Band cards with friendly inline vector artwork.
- [x] Reset the active token and hesitation lifecycle to index 0 on `/read` mount, microphone start, and Read Again.
- [x] Ensure non-hero stories render neutral 100% records with story-appropriate assessment history.
- [x] Show the teacher-override success banner only when the active session has its own confirmed override.
- [x] Regression-test Brave Knight alignment, `knight` popover, retained audio playback, and two-click override.
- [x] Run strict checks, a clean production build, HTTP 200 verification, and restart `0.0.0.0:3000`.

## Reading Counter Start Gate

- [x] Confirm the current `/read` mount and microphone-start reset paths still force token index 0.
- [x] Ignore all VAD energy during the first 300 ms after microphone activation.
- [x] Require genuine sustained speech energy before emitting a speech-start edge or advancing the active token.
- [x] Preserve the Brave Knight alignment, two-second snippet, two-click override, and clean Reading Canvas UI.
- [x] Run focused assertions, the production Chromium regression, a clean build, HTTP 200, and restart `0.0.0.0:3000`.
