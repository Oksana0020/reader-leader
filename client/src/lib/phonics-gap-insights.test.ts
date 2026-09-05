import { describe, expect, it } from "vitest";
import { buildTeacherReport } from "../../../lib/teacher-report";
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

  it("creates a concrete teacher action plan from the run evidence", () => {
    const report = buildTeacherReport({
      sessionId: "session-1",
      localeProfile: "en-IE",
      evaluationMode: "regional-restraint",
      restraintApplied: true,
      lastConfirmedTokenIndex: 2,
      tokens: [
        { id: "1", token: "knight", index: 0, status: "accepted-regional-variant", confidence: 0.96, scoreImpact: false, explanation: "Silent k is accepted in this accent" },
        { id: "2", token: "night", index: 1, status: "correct", confidence: 0.99, scoreImpact: false },
        { id: "3", token: "horse", index: 2, status: "review", confidence: 0.82, scoreImpact: false, explanation: "Possible rhotic variation" },
      ],
      metrics: { accuracyRate: 94, wcpm: 49, elapsedSeconds: 22, falseCorrectionRate: 0 },
    });

    expect(report.actionPlan.some((step) => step.includes("silent-letter") || step.includes("silent letter"))).toBe(true);
    expect(report.actionPlan.some((step) => step.includes("teacher review") || step.includes("review"))).toBe(true);
  });
});
