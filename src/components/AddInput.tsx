"use client";

import { useState } from "react";

interface AddInputProps {
  placeholder: string;
  onAdd: (value: string) => void;
  /** 작게 표시 (카테고리 안 할일 추가용) */
  small?: boolean;
}

// 입력 + 추가 버튼. Enter 또는 + 버튼으로 추가. Daily/주간/카테고리 공용.
export default function AddInput({ placeholder, onAdd, small }: AddInputProps) {
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onAdd(v);
    setValue("");
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-1.5">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={`min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-2.5 text-zinc-800 transition-colors placeholder:text-zinc-400 focus:border-accent focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${
          small ? "py-1 text-sm" : "py-1.5 text-sm"
        }`}
      />
      <button
        type="submit"
        aria-label="추가"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-lg leading-none text-accent-foreground transition hover:opacity-90 active:scale-95"
      >
        +
      </button>
    </form>
  );
}
