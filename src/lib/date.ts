// 날짜 유틸 — 외부 라이브러리 없이 로컬 타임존 기준으로 처리한다.
// 주(週)의 시작은 월요일로 통일 (주간 할일 weekStart와 일치).

/** Date → "YYYY-MM-DD" (로컬 기준, UTC 변환 없음) */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM-DD" → 로컬 자정 Date */
export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** 오늘 (로컬 자정) */
export function today(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
}

/** 그 주의 월요일 (로컬 자정) */
export function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=일 ... 6=토
  const diff = (day + 6) % 7; // 월요일까지 며칠 전인지
  return addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -diff);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** 월 뷰 그리드: 해당 월을 포함하는 6주(42칸) 날짜 배열 (월요일 시작) */
export function getMonthGrid(year: number, monthIndex: number): Date[] {
  const first = new Date(year, monthIndex, 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** 주 뷰: anchor가 속한 주의 7일 (월~일) */
export function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthLabel(d: Date): string {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

/** 주 범위 라벨: "6/23 ~ 6/29" */
export function weekRangeLabel(anchor: Date): string {
  const start = startOfWeek(anchor);
  const end = addDays(start, 6);
  return `${start.getMonth() + 1}/${start.getDate()} ~ ${end.getMonth() + 1}/${end.getDate()}`;
}

/** 월요일 시작 요일 헤더 */
export const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;
