import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, PieChart, Percent, TrendingUp } from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/StatCard";
import { Progress } from "@/components/ui/progress";
import { useTransactions } from "@/hooks/use-transactions";
import { brl, computeInsights } from "@/lib/finance";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights Financeiros — SaldoFácil" },
      { name: "description", content: "Análise automática dos seus gastos com recomendações personalizadas." },
      { property: "og:title", content: "Insights Financeiros — SaldoFácil" },
      { property: "og:description", content: "Descubra onde você mais gasta e como melhorar suas finanças." },
    ],
  }),
  component: InsightsPage,
});

const pct = (n: number) => `${n.toFixed(1).replace(".", ",")}%`;

function InsightsPage() {
  const { transactions } = useTransactions();
  const i = computeInsights(transactions);

  return (
    <>
      <PageHeader title="Insights Financeiros" subtitle="Análise automática do mês atual, feita localmente no seu navegador" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Maior gasto" value={i.topCategory ? i.topCategory.name : "—"} icon={PieChart} />
        <StatCard title="Renda comprometida" value={i.committed !== null ? pct(i.committed) : "—"} icon={Percent} tone={i.committed !== null && i.committed > 80 ? "destructive" : "success"} />
        <StatCard title="Variação vs mês anterior" value={i.change !== null ? `${i.change > 0 ? "+" : ""}${pct(i.change)}` : "—"} icon={TrendingUp} tone={i.change !== null && i.change > 0 ? "destructive" : "success"} />
      </div>

      {i.committed !== null && (
        <div className="mt-4 rounded-xl border bg-card p-5 shadow-soft">
          <div className="mb-2 flex justify-between text-sm"><span>Uso da renda</span><span className="font-medium">{pct(i.committed)}</span></div>
          <Progress value={Math.min(i.committed, 100)} />
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Recomendações">
          <ul className="space-y-3">
            {i.recommendations.map((r, k) => (
              <li key={k} className="flex gap-3 rounded-lg bg-accent p-3 text-sm text-accent-foreground animate-in fade-in slide-in-from-bottom-1">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{r}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Como calculamos">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-medium">Categoria de maior gasto</dt>
              <dd className="text-muted-foreground">
                Somamos as despesas do mês por categoria e escolhemos a maior.
                {i.topCategory && <> {i.topCategory.name}: {brl(i.topCategory.value)} de {brl(i.expense)} em despesas = {pct(i.topCategory.share)}.</>}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Percentual da renda comprometido</dt>
              <dd className="text-muted-foreground">
                Despesas do mês ÷ receitas do mês × 100.
                {i.committed !== null ? <> {brl(i.expense)} ÷ {brl(i.income)} × 100 = {pct(i.committed)}.</> : " Sem receitas registradas neste mês."}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Comparação com o mês anterior</dt>
              <dd className="text-muted-foreground">
                (Despesas atuais − despesas anteriores) ÷ despesas anteriores × 100.
                {i.change !== null ? <> ({brl(i.expense)} − {brl(i.prevExpense)}) ÷ {brl(i.prevExpense)} × 100 = {pct(i.change)}.</> : " Sem despesas no mês anterior para comparar."}
              </dd>
            </div>
          </dl>
        </Panel>
      </div>
    </>
  );
}
