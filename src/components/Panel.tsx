import type { ReactNode } from "react";

interface PanelProps {
  title: ReactNode;
  /** 제목 우측에 들어갈 액션 영역 (뷰 전환 토글, 추가 버튼 등) */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * 4사분면 각 영역을 감싸는 카드 컨테이너.
 * - 헤더(제목 + 액션)는 고정, 본문은 내부 스크롤.
 * - 모바일: 세로 스택의 한 섹션 / 데스크탑: 그리드 셀.
 */
export default function Panel({ title, action, children, className = "" }: PanelProps) {
  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-accent/15 bg-accent/[0.07] px-4 py-2.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          <span className="h-3.5 w-1 rounded-full bg-accent" />
          {title}
        </h2>
        {action}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
    </section>
  );
}
