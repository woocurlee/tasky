"use client";

import { useState } from "react";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import Panel from "@/components/Panel";
import AddInput from "@/components/AddInput";
import TodoItem from "@/components/TodoItem";
import SortableList from "@/components/SortableList";
import { useApp } from "@/lib/context";
import { useData } from "@/lib/data/store";
import { parseISODate, WEEKDAY_LABELS } from "@/lib/date";
import type { Category } from "@/lib/types";

// 1사분면 (우상): Daily 할일 — 카테고리 추가 + 그 아래 할일 추가/체크/삭제 (+ 비공개 카테고리)
export default function DailyPanel() {
  const { selectedDate, revealPrivate, toggleRevealPrivate } = useApp();
  const { categories, addCategory } = useData();

  const d = parseISODate(selectedDate);
  const dowLabel = WEEKDAY_LABELS[(d.getDay() + 6) % 7];
  const label = `${d.getMonth() + 1}월 ${d.getDate()}일 (${dowLabel})`;

  const visibleCategories = revealPrivate ? categories : categories.filter((c) => !c.private);
  const hiddenCount = categories.length - visibleCategories.length;

  return (
    <Panel title={`오늘 할일 · ${label}`}>
      <div className="flex flex-col gap-3">
        {/* 날짜가 바뀌면 remount되며 카테고리들이 fade 전환 */}
        <div key={selectedDate} className="flex flex-col gap-3">
          {categories.length === 0 ? (
            <p className="animate-fade-in py-6 text-center text-sm text-zinc-400">
              카테고리를 먼저 추가해보세요.
            </p>
          ) : visibleCategories.length === 0 ? (
            <p className="animate-fade-in py-6 text-center text-sm text-zinc-400">
              표시할 카테고리가 없습니다.
            </p>
          ) : (
            visibleCategories.map((c) => (
              <CategorySection key={c.id} category={c} date={selectedDate} />
            ))
          )}
        </div>

        {/* 비공개 숨김 안내 (숨김 상태에서만) */}
        {!revealPrivate && hiddenCount > 0 && (
          <button
            type="button"
            onClick={toggleRevealPrivate}
            className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-zinc-300 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-400 hover:text-zinc-600 dark:border-zinc-700 dark:hover:border-zinc-500"
          >
            <LockIcon closed /> 비공개 카테고리 {hiddenCount}개 숨김 · 보기
          </button>
        )}

        {/* 카테고리 추가 */}
        <div className="pt-1">
          <AddInput placeholder="+ 새 카테고리" onAdd={addCategory} />
        </div>
      </div>
    </Panel>
  );
}

function CategorySection({ category, date }: { category: Category; date: string }) {
  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    renameCategory,
    deleteCategory,
    toggleCategoryPrivate,
  } = useData();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);

  const items = todos
    .filter((t) => t.categoryId === category.id && t.date === date)
    .sort((a, b) => a.order - b.order);
  const ids = items.map((t) => t.id);

  const saveName = (e: React.FormEvent) => {
    e.preventDefault();
    renameCategory(category.id, name);
    setEditing(false);
  };

  const handleDelete = () => {
    const msg =
      items.length > 0
        ? `"${category.name}" 카테고리와 이 날짜의 할일 ${items.length}개를 삭제할까요?`
        : `"${category.name}" 카테고리를 삭제할까요?`;
    if (confirm(msg)) deleteCategory(category.id);
  };

  return (
    <div className="animate-fade-in overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      {/* 카테고리 헤더 (비공개면 앰버 틴트) */}
      <div
        className={`flex items-center gap-1 border-b px-2.5 py-1.5 ${
          category.private
            ? "border-amber-300/40 bg-amber-100/50 dark:border-amber-800/40 dark:bg-amber-950/30"
            : "border-accent/15 bg-accent/[0.05]"
        }`}
      >
        {editing ? (
          <form onSubmit={saveName} className="flex flex-1 items-center gap-1.5">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
              className="min-w-0 flex-1 rounded border border-zinc-300 px-1.5 py-0.5 text-sm focus:outline-none dark:border-zinc-600 dark:bg-zinc-900"
            />
          </form>
        ) : (
          <h3 className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            {category.private && (
              <span className="shrink-0 text-amber-600 dark:text-amber-400">
                <LockIcon closed />
              </span>
            )}
            <span className="truncate">{category.name}</span>
          </h3>
        )}
        {/* 비공개 토글 */}
        <button
          type="button"
          onClick={() => toggleCategoryPrivate(category.id)}
          aria-pressed={category.private}
          aria-label={category.private ? "비공개 해제" : "비공개로 표시"}
          title={category.private ? "비공개 해제" : "비공개로 표시"}
          className={`flex h-7 w-7 items-center justify-center rounded transition active:scale-90 ${
            category.private
              ? "text-amber-600 hover:bg-amber-200/50 dark:text-amber-400 dark:hover:bg-amber-900/40"
              : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          }`}
        >
          <LockIcon closed={category.private} />
        </button>
        <button
          type="button"
          onClick={() => {
            setName(category.name);
            setEditing((v) => !v);
          }}
          aria-label="이름 수정"
          className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 active:scale-90 dark:hover:bg-zinc-800"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="카테고리 삭제"
          className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 transition hover:bg-red-50 hover:text-red-500 active:scale-90 dark:hover:bg-red-950/40"
        >
          🗑
        </button>
      </div>

      {/* 할일 목록 */}
      <div className="px-2 py-1.5">
        {items.length > 0 && (
          <SortableList ids={ids} onReorder={reorderTodos} strategy={verticalListSortingStrategy}>
            <ul className="mb-1.5">
              {items.map((t) => (
                <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} />
              ))}
            </ul>
          </SortableList>
        )}
        <AddInput
          small
          placeholder="할일 추가"
          onAdd={(title) => addTodo({ title, date, categoryId: category.id })}
        />
      </div>
    </div>
  );
}

// 잠금 아이콘 — closed=true면 닫힌 자물쇠, false면 열린 자물쇠
function LockIcon({ closed = true }: { closed?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3.5 w-3.5"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      {closed ? <path d="M8 11V8a4 4 0 0 1 8 0v3" /> : <path d="M8 11V7a4 4 0 0 1 7.5-2" />}
    </svg>
  );
}
