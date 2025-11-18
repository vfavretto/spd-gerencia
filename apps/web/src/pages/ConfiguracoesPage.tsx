import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '../components/PageHeader';
import { configService } from '../services/configService';

type ResourceKey = 'secretarias' | 'orgaos' | 'programas' | 'fontes';

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

const sections: SectionConfig[] = [
  {
    key: 'secretarias',
    title: 'Secretarias',
    description: 'Cadastro das secretarias vinculadas aos convênios.',
    fields: [
      { name: 'nome', label: 'Nome', placeholder: 'Secretaria de Planejamento', required: true },
      { name: 'sigla', label: 'Sigla', placeholder: 'SPD' },
      { name: 'responsavel', label: 'Responsável', placeholder: 'Nome do gestor' }
    ],
    columns: [
      { key: 'nome', label: 'Nome' },
      { key: 'sigla', label: 'Sigla' },
      { key: 'responsavel', label: 'Responsável' }
    ]
  },
  {
    key: 'orgaos',
    title: 'Órgãos concedentes',
    description: 'Manutenção dos órgãos estaduais ou federais parceiros.',
    fields: [
      { name: 'nome', label: 'Nome', required: true },
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
  data: Record<string, any>[] | undefined;
};

const ConfigSection: React.FC<ConfigSectionProps> = ({ section, data = [] }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Record<string, any> | null>(null);

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
        values[field.name] = editing[field.name] ?? '';
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
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      setEditing(null);
      reset(defaultValues);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => configService.remove(section.key, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
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

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          {section.fields.map((field) => (
            <div key={field.name} className={field.textarea ? 'md:col-span-2' : ''}>
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
            {editing ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
        {mutation.isSuccess && (
          <p className="text-sm text-emerald-600">
            Registro {editing ? 'atualizado' : 'criado'} com sucesso.
          </p>
        )}
      </form>

      <div className="overflow-x-auto rounded-3xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {section.columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white/80">
            {data.map((item) => (
              <tr key={item.id}>
                {section.columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-slate-700">
                    {item[column.key] ?? '—'}
                  </td>
                ))}
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

export const ConfiguracoesPage = () => {
  const catalogsQuery = useQuery({
    queryKey: ['catalogs'],
    queryFn: () => configService.getCatalogs()
  });

  const catalogs = catalogsQuery.data;

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

      <div className="grid gap-6">
        {sections.map((section) => (
          <ConfigSection
            key={section.key}
            section={section}
            data={catalogs ? (catalogs as any)[section.key] : []}
          />
        ))}
      </div>
    </div>
  );
};
