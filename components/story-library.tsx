"use client";

/* Reference-led rule: the library follows the supplied portrait rails, bold band labels, soft white story cards, and large rounded child-readable type. */
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft } from "lucide-react";
import { useReaderSession } from "@/app/providers";
import { STORIES } from "@/lib/seed";
import type { BookBandId, Story } from "@/lib/domain";

const bands: Array<{ id: BookBandId; label: string; colour: string; focusColour: string }> = [
  { id: "pink", label: "Level 1: Pink Band", colour: "var(--reader-pink)", focusColour: "#91dcef" },
  { id: "red", label: "Level 2: Red Band", colour: "#ff3b30", focusColour: "var(--reader-green)" },
  { id: "yellow", label: "Level 3: Yellow Band", colour: "var(--reader-yellow)", focusColour: "#ff9818" },
];

function StoryCard({ story, focusColour }: { story: Story; focusColour: string }) {
  const router = useRouter();
  const { selectStory } = useReaderSession();

  function openStory() {
    selectStory(story.id);
    router.push("/read");
  }

  return (
    <button className="student-card pressable flex w-[218px] shrink-0 flex-col items-center overflow-hidden px-4 pb-4 pt-5 text-center sm:w-[236px]" onClick={openStory} type="button">
      <span className="grid h-40 w-full place-items-center" aria-hidden="true">
        {story.imageUrl ? (
          <Image alt="" className="h-40 w-full object-contain" height={160} src={story.imageUrl} unoptimized width={180} />
        ) : (
          <span className="grid size-28 place-items-center rounded-full bg-[var(--reader-cream)] text-[var(--reader-gold)]"><BookOpen className="size-16" strokeWidth={1.8} /></span>
        )}
      </span>
      <span className="mt-2 text-[1.72rem] leading-tight font-black text-black">{story.title}</span>
      <span className="mt-3 rounded-full px-3 py-1.5 text-[0.95rem] leading-none font-extrabold text-white" style={{ backgroundColor: focusColour, color: story.band === "pink" ? "#062333" : "white" }}>
        Focus: {story.focus}
      </span>
    </button>
  );
}

export function StoryLibrary() {
  return (
    <main className="student-canvas overflow-hidden pb-16">
      <div className="mx-auto max-w-[860px]">
        <header className="relative px-5 pb-5 pt-10 sm:px-10">
          <button aria-label="Go back" className="pressable absolute left-4 top-9 text-[var(--reader-teal)] sm:left-8" onClick={() => window.history.back()} type="button">
            <ChevronLeft className="size-14" strokeWidth={2.3} />
          </button>
          <h1 className="text-center text-[2.65rem] leading-tight font-black tracking-[-0.04em] text-[var(--reader-teal)] sm:text-[3.3rem]">Choose Your Story</h1>
        </header>

        <div className="space-y-12 pt-6 sm:space-y-14">
          {bands.map((band) => (
            <section key={band.id} aria-labelledby={`band-${band.id}`}>
              <h2 className="ml-10 inline-flex rounded-full px-4 py-1.5 text-[1.55rem] leading-none font-black text-white shadow-sm sm:ml-12 sm:text-[1.8rem]" id={`band-${band.id}`} style={{ backgroundColor: band.colour, color: band.id === "yellow" ? "black" : "white" }}>
                {band.label}
              </h2>
              <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto px-10 pb-4 sm:gap-5 sm:px-12">
                {STORIES.filter((story) => story.band === band.id).map((story) => <StoryCard focusColour={band.focusColour} key={story.id} story={story} />)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
