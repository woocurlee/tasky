import CalendarPanel from "@/components/panels/CalendarPanel";
import DailyPanel from "@/components/panels/DailyPanel";
import WeeklyPanel from "@/components/panels/WeeklyPanel";
import { AppProvider } from "@/lib/context";
import { DataProvider } from "@/lib/data/store";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import PrivacyToggle from "@/components/PrivacyToggle";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/login/actions";

// DB를 매 요청 시 읽으므로 동적 렌더링
export const dynamic = "force-dynamic";

export default async function Home() {
  // 초기 데이터를 서버에서 DB로 읽어 SSR로 내려줌
  const [categories, todos] = await Promise.all([
    prisma.category.findMany(),
    prisma.todo.findMany(),
  ]);

  return (
    // 헤더의 PrivacyToggle이 컨텍스트를 쓰므로 Provider가 전체를 감싼다
    <AppProvider>
      <DataProvider initialCategories={categories} initialTodos={todos}>
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-accent/[0.10] via-zinc-50 to-zinc-50 dark:via-zinc-950 dark:to-zinc-950 lg:h-screen lg:min-h-0">
          {/* 상단 바 (로그아웃 등은 로그인 단계에서 추가) */}
          <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
            <span className="flex items-center gap-2 text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-accent text-sm text-accent-foreground shadow-sm">
                T
              </span>
              Tasky
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
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

          {/*
            4사분면 레이아웃
            - 모바일(기본): 세로 1열 스택 [캘린더 → Daily → 주간], 페이지 스크롤
            - lg 이상: 2열 그리드, 상단 행(2fr) 높게 / 하단 행(1fr) 낮게, 화면 채우고 패널 내부 스크롤
          */}
          <main className="flex flex-1 flex-col gap-3 p-3 lg:grid lg:grid-cols-2 lg:grid-rows-[2fr_1fr] lg:overflow-hidden">
            {/* 2사분면: 좌상 */}
            <CalendarPanel />
            {/* 1사분면: 우상 */}
            <DailyPanel />
            {/* 3·4사분면: 하단 전체 */}
            <WeeklyPanel />
          </main>
        </div>
      </DataProvider>
    </AppProvider>
  );
}
