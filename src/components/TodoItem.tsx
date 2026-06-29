"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Todo } from "@/lib/types";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// 할일 한 줄: 드래그 핸들 + 완료 체크(팝) + 제목 + 삭제(사라지는 애니메이션). Daily/주간 공용.
export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const [leaving, setLeaving] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      onAnimationEnd={(e) => {
        // 삭제 애니메이션이 끝나면 실제 제거 (자식 애니메이션 버블링은 무시)
        if (leaving && e.target === e.currentTarget) onDelete(todo.id);
      }}
      className={`group flex items-start gap-1 rounded-md px-1.5 py-1 transition-colors ${
        isDragging ? "relative z-10 bg-white shadow-lg ring-1 ring-accent/40 dark:bg-zinc-900" : ""
      } ${
        leaving ? "animate-fade-out pointer-events-none" : "animate-fade-in hover:bg-accent/[0.07]"
      }`}
    >
      {/* 드래그 핸들 */}
      <button
        type="button"
        aria-label="순서 변경"
        {...attributes}
        {...listeners}
        className="mt-1 flex h-6 w-4 shrink-0 cursor-grab touch-none items-center justify-center text-zinc-300 opacity-50 transition hover:text-zinc-500 active:cursor-grabbing group-hover:opacity-100 dark:text-zinc-600 dark:hover:text-zinc-400"
      >
        <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden>
          <circle cx="3" cy="3" r="1.3" />
          <circle cx="7" cy="3" r="1.3" />
          <circle cx="3" cy="8" r="1.3" />
          <circle cx="7" cy="8" r="1.3" />
          <circle cx="3" cy="13" r="1.3" />
          <circle cx="7" cy="13" r="1.3" />
        </svg>
      </button>

      <button
        type="button"
        aria-pressed={todo.done}
        onClick={() => onToggle(todo.id)}
        className="group/toggle flex min-w-0 flex-1 items-start gap-2 py-1 text-left"
      >
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition group-active/toggle:scale-90 ${
            todo.done
              ? "border-accent bg-accent"
              : "border-zinc-300 group-hover/toggle:border-accent dark:border-zinc-600"
          }`}
        >
          {todo.done && (
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="h-3.5 w-3.5 animate-check-pop text-accent-foreground"
            >
              <path
                d="M3.5 8.5 L6.5 11.5 L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span
          className={`min-w-0 break-words text-sm transition-colors ${
            todo.done
              ? "text-zinc-400 line-through dark:text-zinc-500"
              : "text-zinc-800 dark:text-zinc-100"
          }`}
        >
          {todo.title}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setLeaving(true)}
        aria-label="삭제"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-zinc-300 transition hover:bg-red-50 hover:text-red-500 active:scale-90 dark:text-zinc-600 dark:hover:bg-red-950/40"
      >
        ×
      </button>
    </li>
  );
}
