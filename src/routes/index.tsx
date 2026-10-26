import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatCard } from "@/components/StatCard";
import { TransactionDialog } from "@/components/TransactionDialog";
import { TransactionList } from "@/components/TransactionList";
import { useTransactions } from "@/hooks/use-transactions";
import { brl, byMonth, currentMonthKey, expensesByCategory, lastMonths, totals } from "@/lib/finance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SaldoFácil" },
      { name: "description", content: "Veja saldo, receitas, despesas e gráficos das suas finanças pessoais." },
      { property: "og:title", content: "Dashboard — SaldoFácil" },
      { property: "og:description", content: "Seu gerenciador financeiro pessoal, simples e no navegador." },
    ],
  }),
  component: Dashboard,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)"];

function Dashboard() {
  const { transactions } = useTransactions();
  const all = totals(transactions);
  const month = byMonth(transactions, currentMonthKey());
  const m = totals(month);
  const bars = lastMonths(transactions, 6);
  const pie = expensesByCategory(month.length ? month : transactions);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Visão geral das suas finanças">
        <TransactionDialog trigger={<Button><Plus className="h-4 w-4" /> Nova transação</Button>} />
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Saldo total" value={brl(all.balance)} icon={Wallet} />
        <StatCard title="Receitas do mês" value={brl(m.income)} icon={TrendingUp} tone="success" />
        <StatCard title="Despesas do mês" value={brl(m.expense)} icon={TrendingDown} tone="destructive" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Panel title="Receitas x Despesas (6 meses)">
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={bars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `R$${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => brl(v)} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
                  <Legend />
                  <Bar dataKey="receitas" name="Receitas" fill="var(--success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
        <div className="lg:col-span-2">
          <Panel title="Despesas por categoria">
            {pie.length ? (
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => brl(v)} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="py-24 text-center text-sm text-muted-foreground">Sem despesas registradas.</p>}
          </Panel>
        </div>
      </div>
      <div className="mt-4">
        <Panel title="Últimas transações" action={<Link to="/transacoes" className="text-sm font-medium text-primary hover:underline">Ver todas</Link>}>
          <TransactionList items={transactions.slice(0, 6)} />
        </Panel>
      </div>
    </>
  );
}
