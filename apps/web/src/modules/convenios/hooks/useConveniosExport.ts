import { useState } from "react";
import { exportConvenios } from "@/modules/convenios/lib/exportConvenios";
import type { Convenio } from "@/modules/shared/types";
import { toast } from "@/modules/shared/ui/toaster";

export function useConveniosExport(convenios: Convenio[]) {
  const [isExporting, setIsExporting] = useState(false);

  const runExport = async (type: "csv" | "excel") => {
    if (!convenios.length) {
      toast.error("Não há convênios para exportar com os filtros atuais.");
      return;
    }

    setIsExporting(true);
    const loadingToast = toast.loading(
      type === "csv" ? "Preparando exportação CSV..." : "Preparando exportação Excel..."
    );

    try {
      if (type === "csv") {
        await exportConvenios.csv(convenios);
        toast.success("CSV exportado com sucesso.");
      } else {
        await exportConvenios.excel(convenios);
        toast.success("Excel exportado com sucesso.");
      }
    } catch {
      toast.error(type === "csv" ? "Erro ao exportar CSV." : "Erro ao exportar Excel.");
    } finally {
      toast.dismiss(loadingToast);
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportCsv: () => runExport("csv"),
    exportExcel: () => runExport("excel")
  };
}
