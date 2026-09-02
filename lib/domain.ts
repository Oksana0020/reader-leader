/** Shared Reader Leader contracts for stories, speech alignment, educator review, and the hesitation state machine. */

export type StoryId = "fat-cat" | "big-dog" | "sun-bun" | "pig-in-mud" | "red-hen" | "frog-log" | "bears-hat" | "ship-trip" | "fox-box";
export type BookBandId = "pink" | "red" | "yellow";
export type AccentProfile = "en-GB" | "en-IE";

export interface Story {
  id: StoryId;
  title: string;
  level: 1 | 2 | 3;
  band: BookBandId;
  bandLabel: string;
  focus: string;
  targetText: string;
  imageUrl?: string;
}

export type AlignmentStatus = "correct" | "accepted-regional-variant" | "review" | "substitution" | "omission" | "hesitation";

export interface TokenAlignment {
  id: string;
  token: string;
  index: number;
  status: AlignmentStatus;
  confidence: number;
  heardAs?: string;
  phoneticDisplay?: string;
  explanation?: string;
  startsAtMs?: number;
  endsAtMs?: number;
  scoreImpact: boolean;
  cueRecommendation?: string;
}

export interface ReadingMetrics { accuracyRate: number; wcpm: number; elapsedSeconds: number; }

export interface AlignmentRequest {
  sessionId: string;
  storyId: StoryId;
  targetText: string;
  localeProfile: AccentProfile;
  elapsedMs: number;
  isFinal: boolean;
  demoAttempt?: "standard" | "sounded-silent-k";
}

export interface AlignmentResponse {
  sessionId: string;
  localeProfile: AccentProfile;
  restraintApplied: boolean;
  lastConfirmedTokenIndex: number;
  tokens: TokenAlignment[];
  metrics: ReadingMetrics;
}

export type HesitationState = "idle" | "requesting-permission" | "listening" | "speaking" | "hesitating" | "prompting" | "finishing" | "complete" | "permission-denied" | "unsupported" | "error";

export interface ReadingSession {
  id: string;
  studentId: string;
  storyId: StoryId;
  localeProfile: AccentProfile;
  status: "ready" | "reading" | "complete";
  currentTokenIndex: number;
  alignment?: AlignmentResponse;
  earnedBadges: string[];
  startedAt?: string;
  completedAt?: string;
}

export interface OverrideEvent {
  id: string;
  sessionId: string;
  tokenId: string;
  previousStatus: AlignmentStatus;
  nextStatus: AlignmentStatus;
  actorLabel: string;
  reason: string;
  createdAt: string;
}

export interface StudentMetric { id: string; name: string; bookBand: "Gold" | "Silver" | "Bronze" | "Green"; accuracyRate: number; wcpm: number; }
export interface ReaderLeaderState { selectedStoryId: StoryId; session: ReadingSession; overrides: OverrideEvent[]; }
