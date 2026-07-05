"use client";

import { useApp } from "@/lib/context";
import { useData } from "@/lib/data/store";

// 헤더의 '비공개 보기' 토글. 기본은 숨김(revealPrivate=false), 누르면 세션 동안만 표시.
export default function PrivacyToggle() {
  const { revealPrivate, toggleRevealPrivate, mode } = useApp();
  const { categories } = useData();
  const privateCount = categories.filter((c) => c.private).length;

  // 비공개는 할일(카테고리) 전용 — 가계부 모드에선 숨김
  if (mode === "ledger") return null;

  return (
    <button
      type="button"
      onClick={toggleRevealPrivate}
      aria-pressed={revealPrivate}
      title={revealPrivate ? "비공개 숨기기" : "비공개 보기"}
      className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition active:scale-95 ${
        revealPrivate
          ? "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-300"
          : "border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
      }`}
    >
      {revealPrivate ? <EyeIcon /> : <LockIcon />}
      <span className="hidden sm:inline">{revealPrivate ? "비공개 표시 중" : "비공개"}</span>
      {!revealPrivate && privateCount > 0 && (
        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-200 px-1 text-[10px] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
          {privateCount}
        </span>
      )}
    </button>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
