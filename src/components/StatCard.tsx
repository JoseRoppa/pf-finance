import type { LucideIcon } from "lucide-react";

export function StatCard({ title, value, icon: Icon, tone = "primary" }: { title: string; value: string; icon: LucideIcon; tone?: "primary" | "success" | "destructive" }) {
  const tones = { primary: "bg-primary/10 text-primary", success: "bg-success/15 text-success", destructive: "bg-destructive/10 text-destructive" };
  return (
    <div className="rounded-xl border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}><Icon className="h-4 w-4" /></div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
