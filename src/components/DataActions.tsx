import { Database, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTransactions } from "@/hooks/use-transactions";
import { toCSV } from "@/lib/finance";

export function DataActions() {
  const { transactions, loadSample, clearAll } = useTransactions();
  const exportCsv = () => {
    if (!transactions.length) { toast.error("Não há transações para exportar."); return; }
    const blob = new Blob(["\uFEFF" + toCSV(transactions)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "saldofacil-transacoes.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("CSV exportado.");
  };
  return (
    <div className="flex flex-col gap-2 px-2">
      <Button variant="outline" size="sm" className="justify-start" onClick={() => { loadSample(); toast.success("Dados de exemplo carregados."); }}>
        <Database className="h-4 w-4" /> Carregar dados de exemplo
      </Button>
      <Button variant="outline" size="sm" className="justify-start" onClick={exportCsv}>
        <Download className="h-4 w-4" /> Exportar CSV
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="justify-start text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" /> Apagar todos os dados
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar todos os dados?</AlertDialogTitle>
            <AlertDialogDescription>Todas as transações salvas neste navegador serão removidas permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { clearAll(); toast.success("Dados apagados."); }}>
              Apagar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
