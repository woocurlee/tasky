"use client";

import { useId, type ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  type SortingStrategy,
} from "@dnd-kit/sortable";

interface SortableListProps {
  /** 현재 렌더 순서와 동일한 id 배열 */
  ids: string[];
  onReorder: (orderedIds: string[]) => void;
  strategy: SortingStrategy;
  children: ReactNode;
}

// 드래그 정렬 컨텍스트. 터치/탭과 드래그를 구분하기 위해 약간 움직여야 드래그가 시작됨.
export default function SortableList({ ids, onReorder, strategy, children }: SortableListProps) {
  // SSR/CSR에서 동일한 id로 dnd-kit의 접근성 id 생성을 결정적으로 만든다 (hydration 불일치 방지)
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={strategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
