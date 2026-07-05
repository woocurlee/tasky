"use client";

import { useApp } from "@/lib/context";

// 헤더의 할일/가계부 모드 전환 토글
export default function ModeToggle() {
  const { mode, setMode } = useApp();

  return (
    <div className="flex shrink-0 overflow-hidden rounded-md border border-zinc-200 text-xs font-medium dark:border-zinc-700">
      {(["tasky", "ledger"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          aria-pressed={mode === m}
          className={`whitespace-nowrap px-2.5 py-1 transition active:scale-95 ${
            mode === m
              ? "bg-accent text-accent-foreground"
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          {m === "tasky" ? "할일" : "가계부"}
        </button>
      ))}
    </div>
  );
}
