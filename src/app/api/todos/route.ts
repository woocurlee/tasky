import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 할일 생성 (daily: date+categoryId / 주간: weekStart)
export async function POST(req: Request) {
  const { id, title, date = null, weekStart = null, categoryId = null, order = 0 } = await req.json();
  if (!id || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const todo = await prisma.todo.create({
    data: { id, title: title.trim(), done: false, date, weekStart, categoryId, order },
  });
  return NextResponse.json(todo);
}
