# SaldoFácil

Gerenciador financeiro pessoal que roda 100% no navegador.

## Instalação
```bash
bun install   # ou npm install
bun run dev   # http://localhost:8080
```

## Funcionalidades
- **Dashboard**: saldo total, receitas/despesas do mês, gráfico de barras (6 meses), pizza por categoria e últimas transações.
- **Transações**: adicionar, editar, excluir; filtros por categoria, tipo e período; validação de campos.
- **Insights Financeiros**: maior categoria de gasto, % da renda comprometida, comparação com o mês anterior, recomendações e explicação dos cálculos — tudo por regras locais, sem IA externa.
- **Dados**: carregar exemplos, apagar tudo (com confirmação), exportar CSV, salvamento automático.

## Tecnologias
React + TypeScript, TanStack Start, Tailwind CSS, shadcn/ui, Recharts, Lucide.

## Limitações do armazenamento local
- Os dados ficam apenas neste navegador/dispositivo (chave `saldofacil:transactions`).
- Limpar dados do navegador ou usar janela anônima apaga/isola as transações.
- Não há sincronização entre dispositivos; use a exportação CSV como backup.
- Limite típico de ~5 MB por site.
