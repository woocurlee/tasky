import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 거래 생성
export async function POST(req: Request) {
  const { id, date, type, amount, category, memo = null, createdAt } = await req.json();
  if (
    !id ||
    typeof date !== "string" ||
    (type !== "income" && type !== "expense") ||
    typeof amount !== "number" ||
    amount <= 0 ||
    typeof category !== "string" ||
    !category.trim()
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const tx = await prisma.transaction.create({
    data: {
      id,
      date,
      type,
      amount: Math.round(amount),
      category: category.trim(),
      memo: memo ?? null,
      ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
    },
  });
  return NextResponse.json(tx);
}
