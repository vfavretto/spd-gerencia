import { useQuery } from "@tanstack/react-query";
import { FileSpreadsheet, Loader2, PlusCircle, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConveniosListFilters } from "@/modules/convenios/components/ConveniosListFilters";
import { ConveniosListPagination } from "@/modules/convenios/components/ConveniosListPagination";
import { ConveniosListTable } from "@/modules/convenios/components/ConveniosListTable";
import { ResumoModal } from "@/modules/convenios/components/modals/ResumoModal";
import { useConveniosExport } from "@/modules/convenios/hooks/useConveniosExport";
import { convenioService, type ConvenioFilters } from "@/modules/convenios/services/convenioService";
import { configService } from "@/modules/configuracoes/services/configService";
import { CanCreateConvenio } from "@/modules/shared/components/PermissionGate";
import { PageHeader } from "@/modules/shared/components/PageHeader";

const ITEMS_PER_PAGE = 10;

export const ConveniosListaPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ConvenioFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [resumoModal, setResumoModal] = useState<{ id: string; titulo: string } | null>(null);

  const { data: catalogs } = useQuery({
    queryKey: ["catalogs"],
    queryFn: () => configService.getCatalogs()
  });

  const conveniosQuery = useQuery({
    queryKey: ["convenios", filters],
    queryFn: () => convenioService.list(filters)
  });

  const convenios = conveniosQuery.data ?? [];
  const { isExporting, exportCsv, exportExcel } = useConveniosExport(convenios);

  const totalPages = Math.ceil(convenios.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedConvenios = convenios.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (newFilters: Partial<ConvenioFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convênios"
        subtitle="Visualize, edite e gerencie todos os convênios cadastrados."
        actions={
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              CSV
            </button>
            <button
              onClick={exportExcel}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              Excel
            </button>
            <button
              onClick={() => conveniosQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
            <CanCreateConvenio>
              <button
                onClick={() => navigate("/convenios/cadastrar")}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500"
              >
                <PlusCircle className="h-4 w-4" />
                Novo convênio
              </button>
            </CanCreateConvenio>
          </div>
        }
      />

      <section className="glass-panel space-y-4 p-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Convênios cadastrados</h3>
            <p className="text-sm text-slate-500">
              {convenios.length} {convenios.length === 1 ? "convênio encontrado" : "convênios encontrados"}
            </p>
          </div>
        </div>

        <ConveniosListFilters filters={filters} catalogs={catalogs} onChange={handleFilterChange} />

        <ConveniosListTable
          convenios={paginatedConvenios}
          onOpenDetails={(id) => navigate(`/convenios/${id}`)}
          onOpenSummary={(convenio) => setResumoModal(convenio)}
        />

        <ConveniosListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={convenios.length}
          onPageChange={handlePageChange}
        />
      </section>

      {resumoModal && (
        <ResumoModal
          convenioId={resumoModal.id}
          convenioTitulo={resumoModal.titulo}
          onClose={() => setResumoModal(null)}
        />
      )}
    </div>
  );
};
