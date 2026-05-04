"use client";

interface TutorialResultProps {
  variant: "success" | "failure";
  message: string;
  onRetry?: () => void;
  onNextLesson?: () => void;
  canAdvance: boolean;
}

export function TutorialResult({
  variant,
  message,
  onRetry,
  onNextLesson,
  canAdvance,
}: TutorialResultProps) {
  const isSuccess = variant === "success";

  return (
    <section
      role="status"
      aria-live="polite"
      className={[
        "rounded-xl border p-4 shadow-md backdrop-blur-md md:p-5",
        isSuccess
          ? "border-emerald-800/60 bg-emerald-950/35 text-emerald-100"
          : "border-red-900/50 bg-red-950/30 text-red-100",
      ].join(" ")}
    >
      <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
        {isSuccess ? "Lesson cleared" : "Try again"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed">{message}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {!isSuccess && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-100 hover:border-amber-500/50"
          >
            Retry
          </button>
        ) : null}
        {isSuccess && canAdvance && onNextLesson ? (
          <button
            type="button"
            onClick={onNextLesson}
            className="rounded-lg border border-amber-700/60 bg-amber-950/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-50 hover:border-amber-500/60"
          >
            Next lesson
          </button>
        ) : null}
        {isSuccess && !canAdvance ? (
          <p className="text-xs text-emerald-200/80">
            You have completed all tutorial lessons.
          </p>
        ) : null}
      </div>
    </section>
  );
}
