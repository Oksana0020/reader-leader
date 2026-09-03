"use client";

/* Reference-led rule: shared state must remain invisible to the child-facing composition and preserve one calm action at a time. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_STATE, getStorySnapshot } from "@/lib/seed";
import { loadReaderLeaderState, saveReaderLeaderState } from "@/lib/session-storage";
import { recalculateAlignmentMetrics } from "@/lib/reading-metrics";
import type { AlignmentResponse, AttemptAudioSnippet, EvaluationMode, ReaderLeaderState, Story } from "@/lib/domain";

interface SessionContextValue {
  state: ReaderLeaderState;
  hydrated: boolean;
  selectStory: (story: Story) => void;
  prepareReadingAttempt: () => void;
  startReading: () => void;
  setCurrentToken: (tokenIndex: number) => void;
  setEvaluationMode: (mode: EvaluationMode) => void;
  beginAlignment: (elapsedMs: number) => void;
  completeReading: (alignment: AlignmentResponse, elapsedMs: number, attemptSnippet?: AttemptAudioSnippet) => void;
  confirmOverride: (tokenId: string, reason: string) => void;
  reset: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReaderLeaderState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.readerLeaderHydrated = "true";
    const restored = loadReaderLeaderState(window.localStorage);
    queueMicrotask(() => {
      setState(restored);
      setHydrated(true);
    });
    return () => {
      delete document.documentElement.dataset.readerLeaderHydrated;
    };
  }, []);

  useEffect(() => {
    if (hydrated) saveReaderLeaderState(window.localStorage, state);
  }, [hydrated, state]);

  const selectStory = useCallback((story: Story) => {
    setState((current) => ({
      ...current,
      selectedStoryId: story.id,
      session: {
        id: `session-${Date.now()}`,
        studentId: current.session.studentId,
        storyId: story.id,
        storySnapshot: getStorySnapshot(story),
        localeProfile: current.session.evaluationMode === "regional-restraint" ? "en-IE" : "en-GB",
        evaluationMode: current.session.evaluationMode,
        status: "ready",
        currentTokenIndex: 0,
        elapsedMs: 0,
        alignment: undefined,
        attemptSnippet: undefined,
        earnedBadges: [],
      },
    }));
  }, []);

  const prepareReadingAttempt = useCallback(() => {
    setState((current) => ({
      ...current,
      session: {
        ...current.session,
        id: `session-${Date.now()}`,
        status: "ready",
        currentTokenIndex: 0,
        elapsedMs: 0,
        alignment: undefined,
        attemptSnippet: undefined,
        earnedBadges: [],
        startedAt: undefined,
        completedAt: undefined,
      },
    }));
  }, []);

  const startReading = useCallback(() => {
    setState((current) => ({
      ...current,
      session: { ...current.session, status: "reading", currentTokenIndex: 0, startedAt: new Date().toISOString(), completedAt: undefined, elapsedMs: 0, alignment: undefined, attemptSnippet: undefined },
    }));
  }, []);

  const setCurrentToken = useCallback((tokenIndex: number) => {
    setState((current) => ({ ...current, session: { ...current.session, currentTokenIndex: Math.max(0, tokenIndex) } }));
  }, []);

  const setEvaluationMode = useCallback((mode: EvaluationMode) => {
    setState((current) => ({
      ...current,
      session: {
        ...current.session,
        evaluationMode: mode,
        localeProfile: mode === "regional-restraint" ? "en-IE" : "en-GB",
      },
    }));
  }, []);

  const beginAlignment = useCallback((elapsedMs: number) => {
    setState((current) => ({ ...current, session: { ...current.session, status: "aligning", elapsedMs } }));
  }, []);

  const completeReading = useCallback((alignment: AlignmentResponse, elapsedMs: number, attemptSnippet?: AttemptAudioSnippet) => {
    setState((current) => ({
      ...current,
      session: {
        ...current.session,
        status: "complete",
        alignment,
        attemptSnippet,
        elapsedMs,
        completedAt: new Date().toISOString(),
        earnedBadges: ["great-listening", "phonics-champion", "speed-reader"],
      },
    }));
  }, []);

  const confirmOverride = useCallback((tokenId: string, reason: string) => {
    setState((current) => {
      const alignment = current.session.alignment;
      const token = alignment?.tokens.find((candidate) => candidate.id === tokenId);
      if (!alignment || !token || token.status === "accepted-teacher-override") return current;

      const updatedAlignment = recalculateAlignmentMetrics({
        ...alignment,
        tokens: alignment.tokens.map((candidate) => candidate.id === tokenId
          ? { ...candidate, status: "accepted-teacher-override", scoreImpact: false, explanation: `${candidate.explanation ?? "Pronunciation reviewed."} Accepted by educator.` }
          : candidate),
      });

      return {
        ...current,
        session: { ...current.session, alignment: updatedAlignment },
        overrides: [...current.overrides, {
          id: globalThis.crypto.randomUUID(),
          sessionId: current.session.id,
          tokenId,
          previousStatus: token.status,
          nextStatus: "accepted-teacher-override",
          actorLabel: "Jack Murphy’s educator",
          reason,
          createdAt: new Date().toISOString(),
        }],
      };
    });
  }, []);

  const reset = useCallback(() => setState(DEFAULT_STATE), []);
  const value = useMemo(() => ({ state, hydrated, selectStory, prepareReadingAttempt, startReading, setCurrentToken, setEvaluationMode, beginAlignment, completeReading, confirmOverride, reset }), [beginAlignment, completeReading, confirmOverride, hydrated, prepareReadingAttempt, reset, selectStory, setCurrentToken, setEvaluationMode, startReading, state]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useReaderSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useReaderSession must be used within SessionProvider");
  return context;
}
