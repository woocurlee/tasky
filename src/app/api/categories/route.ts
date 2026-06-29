import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 카테고리 생성
export async function POST(req: Request) {
  const { id, name } = await req.json();
  if (!id || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const category = await prisma.category.create({
    data: { id, name: name.trim(), private: false },
  });
  return NextResponse.json(category);
}
