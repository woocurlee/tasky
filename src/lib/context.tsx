"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { today, toISODate } from "@/lib/date";

interface AppState {
  /** 현재 선택된 날짜 (YYYY-MM-DD). 캘린더 ↔ Daily 할일 연동 기준 */
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  /** 비공개 카테고리 표시 여부. 저장하지 않으므로 새로고침 시 항상 false(숨김)로 시작 */
  revealPrivate: boolean;
  toggleRevealPrivate: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string>(() => toISODate(today()));
  const [revealPrivate, setRevealPrivate] = useState(false);

  return (
    <AppContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        revealPrivate,
        toggleRevealPrivate: () => setRevealPrivate((v) => !v),
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
