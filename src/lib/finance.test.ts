import { describe, it, expect } from "vitest";
import { computeInsights, totals, type Transaction } from "./finance";

const now = new Date(2026, 9, 15);
const tx = (p: Partial<Transaction>): Transaction => ({
  id: Math.random().toString(), description: "x", amount: 0, type: "despesa", category: "Outros", date: "2026-10-05", ...p,
});

describe("finance", () => {
  it("balance = receitas - despesas", () => {
    expect(totals([tx({ type: "receita", amount: 1000 }), tx({ amount: 300 })]).balance).toBe(700);
  });
  it("insights: top category, committed %, month change", () => {
    const i = computeInsights(
      [
        tx({ type: "receita", amount: 2000, category: "Salário" }),
        tx({ amount: 600, category: "Moradia" }),
        tx({ amount: 400, category: "Lazer" }),
        tx({ amount: 500, date: "2026-09-10" }),
      ],
      now,
    );
    expect(i.topCategory?.name).toBe("Moradia");
    expect(i.committed).toBe(50);
    expect(i.change).toBe(100);
  });
});
