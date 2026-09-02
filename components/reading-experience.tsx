"use client";

/* Reference-led rule: the reading canvas retains one dominant sentence, a thumb-zone microphone, and restrained amber support rather than punitive feedback. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowBigLeft, ArrowBigRight, LoaderCircle, Mic, Square } from "lucide-react";
import { StudentTopBar } from "@/components/student-top-bar";
import { useReaderSession } from "@/app/providers";
import { useHesitationFSM } from "@/hooks/use-hesitation-fsm";
import { alignSpeech } from "@/lib/speech-alignment-client";

function stripPunctuation(token: string) {
  return token.toLowerCase().replace(/[^a-z']/g, "");
}

function phoneticCue(token: string): string {
  const word = stripPunctuation(token);
  const cues: Record<string, string> = {
    cat: "c · a · t",
    knight: "The k is silent: /n-aɪ-t/",
    night: "n · igh · t",
    horse: "h · or · se",
  };
  return cues[word] ?? word.split("").join(" · ");
}

export function ReadingExperience() {
  const router = useRouter();
  const { state, startReading, setCurrentToken, beginAlignment, completeReading } = useReaderSession();
  const audio = useHesitationFSM();
  const [alignmentError, setAlignmentError] = useState<string | null>(null);
  const story = state.session.storySnapshot;
  const words = story.targetText.split(/\s+/);
  const currentIndex = Math.min(state.session.currentTokenIndex, words.length - 1);
  const showHighlight = audio.phase === "hesitating" || audio.phase === "prompting";
  const busy = audio.phase === "requesting-permission" || audio.phase === "finishing" || state.session.status === "aligning";

  async function startMicrophone() {
    const started = await audio.start();
    if (started) startReading();
  }

  async function finishReading() {
    if (busy) return;
    setAlignmentError(null);
    try {
      const capture = audio.isActive ? await audio.finish() : { blob: null, elapsedMs: Math.max(state.session.elapsedMs, 5_000) };
      beginAlignment(capture.elapsedMs);
      const alignment = await alignSpeech({
        sessionId: state.session.id,
        storyId: story.id,
        targetText: story.targetText,
        localeProfile: state.session.localeProfile,
        elapsedMs: capture.elapsedMs,
        isFinal: true,
        currentTokenIndex: currentIndex,
        demoAttempt: story.id === "brave-knight" ? "sounded-silent-k" : "standard",
      }, capture.blob);
      completeReading(alignment, capture.elapsedMs);
      router.push("/celebrate");
    } catch {
      setAlignmentError("We could not make the running record. Please try finishing again.");
    }
  }

  function moveBack() {
    setCurrentToken(Math.max(0, currentIndex - 1));
  }

  const statusText = alignmentError
    ?? audio.errorMessage
    ?? (audio.phase === "requesting-permission"
      ? "Asking for microphone permission…"
      : audio.phase === "speaking"
        ? "Listening carefully…"
        : audio.phase === "hesitating"
          ? "Take your time."
          : audio.phase === "prompting"
            ? "Here is a little sound clue."
            : audio.isActive
              ? "Read the sentence aloud."
              : "Tap the microphone when you are ready.");

  return (
    <main className="student-canvas flex flex-col pb-10">
      <StudentTopBar />
      <section className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-between px-9 pb-5 pt-28 sm:px-12">
        <div className="student-card relative grid min-h-[470px] place-items-center overflow-visible px-8 py-12 text-center sm:px-16">
          <p className="font-[var(--font-reading)] text-[4rem] leading-[1.22] font-semibold tracking-[-0.045em] text-[var(--reader-teal)] sm:text-[5rem]">
            {words.map((word, index) => (
              <span key={`${word}-${index}`}>
                <span className={showHighlight && index === currentIndex ? "rounded-xl bg-[#E5A93C] px-1 text-white" : ""}>{word}</span>{index < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
          {audio.phase === "prompting" && (
            <p className="absolute -bottom-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border-4 border-white bg-[#fff0c8] px-5 py-2 text-lg font-black text-[var(--reader-gold-deep)] shadow-lg" role="status">
              {phoneticCue(words[currentIndex])}
            </p>
          )}
        </div>

        <div className="mt-24">
          <div className="flex items-center justify-between gap-5">
            <button aria-label="Previous target word" className="pressable text-[var(--reader-teal)]" onClick={moveBack} type="button">
              <ArrowBigLeft className="size-24 fill-current stroke-[var(--reader-gold)] stroke-[3] sm:size-28" />
            </button>
            <button
              aria-label={audio.isActive ? "Stop recording and finish" : "Start microphone"}
              className={`microphone-control pressable relative grid size-32 shrink-0 place-items-center rounded-full text-white sm:size-36 ${audio.isActive ? "is-listening bg-[#68d0a0]" : "bg-[var(--reader-teal)]"}`}
              disabled={busy}
              onClick={audio.isActive ? finishReading : startMicrophone}
              type="button"
            >
              <span className="microphone-wave wave-one" /><span className="microphone-wave wave-two" />
              {busy ? <LoaderCircle className="size-16 animate-spin" /> : audio.isActive ? <Square className="size-12 fill-current" /> : <Mic className="size-16" strokeWidth={2.3} />}
            </button>
            <button aria-label="Finish this reading" className="pressable text-[var(--reader-teal)]" disabled={busy} onClick={finishReading} type="button">
              <ArrowBigRight className="size-24 fill-current stroke-[var(--reader-gold)] stroke-[3] sm:size-28" />
            </button>
          </div>
          <p aria-live="polite" className={`mx-auto mt-12 max-w-lg text-center text-lg font-black ${alignmentError || audio.errorMessage ? "text-[var(--reader-red)]" : "text-[var(--reader-teal-deep)]"}`}>{statusText}</p>
        </div>
      </section>
    </main>
  );
}
