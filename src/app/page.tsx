import { cookies } from "next/headers";
import { AppProvider, type AppMode } from "@/lib/context";
import { DataProvider } from "@/lib/data/store";
import { LedgerProvider } from "@/lib/ledger/store";
import Dashboard from "@/components/Dashboard";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import PrivacyToggle from "@/components/PrivacyToggle";
import ModeToggle from "@/components/ModeToggle";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/login/actions";
import type { Transaction, TxType } from "@/lib/types";

// DB를 매 요청 시 읽으므로 동적 렌더링
export const dynamic = "force-dynamic";

export default async function Home() {
  // 초기 데이터를 서버에서 DB로 읽어 SSR로 내려줌
  const [categories, todos, txRows] = await Promise.all([
    prisma.category.findMany(),
    prisma.todo.findMany(),
    prisma.transaction.findMany(),
  ]);

  // Prisma 거래 → 앱 타입(createdAt ISO 문자열, type 좁히기)
  const transactions: Transaction[] = txRows.map((t) => ({
    id: t.id,
    date: t.date,
    type: t.type as TxType,
    amount: t.amount,
    category: t.category,
    memo: t.memo,
    createdAt: t.createdAt.toISOString(),
  }));

  // 모드는 쿠키로 유지 (SSR에서 읽어 깜빡임 없이 올바른 화면 렌더)
  const cookieStore = await cookies();
  const initialMode: AppMode = cookieStore.get("tasky_mode")?.value === "ledger" ? "ledger" : "tasky";

  return (
    // 헤더의 컨트롤들이 컨텍스트를 쓰므로 Provider가 전체를 감싼다
    <AppProvider initialMode={initialMode}>
      <DataProvider initialCategories={categories} initialTodos={todos}>
        <LedgerProvider initialTransactions={transactions}>
          <div className="flex min-h-screen flex-col bg-gradient-to-br from-accent/[0.10] via-zinc-50 to-zinc-50 dark:via-zinc-950 dark:to-zinc-950 lg:h-screen lg:min-h-0">
            <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
              <span className="flex items-center gap-2 text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-accent text-sm text-accent-foreground shadow-sm">
                  T
                </span>
                <span className="hidden sm:inline">Tasky</span>
              </span>
              <div className="flex items-center gap-2 sm:gap-3">
                <ModeToggle />
                <PrivacyToggle />
                <ThemeSwitcher />
                <form action={logout} className="shrink-0">
                  <button
                    type="submit"
                    title="로그아웃"
                    className="whitespace-nowrap rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-100 active:scale-95 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    로그아웃
                  </button>
                </form>
              </div>
            </header>

            {/* 4사분면 레이아웃 (모드에 따라 우상/하단 패널 교체) */}
            <Dashboard />
          </div>
        </LedgerProvider>
      </DataProvider>
    </AppProvider>
  );
}
