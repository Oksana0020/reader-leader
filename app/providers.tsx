"use client";

/* Reference-led rule: shared state must remain invisible to the child-facing composition and preserve one calm action at a time. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_STATE } from "@/lib/seed";
import type { AlignmentResponse, OverrideEvent, ReaderLeaderState, StoryId } from "@/lib/domain";

const STORAGE_KEY = "reader-leader-session-v1";

interface SessionContextValue {
  state: ReaderLeaderState;
  hydrated: boolean;
  selectStory: (storyId: StoryId) => void;
  saveAlignment: (alignment: AlignmentResponse) => void;
  addOverride: (event: OverrideEvent) => void;
  reset: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ReaderLeaderState>(() => {
    if (typeof window === "undefined") return DEFAULT_STATE;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as ReaderLeaderState) : DEFAULT_STATE;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return DEFAULT_STATE;
    }
  });
  const hydrated = typeof window !== "undefined";

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const selectStory = useCallback((storyId: StoryId) => {
    setState((current) => ({ ...current, selectedStoryId: storyId, session: { ...current.session, storyId, status: "ready", currentTokenIndex: 0 } }));
  }, []);

  const saveAlignment = useCallback((alignment: AlignmentResponse) => {
    setState((current) => ({ ...current, session: { ...current.session, status: "complete", alignment, completedAt: new Date().toISOString() } }));
  }, []);

  const addOverride = useCallback((event: OverrideEvent) => {
    setState((current) => ({ ...current, overrides: [...current.overrides, event] }));
  }, []);

  const reset = useCallback(() => setState(DEFAULT_STATE), []);
  const value = useMemo(() => ({ state, hydrated, selectStory, saveAlignment, addOverride, reset }), [addOverride, hydrated, reset, saveAlignment, selectStory, state]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useReaderSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useReaderSession must be used within SessionProvider");
  return context;
}
