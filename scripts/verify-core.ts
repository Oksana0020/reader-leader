import assert from "node:assert/strict";
import {
  HESITATION_THRESHOLD_MS,
  INITIAL_HESITATION_MACHINE,
  PROMPT_THRESHOLD_MS,
  hesitationReducer,
} from "../lib/hesitation-fsm.ts";
import { calculateReadingMetrics } from "../lib/reading-metrics.ts";
import type { AlignmentStatus, TokenAlignment } from "../lib/domain.ts";

let state = hesitationReducer(INITIAL_HESITATION_MACHINE, { type: "PERMISSION_GRANTED", atMs: 0 });
state = hesitationReducer(state, { type: "SILENCE", atMs: HESITATION_THRESHOLD_MS - 1 });
assert.equal(state.phase, "listening");
state = hesitationReducer(state, { type: "SILENCE", atMs: HESITATION_THRESHOLD_MS });
assert.equal(state.phase, "hesitating");
state = hesitationReducer(state, { type: "SILENCE", atMs: PROMPT_THRESHOLD_MS });
assert.equal(state.phase, "prompting");
state = hesitationReducer(state, { type: "SPEECH", atMs: PROMPT_THRESHOLD_MS + 100 });
assert.equal(state.phase, "speaking");
assert.equal(state.silenceMs, 0);
state = hesitationReducer(state, { type: "SILENCE", atMs: PROMPT_THRESHOLD_MS + 200 });
assert.equal(state.phase, "listening");

const statuses: AlignmentStatus[] = ["correct", "substitution", "accepted-teacher-override"];
assert.notEqual(statuses[2], "accepted-regional-variant");
const tokens: TokenAlignment[] = statuses.map((status, index) => ({
  id: `token-${index}`,
  token: `word-${index}`,
  index,
  status,
  confidence: 0.9,
  scoreImpact: status === "substitution",
}));
const metrics = calculateReadingMetrics(tokens, 60);
assert.equal(metrics.accuracyRate, 67);
assert.equal(metrics.wcpm, 2);

console.log("Core FSM, metrics, and override-taxonomy checks passed.");
