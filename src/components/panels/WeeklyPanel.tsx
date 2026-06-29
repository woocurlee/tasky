"use client";

import { rectSortingStrategy } from "@dnd-kit/sortable";
import Panel from "@/components/Panel";
import AddInput from "@/components/AddInput";
import TodoItem from "@/components/TodoItem";
import SortableList from "@/components/SortableList";
import { useApp } from "@/lib/context";
import { useData } from "@/lib/data/store";
import { parseISODate, startOfWeek, toISODate, today, weekRangeLabel } from "@/lib/date";

// 3·4사분면 (하단 전체): 이번주 할일
// 기본은 오늘이 속한 주, 캘린더에서 날짜를 고르면 그 날짜가 속한 주를 표시.
export default function WeeklyPanel() {
  const { selectedDate } = useApp();
  const { todos, addTodo, toggleTodo, deleteTodo, reorderTodos } = useData();

  const selected = parseISODate(selectedDate);
  const weekStart = toISODate(startOfWeek(selected));
  const isCurrentWeek = weekStart === toISODate(startOfWeek(today()));

  const items = todos.filter((t) => t.weekStart === weekStart).sort((a, b) => a.order - b.order);
  const ids = items.map((t) => t.id);

  const title = (
    <span className="flex items-center gap-2">
      <span>이번주 할일</span>
      <span className="text-xs font-normal text-zinc-400">
        {weekRangeLabel(selected)}
        {isCurrentWeek && <span className="ml-1 font-medium text-accent">· 이번주</span>}
      </span>
    </span>
  );

  return (
    <Panel title={title} className="lg:col-span-2">
      <div className="flex h-full flex-col gap-2">
        <div className="sm:max-w-md lg:max-w-2xl">
          <AddInput
            small
            placeholder="이번주 할일 추가"
            onAdd={(value) => addTodo({ title: value, weekStart })}
          />
        </div>

        {/* 주가 바뀌면 remount되며 fade 전환 */}
        <div key={weekStart} className="animate-fade-in">
          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-400">이번 주 할일이 없습니다.</p>
          ) : (
            <SortableList ids={ids} onReorder={reorderTodos} strategy={rectSortingStrategy}>
              <ul className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => (
                  <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} />
                ))}
              </ul>
            </SortableList>
          )}
        </div>
      </div>
    </Panel>
  );
}
