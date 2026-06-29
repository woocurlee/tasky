import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 할일 완료/제목 수정
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: { title?: string; done?: boolean } = {};
  if (typeof body.title === "string" && body.title.trim()) data.title = body.title.trim();
  if (typeof body.done === "boolean") data.done = body.done;
  const todo = await prisma.todo.update({ where: { id }, data });
  return NextResponse.json(todo);
}

// 할일 삭제
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.todo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
