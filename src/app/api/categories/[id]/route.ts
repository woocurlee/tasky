import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 카테고리 이름/비공개 수정
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: { name?: string; private?: boolean } = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.private === "boolean") data.private = body.private;
  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(category);
}

// 카테고리 삭제 (속한 할일은 onDelete: Cascade로 함께 삭제)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
