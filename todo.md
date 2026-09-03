# Reader Leader Route-Wiring Fix

- [x] Confirm `app/page.tsx` mounts `StoryLibrary` and each story card calls the existing `selectStory` action before navigation.
- [x] Confirm `app/read/page.tsx` mounts the existing `ReadingExperience` without retaining static Phase 1 controls.
- [x] Confirm `app/dashboard/student/page.tsx` mounts the existing hydrated running-record view and existing two-step override flow.
- [x] Apply only minimal corrections required by the active files; do not duplicate helper logic.
- [x] Verify Fat Cat and Brave Knight snapshots, microphone permission and hesitation timers, align-and-celebrate navigation, flagged `knight` evidence, and `accepted-teacher-override` audit persistence.
- [x] Run lint, strict TypeScript, the focused core checks, production build, and live browser flow.
