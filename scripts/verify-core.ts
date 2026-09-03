import assert from "node:assert/strict";
import {
  FINAL_TOKEN_AUTO_FINISH_PAUSE_MS,
  HESITATION_THRESHOLD_MS,
  INITIAL_TOKEN_INDEX,
  INITIAL_HESITATION_MACHINE,
  PROMPT_THRESHOLD_MS,
  advanceTokenIndex,
  hesitationReducer,
  shouldAutoFinishReading,
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
assert.equal(INITIAL_TOKEN_INDEX, 0);

assert.equal(advanceTokenIndex(0, 14), 1);
assert.equal(advanceTokenIndex(13, 14), 13);
assert.equal(shouldAutoFinishReading(13, 14, true, FINAL_TOKEN_AUTO_FINISH_PAUSE_MS - 1), false);
assert.equal(shouldAutoFinishReading(13, 14, true, FINAL_TOKEN_AUTO_FINISH_PAUSE_MS), true);

const statuses: AlignmentStatus[] = ["correct", "substitution", "accepted-teacher-override"];
assert.notEqual(statuses[2], "accepted-regional-variant");
const tokens: TokenAlignment[] = statuses.map((status, index) => ({
  id: `token-${index}`,
  token: `word-${index}`,
  index,
  status,
  confidence: 0.9,
  scoreImpact: status === "substitution",
  falseCorrection: status === "substitution",
}));
const metrics = calculateReadingMetrics(tokens, 60);
assert.equal(metrics.accuracyRate, 67);
assert.equal(metrics.wcpm, 2);
assert.equal(metrics.falseCorrectionRate, 33.3);

console.log("Core FSM, metrics, and override-taxonomy checks passed.");
