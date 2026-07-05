// 클라이언트 데이터 레이어 공용 헬퍼

export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

// fire-and-forget API 호출 (실패 시 콘솔 로깅)
export async function send(url: string, method: string, body?: unknown) {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) console.error(`API 실패: ${method} ${url} → ${res.status}`);
  } catch (e) {
    console.error(`API 오류: ${method} ${url}`, e);
  }
}
