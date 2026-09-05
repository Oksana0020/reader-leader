import { describe, expect, it } from "vitest";
import { getMatchingTranscriptWord, isAccentSafeMatch } from "../../../lib/asr-match";

describe("asr-match", () => {
  it("accepts a safe regional variant for knight", () => {
    expect(isAccentSafeMatch("knight", "night", "regional-restraint")).toBe(true);
    expect(getMatchingTranscriptWord("knight", "the knight rides", "regional-restraint")).toBe("knight");
  });

  it("accepts the mirror case when the target word is night and the transcript says knight", () => {
    expect(isAccentSafeMatch("night", "knight", "regional-restraint")).toBe(true);
    expect(getMatchingTranscriptWord("night", "the brave knight went out into the cold night", "regional-restraint")).toBe("night");
  });

  it("prefers the most recent relevant word in a transcript", () => {
    const transcript = "the cat sat on the mat and then the cat";
    expect(getMatchingTranscriptWord("cat", transcript, "standard-rp")).toBe("cat");
  });

  it("does not over-match very short words by prefix alone", () => {
    expect(getMatchingTranscriptWord("it", "in the red box", "standard-rp")).toBeNull();
  });
});
