import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  ListChecks,
  PlusCircle,
  RefreshCcw
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { convenioStatusOptions } from '../constants';
import {
  convenioService,
  type ConvenioFilters
} from '../services/convenioService';
import { configService } from '../services/configService';
import { formatCurrency, formatDate } from '../utils/format';

const ITEMS_PER_PAGE = 10;

export const ConveniosListaPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ConvenioFilters>({});
  const [currentPage, setCurrentPage] = useState(1);

  const { data: catalogs } = useQuery({
    queryKey: ['catalogs'],
    queryFn: () => configService.getCatalogs()
  });

  const conveniosQuery = useQuery({
    queryKey: ['convenios', filters],
    queryFn: () => convenioService.list(filters)
  });

  const convenios = conveniosQuery.data ?? [];

  // Paginação local
  const totalPages = Math.ceil(convenios.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedConvenios = convenios.slice(startIndex, endIndex);

  const secretariaOptions = useMemo(
    () => catalogs?.secretarias ?? [],
    [catalogs?.secretarias]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: Partial<ConvenioFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convênios"
        subtitle="Visualize, edite e gerencie todos os convênios cadastrados."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => conveniosQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
            <button
              onClick={() => navigate('/convenios/cadastrar')}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500"
            >
              <PlusCircle className="h-4 w-4" />
              Novo convênio
            </button>
          </div>
        }
      />

      <section className="glass-panel space-y-4 p-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Convênios cadastrados
            </h3>
            <p className="text-sm text-slate-500">
              {convenios.length} {convenios.length === 1 ? 'convênio encontrado' : 'convênios encontrados'}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="col-span-1 md:col-span-1">
            <label className="form-label flex items-center gap-2">
              <Filter className="h-4 w-4" /> Buscar
            </label>
            <input
              className="form-input"
              placeholder="Título ou código"
              value={filters.search || ''}
              onChange={(event) =>
                handleFilterChange({ search: event.target.value })
              }
            />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filters.status || ''}
              onChange={(event) =>
                handleFilterChange({
                  status: (event.target.value as ConvenioFilters['status']) || ''
                })
              }
            >
              <option value="">Todos</option>
              {convenioStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Secretaria</label>
            <select
              className="form-input"
              value={filters.secretariaId || ''}
              onChange={(event) =>
                handleFilterChange({
                  secretariaId: event.target.value
                })
              }
            >
              <option value="">Todas</option>
              {secretariaOptions.map((secretaria) => (
                <option key={secretaria.id} value={secretaria.id}>
                  {secretaria.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="relative overflow-x-auto rounded-3xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Convênio</th>
                <th className="px-4 py-3">Secretaria</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Vigência</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white/70">
              {paginatedConvenios.map((convenio) => (
                <tr key={convenio.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">
                      {convenio.titulo}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      {convenio.codigo}
                      <StatusBadge status={convenio.status} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {convenio.secretaria?.nome ?? '—'}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {formatCurrency(convenio.valorGlobal)}
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    {formatDate(convenio.dataInicioVigencia)} <br />{' '}
                    <span className="text-xs text-slate-400">
                      até {formatDate(convenio.dataFimVigencia)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/convenios/${convenio.id}`)}
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                        title="Ver detalhes"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Detalhes
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implementar no futuro
                          alert('Funcionalidade de etapas será implementada em breve');
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100"
                        title="Gerenciar etapas"
                      >
                        <ListChecks className="h-3.5 w-3.5" />
                        Etapas
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedConvenios.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-400">
              Nenhum convênio encontrado com os filtros atuais.
            </p>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600">
              Exibindo {startIndex + 1} a {Math.min(endIndex, convenios.length)} de{' '}
              {convenios.length} convênios
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={[
                      'rounded-xl px-3 py-2 text-sm font-semibold transition',
                      page === currentPage
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    ].join(' ')}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

