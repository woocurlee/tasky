"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth";

export interface LoginState {
  error: string | null;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const ok =
    !!process.env.AUTH_SECRET &&
    username === process.env.AUTH_USERNAME &&
    password === process.env.AUTH_PASSWORD;

  if (!ok) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, process.env.AUTH_SECRET!, {
    httpOnly: true,
    sameSite: "lax",
    // HTTPS로 서비스하면 true 권장 (현재는 http 배포도 고려해 false)
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
  });

  redirect("/");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
