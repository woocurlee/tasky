"use client";

import { useApp } from "@/lib/context";
import CalendarPanel from "@/components/panels/CalendarPanel";
import DailyPanel from "@/components/panels/DailyPanel";
import WeeklyPanel from "@/components/panels/WeeklyPanel";
import LedgerDailyPanel from "@/components/ledger/LedgerDailyPanel";
import LedgerSummaryPanel from "@/components/ledger/LedgerSummaryPanel";

// 모드에 따라 4사분면의 우상/하단 패널을 교체 (캘린더는 공용)
export default function Dashboard() {
  const { mode } = useApp();
  const ledger = mode === "ledger";

  return (
    <main className="flex flex-1 flex-col gap-3 p-3 lg:grid lg:grid-cols-2 lg:grid-rows-[2fr_1fr] lg:overflow-hidden">
      {/* 2사분면: 좌상 — 캘린더 (공용) */}
      <CalendarPanel />
      {/* 1사분면: 우상 */}
      {ledger ? <LedgerDailyPanel /> : <DailyPanel />}
      {/* 3·4사분면: 하단 전체 */}
      {ledger ? <LedgerSummaryPanel /> : <WeeklyPanel />}
    </main>
  );
}
