"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tasky:accent";

// 스위처에 표시할 테마들 (swatch 색은 globals.css의 --accent와 일치)
const THEMES = [
  { key: "indigo", color: "#4f46e5", label: "인디고" },
  { key: "violet", color: "#7c3aed", label: "바이올렛" },
  { key: "emerald", color: "#059669", label: "에메랄드" },
  { key: "blue", color: "#2563eb", label: "블루" },
  { key: "rose", color: "#e11d48", label: "로즈" },
  { key: "amber", color: "#d97706", label: "앰버" },
  { key: "mono", color: "#3f3f46", label: "모노" },
] as const;

export default function ThemeSwitcher() {
  // null = 아직 미확정 (SSR/첫 렌더). 마운트 후 DOM(인라인 스크립트가 적용)에서 읽는다.
  const [accent, setAccent] = useState<string | null>(null);

  // 마운트 시 현재 적용된 테마 동기화
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setAccent(document.documentElement.dataset.accent || "indigo");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // accent 변경 시 <html data-accent> 반영 (DOM 변경은 effect에서)
  useEffect(() => {
    if (accent === null) return;
    if (accent === "indigo") {
      delete document.documentElement.dataset.accent;
    } else {
      document.documentElement.dataset.accent = accent;
    }
  }, [accent]);

  const pick = (key: string) => {
    setAccent(key);
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {
      // 저장 실패는 무시
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {THEMES.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => pick(t.key)}
          aria-label={`${t.label} 테마`}
          title={t.label}
          className={`h-4 w-4 rounded-full transition-transform hover:scale-110 active:scale-90 ${
            accent === t.key
              ? "ring-2 ring-zinc-400 ring-offset-2 ring-offset-white dark:ring-zinc-500 dark:ring-offset-zinc-900"
              : ""
          }`}
          style={{ backgroundColor: t.color }}
        />
      ))}
    </div>
  );
}
