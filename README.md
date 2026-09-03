# Reader Leader

Reader Leader is a Next.js App Router walking skeleton for a UK and Hiberno-English early-reading fluency tutor. It now implements the single-path student and educator loop: story selection, memory-safe live listening, timed hesitation support, celebration, a generated running record, and an auditable two-click teacher override.

## Foundation Stack

| Area | Choice |
|---|---|
| Application | Next.js 16 App Router with React 19 |
| Language | TypeScript in strict mode |
| Styling | Tailwind CSS 4 with project-specific CSS tokens |
| Validation | Zod at the `/api/speech/align` boundary |
| State | Versioned typed React context persisted to `localStorage` with safe seed fallback |
| Audio | Web Audio `AnalyserNode` VAD plus `MediaRecorder`, with explicit teardown on finish and unmount |
| Icons | Lucide React plus the Reader Leader star-and-sound mark |

## Routes

| Route | Purpose |
|---|---|
| `/` | Story-band selection library |
| `/read` | Dynamic reading canvas with microphone capture and 3s/5s hesitation support |
| `/celebrate` | Student celebration and educator-record handoff |
| `/dashboard` | Class metrics and phonetic-gap overview |
| `/dashboard/student` | Latest/seeded running record with two-click teacher override and audit state |
| `POST /api/speech/align` | Typed deterministic alignment mock |

## Run Locally

Install dependencies with `pnpm install`, create the compiled bundle with `NODE_ENV=production pnpm build`, then run the production preview with `pnpm dev` or `pnpm start` and open `http://localhost:3000`. The managed preview intentionally maps `pnpm dev` to `next start`, avoiding development HMR WebSockets across container proxies. Run `pnpm check` for lint and strict TypeScript validation, `pnpm verify:core` for threshold/metrics assertions, and `pnpm verify:browser` for the self-contained Chromium flow with fake silent audio.

## Phonics Restraint Contract

The alignment mock treats **“knight” pronounced as `/n-aɪ-t/` as correct**, applies no cue, and records a 0% penalty. The provisional educator demonstration is a separate fixture in which a child sounds the silent letter as `/k-n-aɪ-t/`. That fixture is labelled for educator review and remains non-penalising. A confirmed teacher decision becomes `accepted-teacher-override`, preserving a clean distinction from automated `accepted-regional-variant` restraint in the audit log.

## Audio Lifecycle

The microphone hook owns its complete resource graph. Starting creates one stream, source, analyser, animation-frame loop, optional recorder, and audio context. Finishing, cancellation, errors, and component unmount all stop every media track, cancel the frame loop, disconnect source and analyser nodes, stop the recorder when active, and close the `AudioContext` idempotently.
