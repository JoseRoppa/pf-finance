import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel } from "@/components/StatCard";
import { TransactionDialog } from "@/components/TransactionDialog";
import { TransactionList } from "@/components/TransactionList";
import { useTransactions } from "@/hooks/use-transactions";
import { brl, CATEGORIES, totals } from "@/lib/finance";

export const Route = createFileRoute("/transacoes")({
  head: () => ({
    meta: [
      { title: "Transações — SaldoFácil" },
      { name: "description", content: "Adicione, edite, exclua e filtre suas receitas e despesas." },
      { property: "og:title", content: "Transações — SaldoFácil" },
      { property: "og:description", content: "Gerencie suas receitas e despesas por categoria, tipo e período." },
    ],
  }),
  component: Transacoes,
});

function Transacoes() {
  const { transactions } = useTransactions();
  const [cat, setCat] = useState("todas");
  const [type, setType] = useState("todos");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => transactions.filter((t) =>
    (cat === "todas" || t.category === cat) &&
    (type === "todos" || t.type === type) &&
    (!from || t.date >= from) && (!to || t.date <= to),
  ), [transactions, cat, type, from, to]);
  const t = totals(filtered);

  return (
    <>
      <PageHeader title="Transações" subtitle={`${filtered.length} transação(ões) · Saldo filtrado: ${brl(t.balance)}`}>
        <TransactionDialog trigger={<Button><Plus className="h-4 w-4" /> Nova transação</Button>} />
      </PageHeader>
      <div className="mb-4 grid gap-3 rounded-xl border bg-card p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-5">
        <div className="grid gap-1.5">
          <Label>Categoria</Label>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger aria-label="Filtrar categoria"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Tipo</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger aria-label="Filtrar tipo"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5"><Label htmlFor="from">De</Label><Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label htmlFor="to">Até</Label><Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div className="flex items-end">
          <Button variant="outline" className="w-full" onClick={() => { setCat("todas"); setType("todos"); setFrom(""); setTo(""); }}>Limpar filtros</Button>
        </div>
      </div>
      <Panel title="Lista de transações"><TransactionList items={filtered} actions /></Panel>
    </>
  );
}
