import { describe, expect, it } from "vitest";
import { buildPhonicsGapInsights } from "../../../lib/phonics-gap-insights";

describe("phonics gap insights", () => {
  it("turns reading evidence into actionable teacher guidance", () => {
    const insights = buildPhonicsGapInsights([
      { token: "knight", status: "accepted-regional-variant", scoreImpact: false },
      { token: "night", status: "correct", scoreImpact: false },
      { token: "horse", status: "review", scoreImpact: false },
      { token: "lost", status: "substitution", scoreImpact: true },
    ]);

    expect(insights.some((insight) => insight.label === "Silent letter pattern")).toBe(true);
    expect(insights.some((insight) => insight.label === "Rhotic variation")).toBe(true);
    expect(insights.some((insight) => insight.label === "Intervention trigger")).toBe(true);
  });
});
