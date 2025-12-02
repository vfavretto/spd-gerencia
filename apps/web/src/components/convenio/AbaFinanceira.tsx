import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Save, X, Wallet, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Convenio } from '../../types';
import { financeiroService } from '../../services/financeiroService';
import { formatCurrency } from '../../utils/format';
// MaskedInput removido - usando inputs nativos

type Props = {
  convenio: Convenio;
  onUpdate: () => void;
};

export function AbaFinanceira({ convenio, onUpdate }: Props) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const financeiro = convenio.financeiroContas;

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      banco: financeiro?.banco || '',
      agencia: financeiro?.agencia || '',
      contaBancaria: financeiro?.contaBancaria || '',
      valorLiberadoTotal: financeiro?.valorLiberadoTotal
        ? Number(financeiro.valorLiberadoTotal)
        : undefined,
      saldoRendimentos: financeiro?.saldoRendimentos
        ? Number(financeiro.saldoRendimentos)
        : undefined,
      fichasOrcamentarias: financeiro?.fichasOrcamentarias || '',
      observacoes: financeiro?.observacoes || ''
    }
  });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => financeiroService.upsert(convenio.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenio', String(convenio.id)] });
      setIsEditing(false);
      onUpdate();
    }
  });

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const onSubmit = (data: any) => {
    upsertMutation.mutate(data);
  };

  // Calcular valores
  const valorGlobal = Number(convenio.valorGlobal) || 0;
  const valorRepasse = Number(convenio.valorRepasse) || 0;
  const valorContrapartida = Number(convenio.valorContrapartida) || 0;
  const valorLiberado = Number(financeiro?.valorLiberadoTotal) || 0;
  const saldoRendimentos = Number(financeiro?.saldoRendimentos) || 0;

  const valorContratado = convenio.contratos?.reduce(
    (acc, c) => acc + Number(c.valorContrato || 0),
    0
  ) || 0;

  const valorPago = convenio.contratos?.reduce(
    (acc, c) =>
      acc + (c.medicoes?.reduce((m, med) => m + Number(med.valorPago || 0), 0) || 0),
    0
  ) || 0;

  const saldoDisponivel = valorLiberado + saldoRendimentos - valorPago;

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Dados Financeiros</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={upsertMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {upsertMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        {/* Dados Bancários */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Dados Bancários
          </h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="form-label">Banco</label>
              <input className="form-input" {...register('banco')} placeholder="Ex: Caixa Econômica" />
            </div>
            <div>
              <label className="form-label">Agência</label>
              <input className="form-input" {...register('agencia')} placeholder="0000" />
            </div>
            <div>
              <label className="form-label">Conta</label>
              <input className="form-input" {...register('contaBancaria')} placeholder="00000-0" />
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Valores
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Valor Liberado Total</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                {...register('valorLiberadoTotal', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v))
                })}
              />
            </div>
            <div>
              <label className="form-label">Saldo de Rendimentos</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                {...register('saldoRendimentos', {
                  setValueAs: (v) => (v === '' ? undefined : Number(v))
                })}
              />
            </div>
          </div>
        </div>

        {/* Fichas Orçamentárias */}
        <div>
          <label className="form-label">Fichas Orçamentárias</label>
          <textarea
            className="form-input"
            rows={2}
            {...register('fichasOrcamentarias')}
            placeholder="Informe as fichas orçamentárias vinculadas"
          />
        </div>

        <div>
          <label className="form-label">Observações</label>
          <textarea
            className="form-input"
            rows={2}
            {...register('observacoes')}
          />
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Dados Financeiros</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          <Edit2 className="h-4 w-4" />
          Editar
        </button>
      </div>

      {/* Cards de Valores */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-4 text-white">
          <p className="text-sm opacity-80">Valor Global</p>
          <p className="text-2xl font-bold">{formatCurrency(valorGlobal)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white">
          <p className="text-sm opacity-80">Repasse</p>
          <p className="text-2xl font-bold">{formatCurrency(valorRepasse)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-4 text-white">
          <p className="text-sm opacity-80">Contrapartida</p>
          <p className="text-2xl font-bold">{formatCurrency(valorContrapartida)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 p-4 text-white">
          <p className="text-sm opacity-80">Saldo Disponível</p>
          <p className="text-2xl font-bold">{formatCurrency(saldoDisponivel)}</p>
        </div>
      </div>

      {/* Dados Bancários */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-700 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Dados Bancários
        </h4>
        {financeiro?.banco ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">Banco</p>
              <p className="font-medium text-slate-900">{financeiro.banco}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">Agência</p>
              <p className="font-medium text-slate-900">{financeiro.agencia || '—'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">Conta</p>
              <p className="font-medium text-slate-900">{financeiro.contaBancaria || '—'}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm text-slate-500">Dados bancários não informados</p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Adicionar dados bancários
            </button>
          </div>
        )}
      </div>

      {/* Tabela de Movimentação */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-700 flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Resumo de Movimentação
        </h4>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Descrição</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 text-slate-700">Valor Liberado</td>
                <td className="px-4 py-3 text-right font-medium text-emerald-600">
                  + {formatCurrency(valorLiberado)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700">Rendimentos</td>
                <td className="px-4 py-3 text-right font-medium text-emerald-600">
                  + {formatCurrency(saldoRendimentos)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700">Total Contratado</td>
                <td className="px-4 py-3 text-right font-medium text-slate-600">
                  {formatCurrency(valorContratado)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-slate-700">Total Pago</td>
                <td className="px-4 py-3 text-right font-medium text-rose-600">
                  - {formatCurrency(valorPago)}
                </td>
              </tr>
              <tr className="bg-slate-50 font-semibold">
                <td className="px-4 py-3 text-slate-900">Saldo em Conta</td>
                <td className="px-4 py-3 text-right text-slate-900">
                  {formatCurrency(saldoDisponivel)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fichas Orçamentárias */}
      {financeiro?.fichasOrcamentarias && (
        <div className="space-y-2">
          <h4 className="font-medium text-slate-700">Fichas Orçamentárias</h4>
          <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
            {financeiro.fichasOrcamentarias}
          </p>
        </div>
      )}
    </div>
  );
}

