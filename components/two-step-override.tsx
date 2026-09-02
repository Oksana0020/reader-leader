"use client";

/* Educator judgement rule: professional overrides require a visible arm step before a second, auditable confirmation click. */
import { useEffect, useRef, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";

export function TwoStepOverride({
  accepted,
  onConfirm,
}: {
  accepted: boolean;
  onConfirm: () => void;
}) {
  const [armed, setArmed] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setArmed(false);
    }
    function handlePointerDown(event: PointerEvent) {
      if (armed && wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setArmed(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [armed]);

  function handlePrimaryClick() {
    if (accepted) return;
    if (!armed) {
      setArmed(true);
      return;
    }
    onConfirm();
    setArmed(false);
  }

  return (
    <div className="mt-4" ref={wrapperRef}>
      <button
        aria-describedby={armed ? "override-confirmation-help" : undefined}
        className={`pressable flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-black text-white ${accepted ? "bg-emerald-600" : armed ? "bg-[var(--reader-gold-deep)]" : "bg-[var(--reader-teal)]"}`}
        disabled={accepted}
        onClick={handlePrimaryClick}
        type="button"
      >
        {accepted ? <Check className="size-5" /> : <ShieldCheck className="size-5" />}
        {accepted ? "Accepted by Educator" : armed ? "Accept Pronunciation" : "Review Override"}
      </button>
      {armed && (
        <div className="mt-3 flex items-start gap-3 rounded-xl bg-[#fff5d9] p-3 text-sm text-[#6f4b00]" id="override-confirmation-help" role="status">
          <p className="flex-1"><strong>Click again to confirm.</strong> This records an educator decision, removes the provisional flag, and preserves the AI restraint taxonomy.</p>
          <button aria-label="Cancel override" className="pressable rounded-md p-1" onClick={() => setArmed(false)} type="button"><X className="size-5" /></button>
        </div>
      )}
    </div>
  );
}
