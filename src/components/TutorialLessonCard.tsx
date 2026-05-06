"use client";

import { useI18n } from "@/i18n/useI18n";

interface TutorialLessonCardProps {
  lessonNumber: number;
  totalLessons: number;
  title: string;
  objective: string;
  explanation: string;
  footerHint: string;
}

export function TutorialLessonCard({
  lessonNumber,
  totalLessons,
  title,
  objective,
  explanation,
  footerHint,
}: TutorialLessonCardProps) {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl border border-slate-800/90 bg-slate-950/55 p-5 shadow-xl backdrop-blur-md md:p-7">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-amber-600/90">
        {t("tutorial.interactive")}
      </p>
      <p className="mt-2 text-xs tabular-nums text-slate-500">
        {t("tutorial.lessonProgress", {
          current: lessonNumber,
          total: totalLessons,
        })}
      </p>
      <h1 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-sm font-semibold text-amber-200/90">{objective}</p>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">{explanation}</p>
      <p className="mt-5 border-t border-slate-800/80 pt-4 text-xs leading-relaxed text-slate-500">
        {footerHint}
      </p>
    </section>
  );
}
