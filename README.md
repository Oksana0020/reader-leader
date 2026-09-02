# Reader Leader

Reader Leader is a Next.js App Router walking skeleton for a UK and Hiberno-English early-reading fluency tutor. Phase 1 establishes the reference-led interface system, complete route map, typed domain model, deterministic seed state, local session persistence, and a mockable speech-alignment endpoint.

## Foundation Stack

| Area | Choice |
|---|---|
| Application | Next.js 16 App Router with React 19 |
| Language | TypeScript in strict mode |
| Styling | Tailwind CSS 4 with project-specific CSS tokens |
| Validation | Zod at the `/api/speech/align` boundary |
| State | Typed React context persisted to `localStorage` with deterministic fallback data |
| Icons | Lucide React plus the Reader Leader star-and-sound mark |

## Routes

| Route | Purpose |
|---|---|
| `/` | Story-band selection library |
| `/read` | Reading-canvas foundation for the later Web Audio FSM |
| `/celebrate` | Student celebration and educator-record handoff |
| `/dashboard` | Class metrics and phonetic-gap overview |
| `/dashboard/student` | Student profile and seeded running record |
| `POST /api/speech/align` | Typed deterministic alignment mock |

## Run Locally

Install dependencies with `pnpm install`, start the development server with `pnpm dev`, and open `http://localhost:3000`. Run `pnpm check` for lint and strict TypeScript validation. Run `NODE_ENV=production pnpm build` in environments that already inject a development `NODE_ENV` value.

## Phonics Restraint Contract

The alignment mock treats **“knight” pronounced as `/n-aɪ-t/` as correct**, applies no cue, and records a 0% penalty. The provisional educator demonstration is a separate fixture in which a child sounds the silent letter as `/k-n-aɪ-t/`. That fixture is labelled for educator review and remains non-penalising until professional judgement is confirmed.

## Phase Boundary

Phase 1 intentionally provides the architectural and visual foundation. The live Web Audio analyser, pure 3-second/5-second hesitation state machine, two-step override interaction, and final interaction hardening remain for the approved implementation phases that follow.
