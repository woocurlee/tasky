// 초기 mock 데이터 시드. 이미 데이터가 있으면 건너뜀(idempotent).
// 실행: npx tsx prisma/seed.ts
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

// 절대경로로 dev.db 지정 (CLI가 cwd 기준으로 생성하므로 프로젝트 루트의 dev.db)
const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

async function main() {
  const existing = await prisma.category.count();
  if (existing > 0) {
    console.log(`이미 ${existing}개 카테고리가 있어 시드를 건너뜁니다.`);
    return;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = toISO(today);
  const diff = (today.getDay() + 6) % 7; // 월요일까지 며칠 전
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - diff);
  const ws = toISO(monday);

  await prisma.category.createMany({
    data: [
      { id: "cat-work", name: "업무", private: false },
      { id: "cat-life", name: "생활", private: false },
      { id: "cat-job", name: "이직 준비", private: true },
    ],
  });

  await prisma.todo.createMany({
    data: [
      { id: "todo-1", title: "이메일 확인", done: true, date: d, weekStart: null, categoryId: "cat-work", order: 0 },
      { id: "todo-2", title: "기획서 초안 작성", done: false, date: d, weekStart: null, categoryId: "cat-work", order: 1 },
      { id: "todo-3", title: "운동 30분", done: false, date: d, weekStart: null, categoryId: "cat-life", order: 0 },
      { id: "todo-4", title: "이력서 업데이트", done: false, date: d, weekStart: null, categoryId: "cat-job", order: 0 },
      { id: "todo-w1", title: "주간 회고 정리", done: false, date: null, weekStart: ws, categoryId: null, order: 0 },
    ],
  });

  console.log("시드 완료: 카테고리 3개, 할일 5개");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
