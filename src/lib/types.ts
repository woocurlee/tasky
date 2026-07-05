// 데이터 모델 — 2단계 Prisma 스키마와 동일 구조로 유지한다.
// (mock → DB 교체 시 이 타입을 그대로 재사용)

export interface Category {
  id: string;
  name: string;
  /** 비공개 카테고리 — '비공개 보기'가 꺼져 있으면 이름까지 통째로 숨김 */
  private: boolean;
}

export interface Todo {
  id: string;
  title: string;
  done: boolean;
  /** Daily 할일: 해당 날짜 (YYYY-MM-DD). 주간 할일이면 null */
  date: string | null;
  /** 주간 할일: 그 주의 시작일 (월요일, YYYY-MM-DD). Daily면 null */
  weekStart: string | null;
  /** Daily 할일이 속한 카테고리. 주간 할일이면 null */
  categoryId: string | null;
  /** 같은 리스트(날짜+카테고리 또는 주) 안에서의 정렬 순서 (오름차순) */
  order: number;
}

export type TxType = "income" | "expense";

/** 가계부 거래 */
export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TxType;
  amount: number; // 원 단위 (양수)
  category: string;
  memo: string | null;
  createdAt: string; // ISO
}
