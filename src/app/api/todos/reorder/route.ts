import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 드래그 정렬: orderedIds 순서대로 order 재배정
export async function POST(req: Request) {
  const { ids } = await req.json();
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  await prisma.$transaction(
    ids.map((id: string, i: number) =>
      prisma.todo.update({ where: { id }, data: { order: i } }),
    ),
  );
  return NextResponse.json({ ok: true });
}
