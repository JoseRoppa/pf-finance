import { ArrowDownRight, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brl, type Transaction } from "@/lib/finance";
import { useTransactions } from "@/hooks/use-transactions";
import { TransactionDialog } from "./TransactionDialog";

export function TransactionList({ items, actions = false }: { items: Transaction[]; actions?: boolean }) {
  const { remove } = useTransactions();
  if (!items.length) return <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma transação encontrada.</p>;
  return (
    <ul className="divide-y divide-border">
      {items.map((t) => {
        const inc = t.type === "receita";
        return (
          <li key={t.id} className="flex items-center gap-3 py-3 animate-in fade-in">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${inc ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>
              {inc ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t.description}</p>
              <p className="text-xs text-muted-foreground">{t.category} · {t.date.split("-").reverse().join("/")}</p>
            </div>
            <span className={`text-sm font-semibold tabular-nums ${inc ? "text-success" : "text-foreground"}`}>
              {inc ? "+" : "−"} {brl(t.amount)}
            </span>
            {actions && (
              <div className="flex">
                <TransactionDialog initial={t} trigger={<Button variant="ghost" size="icon" aria-label="Editar"><Pencil className="h-4 w-4" /></Button>} />
                <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
