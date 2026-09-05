import { describe, expect, it } from "vitest";
import { getMatchingTranscriptWord, isAccentSafeMatch, transcriptMatchesTargetSentence } from "../../../lib/asr-match";

describe("asr-match", () => {
  it("accepts a safe regional variant for knight", () => {
    expect(isAccentSafeMatch("knight", "night", "regional-restraint")).toBe(true);
    expect(getMatchingTranscriptWord("knight", "the knight rides", "regional-restraint")).toBe("knight");
  });

  it("accepts the mirror case when the target word is night and the transcript says knight", () => {
    expect(isAccentSafeMatch("night", "knight", "regional-restraint")).toBe(true);
    expect(getMatchingTranscriptWord("night", "the brave knight went out into the cold night", "regional-restraint")).toBe("night");
  });

  it("accepts Irish-English silent-k and rhotic variants in regional restraint", () => {
    expect(isAccentSafeMatch("horse", "hoarse", "regional-restraint")).toBe(true);
    expect(isAccentSafeMatch("hoarse", "horse", "regional-restraint")).toBe(true);
    expect(getMatchingTranscriptWord("horse", "the horse came down the road with a hoarse cry", "regional-restraint")).toBe("hoarse");
  });

  it("prefers the most recent relevant word in a transcript", () => {
    const transcript = "the cat sat on the mat and then the cat";
    expect(getMatchingTranscriptWord("cat", transcript, "standard-rp")).toBe("cat");
  });

  it("ignores stale transcript words when the latest match is the current reading token", () => {
    const transcript = "the brave knight went out into the cold night and the knight was waiting";
    expect(getMatchingTranscriptWord("knight", transcript, "regional-restraint")).toBe("knight");
  });

  it("does not over-match very short words by prefix alone", () => {
    expect(getMatchingTranscriptWord("it", "in the red box", "standard-rp")).toBeNull();
  });

  it("does not accept a different sentence as a successful match when only the ending is shared", () => {
    expect(getMatchingTranscriptWord("cat", "the small dog sat on the mat", "standard-rp")).toBeNull();
    expect(getMatchingTranscriptWord("dog", "the big cat sat on the mat", "standard-rp")).toBeNull();
  });

  it("rejects sentence-level mismatches even when the ending of the sentence is the same", () => {
    expect(transcriptMatchesTargetSentence("the big cat sat on the mat", "the small dog sat on the mat", "standard-rp")).toBe(false);
    expect(transcriptMatchesTargetSentence("the big cat sat on the mat", "the big cat sat on the mat", "standard-rp")).toBe(true);
  });
});
