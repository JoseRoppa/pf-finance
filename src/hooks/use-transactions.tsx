import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { STORAGE_KEY, newId, sampleData, type Transaction } from "@/lib/finance";

interface Ctx {
  transactions: Transaction[];
  add: (t: Omit<Transaction, "id">) => void;
  update: (t: Transaction) => void;
  remove: (id: string) => void;
  loadSample: () => void;
  clearAll: () => void;
}
const TxContext = createContext<Ctx | null>(null);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTx] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTx(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions, loaded]);

  const sort = (l: Transaction[]) => [...l].sort((a, b) => b.date.localeCompare(a.date));
  const value: Ctx = {
    transactions,
    add: (t) => setTx((l) => sort([...l, { ...t, id: newId() }])),
    update: (t) => setTx((l) => sort(l.map((x) => (x.id === t.id ? t : x)))),
    remove: (id) => setTx((l) => l.filter((x) => x.id !== id)),
    loadSample: () => setTx(sampleData()),
    clearAll: () => setTx([]),
  };
  return <TxContext.Provider value={value}>{children}</TxContext.Provider>;
}

export function useTransactions() {
  const c = useContext(TxContext);
  if (!c) throw new Error("useTransactions outside provider");
  return c;
}
