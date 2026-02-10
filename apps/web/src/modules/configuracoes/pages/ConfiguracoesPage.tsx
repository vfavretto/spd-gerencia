import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Pencil, Plus, RefreshCcw, Trash2, UserPlus, Users, Shield,
  Building2, Landmark, BookOpen, Wallet, ScrollText, History
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { usePermissions } from "@/modules/shared/hooks/usePermissions";
import { configService } from "@/modules/configuracoes/services/configService";
import { authService } from "@/modules/auth/services/authService";
import { auditoriaService } from "@/modules/configuracoes/services/auditoriaService";
import { snapshotService } from "@/modules/configuracoes/services/snapshotService";
import { convenioService } from "@/modules/convenios/services/convenioService";
import { formatDate } from "@/modules/shared/utils/format";
import type { UsuarioRole } from "@/modules/shared/types";

type ResourceKey = "secretarias" | "orgaos" | "programas" | "fontes";

type FieldConfig = {
  name: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
  required?: boolean;
};

type SectionConfig = {
  key: ResourceKey;
  title: string;
  description: string;
  fields: FieldConfig[];
  columns: Array<{ key: string; label: string }>;
};

type CatalogItem = {
  id: string;
  nome: string;
  [key: string]: string | number | null | undefined;
};

type Catalogs = Record<ResourceKey, CatalogItem[]>;

const sections: SectionConfig[] = [
  {
    key: "secretarias",
    title: "Secretarias",
    description: "Cadastro das secretarias vinculadas aos convênios.",
    fields: [
      { name: "nome", label: "Nome", placeholder: "Secretaria de Planejamento", required: true },
      { name: "sigla", label: "Sigla", placeholder: "SPD" },
      { name: "responsavel", label: "Responsável", placeholder: "Nome do gestor" }
    ],
    columns: [
      { key: "nome", label: "Nome" },
      { key: "sigla", label: "Sigla" },
      { key: "responsavel", label: "Responsável" }
    ]
  },
  {
    key: "orgaos",
    title: "Órgãos concedentes",
    description: "Manutenção dos órgãos estaduais ou federais parceiros.",
    fields: [
      { name: "nome", label: 'Nome', required: true },
      { name: 'esfera', label: 'Esfera', placeholder: 'Federal / Estadual' },
      { name: 'contato', label: 'Contato', placeholder: 'email@orgao.gov.br' }
    ],
    columns: [
      { key: 'nome', label: 'Órgão' },
      { key: 'esfera', label: 'Esfera' },
      { key: 'contato', label: 'Contato' }
    ]
  },
  {
    key: 'programas',
    title: 'Programas',
    description: 'Programas ou linhas de financiamento utilizadas.',
    fields: [
      { name: 'nome', label: 'Nome', required: true },
      { name: 'codigo', label: 'Código', placeholder: 'PCS-001' },
      { name: 'descricao', label: 'Descrição', textarea: true }
    ],
    columns: [
      { key: 'nome', label: 'Programa' },
      { key: 'codigo', label: 'Código' },
      { key: 'descricao', label: 'Descrição' }
    ]
  },
  {
    key: 'fontes',
    title: 'Fontes de recurso',
    description: 'Origem dos recursos utilizados nos convênios.',
    fields: [
      { name: 'nome', label: 'Nome', required: true },
      { name: 'tipo', label: 'Tipo', placeholder: 'Própria, Transferência...' }
    ],
    columns: [
      { key: 'nome', label: 'Fonte' },
      { key: 'tipo', label: 'Tipo' }
    ]
  }
];

type FormValues = Record<string, string>;

type ConfigSectionProps = {
  section: SectionConfig;
  data: CatalogItem[];
};

const ConfigSection: React.FC<ConfigSectionProps> = ({ section, data = [] }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const { isAdmin } = usePermissions();

  const defaultValues = useMemo(
    () =>
      section.fields.reduce<FormValues>((acc, field) => {
        acc[field.name] = '';
        return acc;
      }, {}),
    [section.fields]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<FormValues>({
    defaultValues
  });

  useEffect(() => {
    if (editing) {
      const values: FormValues = { ...defaultValues };
      section.fields.forEach((field) => {
        const value = editing[field.name];
        values[field.name] = value != null ? String(value) : "";
      });
      reset(values);
    } else {
      reset(defaultValues);
    }
  }, [editing, defaultValues, reset, section.fields]);

  const mutation = useMutation({
    mutationFn: (payload: FormValues) => {
      if (editing) {
        return configService.update(section.key, editing.id, payload);
      }
      return configService.create(section.key, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      setEditing(null);
      reset(defaultValues);
    },
    onError: () => {
      toast.error("Erro ao salvar configuração. Verifique os dados e tente novamente.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => configService.remove(section.key, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
    },
    onError: () => {
      toast.error("Erro ao remover registro. Este item pode estar sendo usado em outro lugar.");
    }
  });

  const onSubmit = (formValues: FormValues) => {
    mutation.mutate(formValues);
  };

  return (
    <section className="glass-panel flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
        <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
        <p className="text-sm text-slate-500">{section.description}</p>
      </div>

      {isAdmin && (
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.name} className={field.textarea ? "md:col-span-2" : ""}>
                <label className="form-label">
                  {field.label}
                  {editing && field.required && (
                    <span className="text-xs text-rose-500"> *</span>
                  )}
                </label>
                {field.textarea ? (
                  <textarea
                    rows={3}
                    {...register(field.name, { required: field.required })}
                    placeholder={field.placeholder}
                    className="form-input"
                  />
                ) : (
                  <input
                    {...register(field.name, { required: field.required })}
                    placeholder={field.placeholder}
                    className="form-input"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-3">
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={mutation.isPending || isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500 disabled:opacity-70"
            >
              <Plus className="h-4 w-4" />
              {editing ? "Atualizar" : "Adicionar"}
            </button>
          </div>
          {mutation.isSuccess && (
            <p className="text-sm text-emerald-600">
              ✓ Registro {editing ? "atualizado" : "criado"} com sucesso.
            </p>
          )}
          {mutation.isError && (
            <p className="text-sm text-rose-600">
              ✗ Erro ao salvar. Verifique os dados e tente novamente.
            </p>
          )}
        </form>
      )}

      <div className="overflow-x-auto rounded-3xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {section.columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
              {isAdmin && <th className="px-4 py-3 text-right">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white/80">
            {data.map((item) => (
              <tr key={item.id}>
                {section.columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-slate-700">
                    {item[column.key] ?? "—"}
                  </td>
                ))}
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(item)}
                        className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-primary-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">
            Nenhum registro cadastrado.
          </p>
        )}
      </div>
    </section>
  );
};

// ==================== SEÇÃO DE USUÁRIOS ====================

const registerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  matricula: z.string().min(1, "Matrícula é obrigatória"),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  role: z.enum(["ADMIN", "ANALISTA", "ESTAGIARIO", "OBSERVADOR"])
});

type RegisterForm = z.infer<typeof registerSchema>;

const roleLabels: Record<UsuarioRole, string> = {
  ADMIN: "Administrador",
  ANALISTA: "Analista",
  ESTAGIARIO: "Estagiário",
  OBSERVADOR: "Observador"
};

const roleBadgeColors: Record<UsuarioRole, string> = {
  ADMIN: "bg-indigo-100 text-indigo-700",
  ANALISTA: "bg-blue-100 text-blue-700",
  ESTAGIARIO: "bg-amber-100 text-amber-700",
  OBSERVADOR: "bg-slate-100 text-slate-600"
};

const UsersSection = () => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => authService.listUsers()
  });

  const {
    register: registerField,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "ANALISTA" }
  });

  const createMutation = useMutation({
    mutationFn: (data: RegisterForm) => authService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset({ role: "ANALISTA" } as RegisterForm);
    }
  });

  const users = usersQuery.data ?? [];

  return (
    <section className="glass-panel flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
          <Users className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Usuários do sistema</h3>
          <p className="text-sm text-slate-500">Cadastre e gerencie os servidores com acesso ao sistema.</p>
        </div>
      </div>

      {/* Formulário de cadastro */}
      <form className="grid gap-4" onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="form-label">Nome completo</label>
            <input
              className="form-input"
              {...registerField("nome")}
              placeholder="Nome do servidor"
            />
            {errors.nome && <p className="mt-1 text-xs text-rose-500">{errors.nome.message}</p>}
          </div>
          <div>
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-input"
              {...registerField("email")}
              placeholder="email@votorantim.sp.gov.br"
            />
            {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="form-label">Matrícula</label>
            <input
              className="form-input"
              {...registerField("matricula")}
              placeholder="Ex: 12345"
            />
            {errors.matricula && <p className="mt-1 text-xs text-rose-500">{errors.matricula.message}</p>}
          </div>
          <div>
            <label className="form-label">Senha inicial</label>
            <input
              type="password"
              className="form-input"
              {...registerField("senha")}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.senha && <p className="mt-1 text-xs text-rose-500">{errors.senha.message}</p>}
          </div>
          <div>
            <label className="form-label">Permissão</label>
            <select className="form-input" {...registerField("role")}>
              <option value="ANALISTA">Analista</option>
              <option value="ESTAGIARIO">Estagiário</option>
              <option value="OBSERVADOR">Observador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500 disabled:opacity-70"
          >
            <UserPlus className="h-4 w-4" />
            {createMutation.isPending ? "Cadastrando..." : "Cadastrar usuário"}
          </button>
        </div>
        {createMutation.isSuccess && (
          <p className="text-sm text-emerald-600">Usuário cadastrado com sucesso.</p>
        )}
        {createMutation.isError && (
          <p className="text-sm text-rose-600">
            Erro ao cadastrar: {(createMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Verifique os dados."}
          </p>
        )}
      </form>

      {/* Tabela de usuários */}
      <div className="overflow-x-auto rounded-3xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Matrícula</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Permissão</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white/80">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{user.nome}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{user.matricula}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeColors[user.role]}`}>
                    <Shield className="h-3 w-3" />
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${user.ativo ? "bg-emerald-400" : "bg-slate-300"}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">
            Nenhum usuário cadastrado.
          </p>
        )}
      </div>
    </section>
  );
};

// ==================== SEÇÃO DE AUDITORIA ====================

const AuditoriaSection = () => {
  const [filters, setFilters] = useState<{
    acao: string;
    entidade: string;
    dataInicio: string;
    dataFim: string;
  }>({ acao: "", entidade: "", dataInicio: "", dataFim: "" });
  const [page, setPage] = useState(1);

  const logsQuery = useQuery({
    queryKey: ["auditoria", filters, page],
    queryFn: () =>
      auditoriaService.list({
        acao: filters.acao || undefined,
        entidade: filters.entidade || undefined,
        dataInicio: filters.dataInicio || undefined,
        dataFim: filters.dataFim || undefined,
        page,
        limit: 15
      })
  });

  const result = logsQuery.data;
  const logs = result?.data ?? [];

  const acaoBadge: Record<string, string> = {
    CREATE: "bg-emerald-100 text-emerald-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-rose-100 text-rose-700"
  };

  const acaoLabel: Record<string, string> = {
    CREATE: "Criação",
    UPDATE: "Atualização",
    DELETE: "Exclusão"
  };

  return (
    <section className="glass-panel flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <ScrollText className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Logs de auditoria</h3>
          <p className="text-sm text-slate-500">Acompanhe todas as ações realizadas no sistema.</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <label className="form-label">Ação</label>
          <select
            className="form-input"
            value={filters.acao}
            onChange={(e) => { setFilters((p) => ({ ...p, acao: e.target.value })); setPage(1); }}
          >
            <option value="">Todas</option>
            <option value="CREATE">Criação</option>
            <option value="UPDATE">Atualização</option>
            <option value="DELETE">Exclusão</option>
          </select>
        </div>
        <div>
          <label className="form-label">Entidade</label>
          <select
            className="form-input"
            value={filters.entidade}
            onChange={(e) => { setFilters((p) => ({ ...p, entidade: e.target.value })); setPage(1); }}
          >
            <option value="">Todas</option>
            <option value="Convenio">Convênio</option>
            <option value="Comunicado">Comunicado</option>
            <option value="EventoAgenda">Evento</option>
            <option value="ContratoExecucao">Contrato</option>
            <option value="Pendencia">Pendência</option>
          </select>
        </div>
        <div>
          <label className="form-label">De</label>
          <input
            type="date"
            className="form-input"
            value={filters.dataInicio}
            onChange={(e) => { setFilters((p) => ({ ...p, dataInicio: e.target.value })); setPage(1); }}
          />
        </div>
        <div>
          <label className="form-label">Até</label>
          <input
            type="date"
            className="form-input"
            value={filters.dataFim}
            onChange={(e) => { setFilters((p) => ({ ...p, dataFim: e.target.value })); setPage(1); }}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-3xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Entidade</th>
              <th className="px-4 py-3">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white/80">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDate(log.criadoEm)}
                </td>
                <td className="px-4 py-3 text-slate-700">{log.usuarioNome}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${acaoBadge[log.acao] ?? "bg-slate-100 text-slate-600"}`}>
                    {acaoLabel[log.acao] ?? log.acao}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{log.entidade}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {log.entidadeId.slice(0, 8)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">
            Nenhum registro de auditoria encontrado.
          </p>
        )}
      </div>

      {/* Paginação */}
      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Página {result.page} de {result.totalPages} ({result.total} registros)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold transition hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= result.totalPages}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold transition hover:bg-slate-50 disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

// ==================== SEÇÃO DE SNAPSHOTS ====================

const SnapshotsSection = () => {
  const [selectedConvenioId, setSelectedConvenioId] = useState<string>("");
  const [compareVersions, setCompareVersions] = useState<{ v1: number; v2: number } | null>(null);

  const conveniosQuery = useQuery({
    queryKey: ["convenios-lite-snapshots"],
    queryFn: () => convenioService.list()
  });

  const snapshotsQuery = useQuery({
    queryKey: ["snapshots", selectedConvenioId],
    queryFn: () => snapshotService.listByConvenio(selectedConvenioId),
    enabled: Boolean(selectedConvenioId)
  });

  const compareQuery = useQuery({
    queryKey: ["snapshot-compare", selectedConvenioId, compareVersions],
    queryFn: () =>
      snapshotService.compare(selectedConvenioId, compareVersions!.v1, compareVersions!.v2),
    enabled: Boolean(selectedConvenioId && compareVersions)
  });

  const convenios = conveniosQuery.data ?? [];
  const snapshots = snapshotsQuery.data ?? [];
  const diff = compareQuery.data;

  return (
    <section className="glass-panel flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
          <History className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Snapshots de convênios</h3>
          <p className="text-sm text-slate-500">Visualize versões históricas e compare alterações.</p>
        </div>
      </div>

      {/* Seleção de convênio */}
      <div className="max-w-md">
        <label className="form-label">Selecionar convênio</label>
        <select
          className="form-input"
          value={selectedConvenioId}
          onChange={(e) => {
            setSelectedConvenioId(e.target.value);
            setCompareVersions(null);
          }}
        >
          <option value="">Escolha um convênio...</option>
          {convenios.map((c) => (
            <option key={c.id} value={c.id}>
              {c.codigo} - {c.titulo}
            </option>
          ))}
        </select>
      </div>

      {selectedConvenioId && snapshotsQuery.isLoading && (
        <p className="text-sm text-slate-400">Carregando snapshots...</p>
      )}

      {selectedConvenioId && snapshots.length === 0 && !snapshotsQuery.isLoading && (
        <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
          Nenhum snapshot encontrado para este convênio.
        </div>
      )}

      {snapshots.length > 0 && (
        <>
          {/* Lista de versões */}
          <div className="overflow-x-auto rounded-3xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Versão</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Criado por</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3 text-center">Comparar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white/80">
                {snapshots.map((snap) => (
                  <tr key={snap.id}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">v{snap.versao}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(snap.criadoEm)}</td>
                    <td className="px-4 py-3 text-slate-700">{snap.criadoPorNome ?? "Sistema"}</td>
                    <td className="px-4 py-3 text-slate-500">{snap.motivoSnapshot ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            setCompareVersions((prev) =>
                              prev ? { ...prev, v1: snap.versao } : { v1: snap.versao, v2: snap.versao }
                            )
                          }
                          className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                            compareVersions?.v1 === snap.versao
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          V1
                        </button>
                        <button
                          onClick={() =>
                            setCompareVersions((prev) =>
                              prev ? { ...prev, v2: snap.versao } : { v1: snap.versao, v2: snap.versao }
                            )
                          }
                          className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                            compareVersions?.v2 === snap.versao
                              ? "bg-violet-600 text-white"
                              : "bg-violet-50 text-violet-600 hover:bg-violet-100"
                          }`}
                        >
                          V2
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Comparação */}
          {compareVersions && compareVersions.v1 !== compareVersions.v2 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700">
                Comparando v{compareVersions.v1} → v{compareVersions.v2}
              </h4>
              {compareQuery.isLoading && (
                <p className="text-sm text-slate-400">Carregando comparação...</p>
              )}
              {diff && diff.diferencas.length === 0 && (
                <p className="text-sm text-slate-400">Nenhuma diferença encontrada entre as versões.</p>
              )}
              {diff && diff.diferencas.length > 0 && (
                <div className="overflow-x-auto rounded-3xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Campo</th>
                        <th className="px-4 py-3">Valor anterior</th>
                        <th className="px-4 py-3">Valor novo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white/80">
                      {diff.diferencas.map((d, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 font-medium text-slate-800">{d.campo}</td>
                          <td className="px-4 py-3 text-rose-600">
                            {d.valorAnterior != null ? String(d.valorAnterior) : "—"}
                          </td>
                          <td className="px-4 py-3 text-emerald-600">
                            {d.valorNovo != null ? String(d.valorNovo) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

// ==================== PÁGINA PRINCIPAL COM ABAS ====================

type TabKey = "usuarios" | "secretarias" | "orgaos" | "programas" | "fontes" | "auditoria" | "snapshots";

type TabConfig = {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
};

export const ConfiguracoesPage = () => {
  const { isAdmin } = usePermissions();

  const allTabs: TabConfig[] = [
    { key: "usuarios", label: "Usuários", icon: <Users className="h-4 w-4" />, adminOnly: true },
    { key: "secretarias", label: "Secretarias", icon: <Building2 className="h-4 w-4" /> },
    { key: "orgaos", label: "Órgãos", icon: <Landmark className="h-4 w-4" /> },
    { key: "programas", label: "Programas", icon: <BookOpen className="h-4 w-4" /> },
    { key: "fontes", label: "Fontes", icon: <Wallet className="h-4 w-4" /> },
    { key: "auditoria", label: "Auditoria", icon: <ScrollText className="h-4 w-4" />, adminOnly: true },
    { key: "snapshots", label: "Snapshots", icon: <History className="h-4 w-4" />, adminOnly: true }
  ];

  const visibleTabs = allTabs.filter((tab) => !tab.adminOnly || isAdmin);
  const [activeTab, setActiveTab] = useState<TabKey>(visibleTabs[0]?.key ?? "secretarias");

  const catalogsQuery = useQuery({
    queryKey: ["catalogs"],
    queryFn: () => configService.getCatalogs()
  });

  const catalogs = catalogsQuery.data;

  const sectionByKey = (key: ResourceKey) =>
    sections.find((s) => s.key === key)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        subtitle="Mantenha cadastros auxiliares atualizados para agilizar os registros de convênios."
        actions={
          <button
            onClick={() => catalogsQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600"
          >
            <RefreshCcw className="h-4 w-4" />
            Recarregar dados
          </button>
        }
      />

      {/* Abas */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-100 bg-slate-50 p-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-white text-primary-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba ativa */}
      <div>
        {activeTab === "usuarios" && isAdmin && <UsersSection />}

        {activeTab === "secretarias" && (
          <ConfigSection
            section={sectionByKey("secretarias")}
            data={catalogs ? (catalogs as Catalogs).secretarias : []}
          />
        )}

        {activeTab === "orgaos" && (
          <ConfigSection
            section={sectionByKey("orgaos")}
            data={catalogs ? (catalogs as Catalogs).orgaos : []}
          />
        )}

        {activeTab === "programas" && (
          <ConfigSection
            section={sectionByKey("programas")}
            data={catalogs ? (catalogs as Catalogs).programas : []}
          />
        )}

        {activeTab === "fontes" && (
          <ConfigSection
            section={sectionByKey("fontes")}
            data={catalogs ? (catalogs as Catalogs).fontes : []}
          />
        )}

        {activeTab === "auditoria" && isAdmin && <AuditoriaSection />}

        {activeTab === "snapshots" && isAdmin && <SnapshotsSection />}
      </div>
    </div>
  );
};
