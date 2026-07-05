"use client";

import { useState } from "react";
import Panel from "@/components/Panel";
import { useApp } from "@/lib/context";
import { useLedger } from "@/lib/ledger/store";
import { addDays, parseISODate, startOfWeek, toISODate, weekRangeLabel } from "@/lib/date";
import { formatWonUnit } from "@/lib/money";

type SummaryView = "month" | "week";

// 3·4사분면 (하단 전체): 주간/월간 총 지출 + 카테고리별 지출 집계
export default function LedgerSummaryPanel() {
  const { selectedDate } = useApp();
  const { transactions } = useLedger();
  const [view, setView] = useState<SummaryView>("month");

  const d = parseISODate(selectedDate);

  // 뷰에 따라 기간 필터 + 라벨
  let inRange: (date: string) => boolean;
  let periodLabel: string;
  if (view === "week") {
    const start = toISODate(startOfWeek(d));
    const end = toISODate(addDays(startOfWeek(d), 6));
    inRange = (date) => date >= start && date <= end; // YYYY-MM-DD 사전순 = 날짜순
    periodLabel = weekRangeLabel(d);
  } else {
    const monthKey = selectedDate.slice(0, 7); // YYYY-MM
    inRange = (date) => date.startsWith(monthKey);
    periodLabel = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
  }

  const periodTx = transactions.filter((t) => t.type === "expense" && inRange(t.date));
  const total = periodTx.reduce((s, t) => s + t.amount, 0);

  // 카테고리별 집계 (내림차순)
  const byCategory = new Map<string, number>();
  for (const t of periodTx) {
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  }
  const breakdown = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  const unit = view === "week" ? "주" : "달";
  const title = (
    <span className="flex items-center gap-2">
      <span>{`이번 ${unit} 지출`}</span>
      <span className="text-xs font-normal text-zinc-400">{periodLabel}</span>
    </span>
  );

  return (
    <Panel title={title} action={<ViewToggle view={view} onChange={setView} />} className="lg:col-span-2">
      <div className="flex h-full flex-col gap-3 lg:flex-row">
        {/* 총 지출 */}
        <div className="shrink-0 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800 lg:w-56">
          <p className="text-xs text-zinc-400">총 지출</p>
          <p className="text-lg font-bold tabular-nums text-zinc-800 dark:text-zinc-100">
            {formatWonUnit(total)}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">{`이번 ${unit} ${periodTx.length}건`}</p>
        </div>

        {/* 카테고리별 지출 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="mb-1.5 text-xs font-medium text-zinc-400">카테고리별 지출</p>
          {breakdown.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-400">{`이번 ${unit} 지출 내역이 없습니다.`}</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {breakdown.map(([cat, amount]) => {
                const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                return (
                  <li key={cat} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 truncate text-sm text-zinc-600 dark:text-zinc-300">
                      {cat}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs tabular-nums text-zinc-400">
                      {pct}%
                    </span>
                    <span className="w-24 shrink-0 text-right text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                      {formatWonUnit(amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
}

function ViewToggle({ view, onChange }: { view: SummaryView; onChange: (v: SummaryView) => void }) {
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
          {v === "week" ? "주간" : "월간"}
        </button>
      ))}
    </div>
  );
}
