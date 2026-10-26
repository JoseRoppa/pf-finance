import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type Category, type Transaction, type TxType } from "@/lib/finance";
import { useTransactions } from "@/hooks/use-transactions";

const today = () => new Date().toISOString().slice(0, 10);

export function TransactionDialog({ trigger, initial }: { trigger: ReactNode; initial?: Transaction }) {
  const { add, update } = useTransactions();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TxType>("despesa");
  const [category, setCategory] = useState<Category | "">("");
  const [date, setDate] = useState(today());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setDescription(initial?.description ?? "");
    setAmount(initial ? String(initial.amount) : "");
    setType(initial?.type ?? "despesa");
    setCategory(initial?.category ?? "");
    setDate(initial?.date ?? today());
    setErrors({});
  }, [open, initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    const value = Number(amount.replace(",", "."));
    if (!description.trim()) err.description = "Informe a descrição.";
    if (!amount || isNaN(value) || value <= 0) err.amount = "Informe um valor maior que zero.";
    if (!category) err.category = "Selecione uma categoria.";
    if (!date) err.date = "Informe a data.";
    setErrors(err);
    if (Object.keys(err).length) return;
    const data = { description: description.trim(), amount: value, type, category: category as Category, date };
    if (initial) update({ ...data, id: initial.id });
    else add(data);
    toast.success(initial ? "Transação atualizada." : "Transação adicionada.");
    setOpen(false);
  };

  const fe = (k: string) => errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Editar transação" : "Nova transação"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            {(["despesa", "receita"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`rounded-md py-1.5 text-sm font-medium capitalize transition-colors ${type === t ? (t === "receita" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground") : "text-muted-foreground"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="desc">Descrição</Label>
            <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Supermercado" />
            {fe("description")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input id="amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
              {fe("amount")}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              {fe("date")}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger aria-label="Categoria"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {fe("category")}
          </div>
          <DialogFooter><Button type="submit">{initial ? "Salvar" : "Adicionar"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
