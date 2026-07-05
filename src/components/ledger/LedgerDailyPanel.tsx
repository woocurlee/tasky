"use client";

import { useState } from "react";
import Panel from "@/components/Panel";
import { useApp } from "@/lib/context";
import { useLedger } from "@/lib/ledger/store";
import { parseISODate, WEEKDAY_LABELS } from "@/lib/date";
import { formatSigned, formatWonUnit } from "@/lib/money";
import type { Transaction, TxType } from "@/lib/types";

const CATEGORY_PRESETS: Record<TxType, string[]> = {
  expense: ["식비", "교통", "생활", "쇼핑", "문화", "의료", "고정비", "기타"],
  income: ["급여", "용돈", "부수입", "기타"],
};

// 1사분면 (우상): 선택한 날짜의 거래 목록 + 입력
export default function LedgerDailyPanel() {
  const { selectedDate } = useApp();
  const { transactions, deleteTransaction } = useLedger();

  const d = parseISODate(selectedDate);
  const dowLabel = WEEKDAY_LABELS[(d.getDay() + 6) % 7];
  const label = `${d.getMonth() + 1}월 ${d.getDate()}일 (${dowLabel})`;

  const items = transactions
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const dayIncome = items.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const dayExpense = items.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <Panel title={`가계부 · ${label}`}>
      <div className="flex flex-col gap-3">
        <AddTransactionForm date={selectedDate} />

        {/* 그날 합계 */}
        {items.length > 0 && (
          <div className="flex justify-end gap-3 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400">
              수입 {formatWonUnit(dayIncome)}
            </span>
            <span className="text-red-600 dark:text-red-400">지출 {formatWonUnit(dayExpense)}</span>
          </div>
        )}

        <div key={selectedDate} className="flex flex-col">
          {items.length === 0 ? (
            <p className="animate-fade-in py-6 text-center text-sm text-zinc-400">
              이 날짜의 거래가 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((t) => (
                <TxItem key={t.id} tx={t} onDelete={deleteTransaction} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </Panel>
  );
}

function TxItem({ tx, onDelete }: { tx: Transaction; onDelete: (id: string) => void }) {
  const income = tx.type === "income";
  return (
    <li className="group flex animate-fade-in items-center gap-2 py-1.5">
      <span
        className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${
          income
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
            : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
        }`}
      >
        {tx.category}
      </span>
      {tx.memo && <span className="min-w-0 truncate text-sm text-zinc-500">{tx.memo}</span>}
      <span
        className={`ml-auto shrink-0 text-sm font-semibold tabular-nums ${
          income ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
        }`}
      >
        {formatSigned(tx.amount, tx.type)}
      </span>
      <button
        type="button"
        onClick={() => onDelete(tx.id)}
        aria-label="삭제"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-300 transition hover:bg-red-50 hover:text-red-500 active:scale-90 dark:text-zinc-600 dark:hover:bg-red-950/40"
      >
        ×
      </button>
    </li>
  );
}

function AddTransactionForm({ date }: { date: string }) {
  const { addTransaction } = useLedger();
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [memo, setMemo] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (!value || value <= 0 || !category.trim()) return;
    addTransaction({ date, type, amount: value, category, memo });
    setAmount("");
    setCategory("");
    setMemo("");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-2.5 dark:border-zinc-800">
      {/* 지출/수입 토글 */}
      <div className="flex overflow-hidden rounded-md border border-zinc-200 text-sm dark:border-zinc-700">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-1 transition ${
              type === t
                ? t === "income"
                  ? "bg-emerald-500 text-white"
                  : "bg-red-500 text-white"
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {t === "income" ? "수입" : "지출"}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="numeric"
          placeholder="금액"
          className="min-w-0 flex-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-sm tabular-nums focus:border-accent focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          list="tx-categories"
          placeholder="카테고리"
          className="min-w-0 flex-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
        <datalist id="tx-categories">
          {CATEGORY_PRESETS[type].map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="flex gap-1.5">
        <input
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모 (선택)"
          className="min-w-0 flex-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:opacity-90 active:scale-95"
        >
          추가
        </button>
      </div>
    </form>
  );
}
