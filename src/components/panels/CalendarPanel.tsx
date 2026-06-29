"use client";

import { useState } from "react";
import Panel from "@/components/Panel";
import { useApp } from "@/lib/context";
import {
  WEEKDAY_LABELS,
  addDays,
  addMonths,
  getMonthGrid,
  getWeekDays,
  isSameDay,
  isSameMonth,
  monthLabel,
  parseISODate,
  startOfWeek,
  today,
  toISODate,
  weekRangeLabel,
} from "@/lib/date";

type ViewMode = "month" | "week";

// 2사분면 (좌상): 캘린더 뷰 — 주/월 전환, 오늘 강조, 이전/다음 이동, 날짜 클릭 시 연동
export default function CalendarPanel() {
  const { selectedDate, setSelectedDate } = useApp();
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState<Date>(() => today());

  const selected = parseISODate(selectedDate);
  const now = today();

  const days =
    view === "month" ? getMonthGrid(anchor.getFullYear(), anchor.getMonth()) : getWeekDays(anchor);

  const goPrev = () => setAnchor((a) => (view === "month" ? addMonths(a, -1) : addDays(a, -7)));
  const goNext = () => setAnchor((a) => (view === "month" ? addMonths(a, 1) : addDays(a, 7)));
  const goToday = () => {
    setAnchor(now);
    setSelectedDate(toISODate(now));
  };

  const handlePick = (d: Date) => {
    setSelectedDate(toISODate(d));
    setAnchor(d); // 다른 달/주의 날짜를 누르면 그쪽으로 이동
  };

  return (
    <Panel title="캘린더" action={<ViewToggle view={view} onChange={setView} />}>
      <div className="flex h-full flex-col gap-2">
        {/* 이동 + 기간 라벨 */}
        <div className="flex shrink-0 items-center justify-between gap-1">
          <NavButton label="이전" onClick={goPrev}>
            ‹
          </NavButton>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {view === "month" ? monthLabel(anchor) : weekRangeLabel(anchor)}
            </span>
            <button
              type="button"
              onClick={goToday}
              className="rounded-md border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 transition hover:bg-zinc-100 active:scale-95 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              오늘
            </button>
          </div>
          <NavButton label="다음" onClick={goNext}>
            ›
          </NavButton>
        </div>

        {/* 요일 헤더 */}
        <div className="grid shrink-0 grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((w, i) => (
            <div
              key={w}
              className={`text-center text-xs font-medium ${
                i === 6 ? "text-red-400" : i === 5 ? "text-blue-400" : "text-zinc-400"
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 (기간이 바뀌면 remount되며 fade 전환) */}
        <div
          key={
            view === "month"
              ? `m-${anchor.getFullYear()}-${anchor.getMonth()}`
              : `w-${toISODate(startOfWeek(anchor))}`
          }
          className={`grid flex-1 animate-fade-in grid-cols-7 gap-1 ${
            view === "month" ? "lg:auto-rows-fr" : "items-stretch"
          }`}
        >
          {days.map((d) => {
            const inMonth = view === "week" || isSameMonth(d, anchor);
            const isToday = isSameDay(d, now);
            const isSelected = isSameDay(d, selected);
            const dow = d.getDay(); // 0=일, 6=토

            return (
              <button
                key={toISODate(d)}
                type="button"
                onClick={() => handlePick(d)}
                className={[
                  "flex items-center justify-center rounded-md text-sm transition active:scale-95",
                  view === "month" ? "min-h-10" : "min-h-16",
                  isSelected
                    ? "bg-accent font-semibold text-accent-foreground shadow-sm"
                    : isToday
                      ? "font-bold ring-1 ring-inset ring-accent/50 hover:bg-accent/10"
                      : "hover:bg-accent/10",
                  !isSelected && !inMonth ? "text-zinc-300 dark:text-zinc-600" : "",
                  !isSelected && inMonth && dow === 0 ? "text-red-500" : "",
                  !isSelected && inMonth && dow === 6 ? "text-blue-500" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-zinc-200 text-xs dark:border-zinc-700">
      {(["week", "month"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`px-2.5 py-1 transition active:scale-95 ${
            view === v
              ? "bg-accent text-accent-foreground"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {v === "week" ? "주" : "월"}
        </button>
      ))}
    </div>
  );
}

function NavButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-zinc-500 transition hover:bg-zinc-100 active:scale-90 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {children}
    </button>
  );
}
