import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

// Next.js dev 핫리로드에서 PrismaClient 인스턴스가 중복 생성되지 않도록 전역에 캐시
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // dev.db는 프로젝트 루트(cwd 기준)에 위치
  const dbPath = path.join(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
