"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { today, toISODate } from "@/lib/date";

export type AppMode = "tasky" | "ledger";
export const MODE_COOKIE = "tasky_mode";

interface AppState {
  /** 현재 선택된 날짜 (YYYY-MM-DD). 캘린더 ↔ Daily/가계부 연동 기준 */
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  /** 비공개 카테고리 표시 여부. 저장하지 않으므로 새로고침 시 항상 false(숨김)로 시작 */
  revealPrivate: boolean;
  toggleRevealPrivate: () => void;
  /** 화면 모드: 할일(tasky) / 가계부(ledger). 쿠키로 유지 */
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({
  initialMode = "tasky",
  children,
}: {
  initialMode?: AppMode;
  children: ReactNode;
}) {
  const [selectedDate, setSelectedDate] = useState<string>(() => toISODate(today()));
  const [revealPrivate, setRevealPrivate] = useState(false);
  const [mode, setModeState] = useState<AppMode>(initialMode);

  const setMode = (m: AppMode) => {
    setModeState(m);
    // 서버가 SSR 시 읽을 수 있게 쿠키에 저장 (새로고침해도 유지, 깜빡임 없음)
    document.cookie = `${MODE_COOKIE}=${m}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  return (
    <AppContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        revealPrivate,
        toggleRevealPrivate: () => setRevealPrivate((v) => !v),
        mode,
        setMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
