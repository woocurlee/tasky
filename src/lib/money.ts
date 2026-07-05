// 원 단위 금액 포맷 헬퍼

/** 12000 → "12,000" */
export function formatWon(amount: number): string {
  return amount.toLocaleString("ko-KR");
}

/** 12000 → "12,000원" */
export function formatWonUnit(amount: number): string {
  return `${formatWon(amount)}원`;
}

/** 부호 포함: 수입 +, 지출 - */
export function formatSigned(amount: number, type: "income" | "expense"): string {
  const sign = type === "income" ? "+" : "-";
  return `${sign}${formatWonUnit(amount)}`;
}
