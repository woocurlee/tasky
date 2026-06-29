"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Category, Todo } from "@/lib/types";

/**
 * 데이터 접근 레이어 (2단계: API + Prisma/SQLite).
 * - 초기 데이터는 서버(page.tsx)에서 Prisma로 읽어 props로 주입(SSR).
 * - 변경은 낙관적 업데이트(즉시 화면 반영) 후 API 호출. 컴포넌트는 동기 인터페이스만 사용.
 */
interface AddTodoInput {
  title: string;
  date?: string | null;
  weekStart?: string | null;
  categoryId?: string | null;
}

interface DataStore {
  categories: Category[];
  todos: Todo[];
  addCategory: (name: string) => void;
  renameCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryPrivate: (id: string) => void;
  addTodo: (input: AddTodoInput) => void;
  toggleTodo: (id: string) => void;
  updateTodoTitle: (id: string, title: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (orderedIds: string[]) => void;
}

const DataContext = createContext<DataStore | null>(null);

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

// fire-and-forget API 호출 (실패 시 콘솔 로깅)
async function send(url: string, method: string, body?: unknown) {
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

export function DataProvider({
  initialCategories,
  initialTodos,
  children,
}: {
  initialCategories: Category[];
  initialTodos: Todo[];
  children: ReactNode;
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const store: DataStore = {
    categories,
    todos,

    addCategory: (name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const id = uid();
      setCategories((cs) => [...cs, { id, name: trimmed, private: false }]);
      send("/api/categories", "POST", { id, name: trimmed });
    },

    renameCategory: (id, name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setCategories((cs) => cs.map((c) => (c.id === id ? { ...c, name: trimmed } : c)));
      send(`/api/categories/${id}`, "PATCH", { name: trimmed });
    },

    deleteCategory: (id) => {
      setCategories((cs) => cs.filter((c) => c.id !== id));
      setTodos((ts) => ts.filter((t) => t.categoryId !== id)); // Cascade와 동일하게 로컬에서도 제거
      send(`/api/categories/${id}`, "DELETE");
    },

    toggleCategoryPrivate: (id) => {
      const next = !categories.find((c) => c.id === id)?.private;
      setCategories((cs) => cs.map((c) => (c.id === id ? { ...c, private: next } : c)));
      send(`/api/categories/${id}`, "PATCH", { private: next });
    },

    addTodo: ({ title, date = null, weekStart = null, categoryId = null }) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const id = uid();
      const order = Date.now(); // 같은 리스트의 맨 뒤로 정렬
      setTodos((ts) => [...ts, { id, title: trimmed, done: false, date, weekStart, categoryId, order }]);
      send("/api/todos", "POST", { id, title: trimmed, date, weekStart, categoryId, order });
    },

    toggleTodo: (id) => {
      const next = !todos.find((t) => t.id === id)?.done;
      setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, done: next } : t)));
      send(`/api/todos/${id}`, "PATCH", { done: next });
    },

    updateTodoTitle: (id, title) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, title: trimmed } : t)));
      send(`/api/todos/${id}`, "PATCH", { title: trimmed });
    },

    deleteTodo: (id) => {
      setTodos((ts) => ts.filter((t) => t.id !== id));
      send(`/api/todos/${id}`, "DELETE");
    },

    reorderTodos: (orderedIds) => {
      const indexById = new Map(orderedIds.map((id, i) => [id, i]));
      setTodos((ts) =>
        ts.map((t) => (indexById.has(t.id) ? { ...t, order: indexById.get(t.id)! } : t)),
      );
      send("/api/todos/reorder", "POST", { ids: orderedIds });
    },
  };

  return <DataContext.Provider value={store}>{children}</DataContext.Provider>;
}

export function useData(): DataStore {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within <DataProvider>");
  return ctx;
}
