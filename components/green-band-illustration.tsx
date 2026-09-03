/* Reference-led rule: Level 5 artwork uses warm, friendly workbook vectors with bold outlines and simple child-readable silhouettes. */
import type { StoryId } from "@/lib/domain";

type GreenStoryId = Extract<StoryId, "brave-knight" | "lost-shield" | "kings-ring">;

export function GreenBandIllustration({ storyId }: { storyId: GreenStoryId }) {
  if (storyId === "brave-knight") {
    return (
      <svg aria-hidden="true" className="h-40 w-full" viewBox="0 0 190 160">
        <ellipse cx="96" cy="146" fill="#e7ddd0" rx="62" ry="9" />
        <path d="M88 39c-17-17 1-34 18-26-1 12-5 22-18 26Z" fill="#31a0a2" stroke="#173c50" strokeLinejoin="round" strokeWidth="4" />
        <path d="M75 38h43l14 28-8 57H67l-8-57 16-28Z" fill="#e5a93c" stroke="#173c50" strokeLinejoin="round" strokeWidth="5" />
        <path d="M65 65h62v25c-11 12-21 18-31 18S76 102 65 90V65Z" fill="#d9eef0" stroke="#173c50" strokeWidth="4" />
        <path d="M68 66h55M87 66v24M104 66v24" fill="none" stroke="#173c50" strokeLinecap="round" strokeWidth="4" />
        <circle cx="86" cy="95" fill="#173c50" r="3" /><circle cx="106" cy="95" fill="#173c50" r="3" />
        <path d="M88 102c5 4 11 4 16 0" fill="none" stroke="#c65b4b" strokeLinecap="round" strokeWidth="3" />
        <path d="M70 122h52l13 22H57l13-22Z" fill="#2f9396" stroke="#173c50" strokeLinejoin="round" strokeWidth="5" />
        <circle cx="96" cy="132" fill="#ffe19a" r="7" stroke="#173c50" strokeWidth="3" />
      </svg>
    );
  }

  if (storyId === "lost-shield") {
    return (
      <svg aria-hidden="true" className="h-40 w-full" viewBox="0 0 190 160">
        <ellipse cx="96" cy="146" fill="#e7ddd0" rx="67" ry="9" />
        <path d="M34 70h81v67H34V70Z" fill="#9ed8de" stroke="#173c50" strokeWidth="4" />
        <path d="M28 68h94l-12-18-16 10-16-19-15 19-17-10-18 18Z" fill="#65bdc3" stroke="#173c50" strokeLinejoin="round" strokeWidth="4" />
        <path d="M47 84h18v20H47zM84 84h18v20H84z" fill="#fff8e8" stroke="#173c50" strokeWidth="3" />
        <path d="M66 137v-20c0-11 10-19 20-19s20 8 20 19v20" fill="#fff8e8" stroke="#173c50" strokeWidth="4" />
        <path d="M112 63c21 2 37 10 48 20v30c0 20-18 31-37 37-19-6-37-17-37-37V83c7-8 16-15 26-20Z" fill="#e5a93c" stroke="#173c50" strokeLinejoin="round" strokeWidth="5" />
        <path d="m101 101 13 13 29-31" fill="none" stroke="#fff8e8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-40 w-full" viewBox="0 0 190 160">
      <ellipse cx="96" cy="146" fill="#d8ebc6" rx="68" ry="9" />
      <path d="M43 105c20-10 88-10 106 0l-9 37H51l-8-37Z" fill="#69ae55" stroke="#173c50" strokeLinejoin="round" strokeWidth="4" />
      <path d="M57 50 75 69l21-35 22 35 18-19 8 54H49l8-54Z" fill="#ffd451" stroke="#173c50" strokeLinejoin="round" strokeWidth="5" />
      <circle cx="58" cy="49" fill="#f17d4b" r="6" stroke="#173c50" strokeWidth="3" /><circle cx="96" cy="32" fill="#f17d4b" r="6" stroke="#173c50" strokeWidth="3" /><circle cx="136" cy="49" fill="#f17d4b" r="6" stroke="#173c50" strokeWidth="3" />
      <path d="M60 88h73" stroke="#e5a93c" strokeLinecap="round" strokeWidth="6" />
      <ellipse cx="103" cy="111" fill="#fff4bd" rx="25" ry="15" stroke="#173c50" strokeWidth="5" />
      <ellipse cx="103" cy="111" fill="#65bdc3" rx="12" ry="7" stroke="#173c50" strokeWidth="3" />
      <path d="M70 124c-7 2-13 7-17 14M136 123c8 3 14 8 18 15" fill="none" stroke="#326d3f" strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}
