"use client";

import Panel from "@/components/Panel";
import { useApp } from "@/lib/context";
import { useLedger } from "@/lib/ledger/store";
import { parseISODate } from "@/lib/date";
import { formatWonUnit } from "@/lib/money";

// 3·4사분면 (하단 전체): 이번 달 수입/지출/잔액 요약 + 카테고리별 지출 집계
export default function LedgerSummaryPanel() {
  const { selectedDate } = useApp();
  const { transactions } = useLedger();

  const d = parseISODate(selectedDate);
  const monthKey = selectedDate.slice(0, 7); // YYYY-MM
  const monthLabel = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;

  const monthTx = transactions.filter((t) => t.date.startsWith(monthKey));
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  // 지출 카테고리별 집계 (내림차순)
  const byCategory = new Map<string, number>();
  for (const t of monthTx) {
    if (t.type !== "expense") continue;
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  }
  const breakdown = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);

  const title = (
    <span className="flex items-center gap-2">
      <span>이번 달 요약</span>
      <span className="text-xs font-normal text-zinc-400">{monthLabel}</span>
    </span>
  );

  return (
    <Panel title={title} className="lg:col-span-2">
      <div className="flex h-full flex-col gap-3 lg:flex-row">
        {/* 요약 3종 */}
        <div className="grid shrink-0 grid-cols-3 gap-2 lg:w-72 lg:grid-cols-1">
          <Stat label="수입" value={income} tone="income" />
          <Stat label="지출" value={expense} tone="expense" />
          <Stat label="잔액" value={balance} tone="balance" />
        </div>

        {/* 카테고리별 지출 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <p className="mb-1.5 text-xs font-medium text-zinc-400">카테고리별 지출</p>
          {breakdown.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-400">이번 달 지출 내역이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {breakdown.map(([cat, amount]) => {
                const pct = expense > 0 ? Math.round((amount / expense) * 100) : 0;
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

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "income" | "expense" | "balance";
}) {
  const color =
    tone === "income"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "expense"
        ? "text-red-600 dark:text-red-400"
        : value < 0
          ? "text-red-600 dark:text-red-400"
          : "text-zinc-800 dark:text-zinc-100";

  return (
    <div className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className={`text-sm font-bold tabular-nums sm:text-base ${color}`}>{formatWonUnit(value)}</p>
    </div>
  );
}
