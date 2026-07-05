"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Transaction } from "@/lib/types";
import { send, uid } from "@/lib/api";

interface AddTxInput {
  date: string;
  amount: number;
  category: string;
  memo?: string | null;
}

interface LedgerStore {
  transactions: Transaction[];
  addTransaction: (input: AddTxInput) => void;
  deleteTransaction: (id: string) => void;
}

const LedgerContext = createContext<LedgerStore | null>(null);

export function LedgerProvider({
  initialTransactions,
  children,
}: {
  initialTransactions: Transaction[];
  children: ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const store: LedgerStore = {
    transactions,

    addTransaction: ({ date, amount, category, memo = null }) => {
      const cat = category.trim();
      if (!date || !amount || amount <= 0 || !cat) return;
      const id = uid();
      const createdAt = new Date().toISOString();
      // 지출만 관리 (type은 항상 "expense")
      const tx: Transaction = {
        id,
        date,
        type: "expense",
        amount,
        category: cat,
        memo: memo?.trim() || null,
        createdAt,
      };
      setTransactions((ts) => [...ts, tx]);
      send("/api/transactions", "POST", {
        id,
        date,
        type: "expense",
        amount,
        category: cat,
        memo: tx.memo,
        createdAt,
      });
    },

    deleteTransaction: (id) => {
      setTransactions((ts) => ts.filter((t) => t.id !== id));
      send(`/api/transactions/${id}`, "DELETE");
    },
  };

  return <LedgerContext.Provider value={store}>{children}</LedgerContext.Provider>;
}

export function useLedger(): LedgerStore {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used within <LedgerProvider>");
  return ctx;
}
