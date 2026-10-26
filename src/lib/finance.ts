export type TxType = "receita" | "despesa";

export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Salário",
  "Outros",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TxType;
  category: Category;
  date: string; // YYYY-MM-DD
}

export const STORAGE_KEY = "saldofacil:transactions";

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const monthKey = (date: string) => date.slice(0, 7);

export function currentMonthKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function prevMonthKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function totals(txs: Transaction[]) {
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.type === "receita") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

export function byMonth(txs: Transaction[], key: string) {
  return txs.filter((t) => monthKey(t.date) === key);
}

export function expensesByCategory(txs: Transaction[]) {
  const map = new Map<string, number>();
  for (const t of txs) if (t.type === "despesa") map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function lastMonths(txs: Transaction[], n: number, now = new Date()) {
  const out: { key: string; label: string; receitas: number; despesas: number }[] = [];
  let key = currentMonthKey(now);
  for (let i = 0; i < n; i++) {
    const t = totals(byMonth(txs, key));
    const [y, m] = key.split("-").map(Number);
    const label = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    out.unshift({ key, label, receitas: t.income, despesas: t.expense });
    key = prevMonthKey(key);
  }
  return out;
}

export interface Insights {
  topCategory: { name: string; value: number; share: number } | null;
  income: number;
  expense: number;
  committed: number | null; // % of income spent
  prevExpense: number;
  change: number | null; // % change vs previous month
  recommendations: string[];
}

export function computeInsights(txs: Transaction[], now = new Date()): Insights {
  const cur = currentMonthKey(now);
  const curTx = byMonth(txs, cur);
  const prevTx = byMonth(txs, prevMonthKey(cur));
  const { income, expense } = totals(curTx);
  const prevExpense = totals(prevTx).expense;
  const cats = expensesByCategory(curTx);
  const topCategory = cats[0]
    ? { ...cats[0], share: expense > 0 ? (cats[0].value / expense) * 100 : 0 }
    : null;
  const committed = income > 0 ? (expense / income) * 100 : null;
  const change = prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : null;

  const rec: string[] = [];
  if (curTx.length === 0) rec.push("Registre suas transações deste mês para receber análises personalizadas.");
  if (committed !== null) {
    if (committed > 100) rec.push("Você gastou mais do que ganhou este mês. Corte despesas não essenciais com urgência.");
    else if (committed > 80) rec.push("Mais de 80% da renda está comprometida. Tente reduzir gastos para criar uma margem de segurança.");
    else if (committed > 50) rec.push("Seus gastos estão moderados. Busque poupar ao menos 20% da renda (regra 50-30-20).");
    else rec.push("Ótimo controle! Considere investir o valor excedente ou montar uma reserva de emergência.");
  } else if (expense > 0) rec.push("Há despesas sem receita registrada neste mês. Registre suas receitas para uma análise precisa.");
  if (topCategory && topCategory.share > 40)
    rec.push(`${topCategory.name} representa ${topCategory.share.toFixed(0)}% dos gastos. Avalie se é possível reduzir essa categoria.`);
  if (change !== null) {
    if (change > 10) rec.push(`Seus gastos subiram ${change.toFixed(0)}% em relação ao mês anterior. Revise o que mudou.`);
    else if (change < -10) rec.push(`Parabéns! Você reduziu os gastos em ${Math.abs(change).toFixed(0)}% comparado ao mês anterior.`);
  }
  const leisure = cats.find((c) => c.name === "Lazer");
  if (leisure && income > 0 && leisure.value / income > 0.15)
    rec.push("Gastos com lazer ultrapassam 15% da renda. Defina um teto mensal para essa categoria.");
  return { topCategory, income, expense, committed, prevExpense, change, recommendations: rec };
}

export function toCSV(txs: Transaction[]) {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = txs.map((t) =>
    [t.date, esc(t.description), t.type, t.category, t.amount.toFixed(2)].join(";"),
  );
  return ["Data;Descrição;Tipo;Categoria;Valor", ...rows].join("\n");
}

export function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function sampleData(now = new Date()): Transaction[] {
  const d = (monthsAgo: number, day: number) => {
    const x = new Date(now.getFullYear(), now.getMonth() - monthsAgo, Math.min(day, 28));
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  };
  const base: Omit<Transaction, "id" | "date">[] = [
    { description: "Salário", amount: 5200, type: "receita", category: "Salário" },
    { description: "Aluguel", amount: 1500, type: "despesa", category: "Moradia" },
    { description: "Supermercado", amount: 680, type: "despesa", category: "Alimentação" },
    { description: "Combustível", amount: 320, type: "despesa", category: "Transporte" },
    { description: "Plano de saúde", amount: 410, type: "despesa", category: "Saúde" },
    { description: "Curso online", amount: 199, type: "despesa", category: "Educação" },
    { description: "Cinema e jantar", amount: 240, type: "despesa", category: "Lazer" },
  ];
  const out: Transaction[] = [];
  for (let m = 0; m < 6; m++) {
    base.forEach((b, i) => {
      const factor = b.type === "despesa" ? 0.8 + ((m * 7 + i * 3) % 5) / 10 : 1;
      out.push({ ...b, id: newId(), amount: Math.round(b.amount * factor), date: d(m, 3 + i * 3) });
    });
    if (m % 2 === 0) out.push({ id: newId(), description: "Freelance", amount: 900, type: "receita", category: "Outros", date: d(m, 20) });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}
