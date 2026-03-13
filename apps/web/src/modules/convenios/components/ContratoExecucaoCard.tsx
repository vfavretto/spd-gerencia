import { Fragment } from "react";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileSignature,
  FileText,
  Pencil,
  Trash2,
  User
} from "lucide-react";
import type { ContratoExecucao, Convenio, Medicao } from "@/modules/shared/types";
import { formatDateBR } from "@/modules/shared/lib/date";
import { formatCurrency } from "@/modules/shared/utils/format";
import { Progress } from "@/modules/shared/ui/progress";
import { Badge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { getContratoMedidoTotal, getContratoPercentualExecutado, modalidadeLicitacaoLabels } from "@/modules/convenios/lib/engenharia";

type ContratoExecucaoCardProps = {
  contrato: ContratoExecucao;
  aditivos: NonNullable<Convenio["aditivos"]>;
  expandedMedicoes: Set<string>;
  canEditContrato: boolean;
  canEditAditivo: boolean;
  canEditMedicao: boolean;
  onEditContrato: (contrato: ContratoExecucao) => void;
  onAditivarContrato: (contrato: ContratoExecucao) => void;
  onNovaMedicao: (contratoId: string, dataOIS?: string | null) => void;
  onToggleMedicao: (medicaoId: string) => void;
  onEditMedicao: (medicao: Medicao, contratoId: string) => void;
  onDeleteMedicao: (contratoId: string, medicaoId: string) => void;
};

export function ContratoExecucaoCard({
  contrato,
  aditivos,
  expandedMedicoes,
  canEditContrato,
  canEditAditivo,
  canEditMedicao,
  onEditContrato,
  onAditivarContrato,
  onNovaMedicao,
  onToggleMedicao,
  onEditMedicao,
  onDeleteMedicao
}: ContratoExecucaoCardProps) {
  const percentual = getContratoPercentualExecutado(contrato);
  const valorContrato = Number(contrato.valorContrato) || 0;
  const totalMedido = getContratoMedidoTotal(contrato);
  const medicoes = contrato.medicoes ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between border-b border-slate-100 p-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900">{contrato.numeroContrato || "Contrato sem número"}</h4>
            {contrato.modalidadeLicitacao && (
              <Badge variant="secondary">{modalidadeLicitacaoLabels[contrato.modalidadeLicitacao]}</Badge>
            )}
          </div>
          {contrato.contratadaNome && (
            <p className="mt-1 text-sm text-slate-600">
              {contrato.contratadaNome}
              {contrato.contratadaCnpj && ` • CNPJ: ${contrato.contratadaCnpj}`}
            </p>
          )}
        </div>
        <div className="flex items-start gap-3">
          <div className="text-right">
            <p className="text-sm text-slate-500">Valor do Contrato</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(valorContrato)}</p>
            {Number(contrato.valorCPExclusiva) > 0 && (
              <p className="mt-0.5 text-xs text-amber-600">
                CP Exclusiva: {formatCurrency(Number(contrato.valorCPExclusiva))}
              </p>
            )}
          </div>
          {canEditContrato && (
            <Button size="sm" variant="outline" onClick={() => onEditContrato(contrato)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-600">Execução Física/Financeira</span>
            <span className="font-medium text-slate-900">
              {formatCurrency(totalMedido)} de {formatCurrency(valorContrato)}
            </span>
          </div>
          <Progress value={percentual} showLabel size="md" />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {contrato.numProcessoLicitatorio && (
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Processo Licitatório</p>
                <p className="text-sm font-medium text-slate-900">{contrato.numProcessoLicitatorio}</p>
              </div>
            </div>
          )}
          {contrato.dataOIS && (
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">OIS</p>
                <p className="text-sm font-medium">{formatDateBR(contrato.dataOIS)}</p>
              </div>
            </div>
          )}
          {contrato.dataVigenciaFim && (
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Vigência</p>
                <p className="text-sm font-medium">{formatDateBR(contrato.dataVigenciaFim)}</p>
              </div>
            </div>
          )}
          {contrato.engenheiroResponsavel && (
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Engenheiro</p>
                <p className="text-sm font-medium text-slate-900">{contrato.engenheiroResponsavel}</p>
                {contrato.creaEngenheiro && (
                  <p className="text-xs text-slate-500">CREA: {contrato.creaEngenheiro}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {(contrato.cno || contrato.prazoExecucaoDias || contrato.dataTerminoExecucao) && (
          <div className="mt-2 grid gap-4 border-t border-slate-100 pt-2 md:grid-cols-3">
            {contrato.cno && (
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">CNO</p>
                  <p className="text-sm font-medium text-slate-900">{contrato.cno}</p>
                </div>
              </div>
            )}
            {contrato.prazoExecucaoDias && (
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Prazo de Execução</p>
                  <p className="text-sm font-medium text-slate-900">{contrato.prazoExecucaoDias} dias</p>
                </div>
              </div>
            )}
            {contrato.dataTerminoExecucao && (
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Término Previsto</p>
                  <p className="text-sm font-medium text-slate-900">{formatDateBR(contrato.dataTerminoExecucao)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h5 className="text-sm font-medium text-slate-700">Medições ({medicoes.length})</h5>
            <div className="flex items-center gap-2">
              {canEditAditivo && (
                <Button size="sm" variant="outline" onClick={() => onAditivarContrato(contrato)}>
                  <FileSignature className="mr-1.5 h-3.5 w-3.5" />
                  Aditivar Contrato
                </Button>
              )}
              {canEditMedicao && (
                <Button size="sm" variant="secondary" onClick={() => onNovaMedicao(contrato.id, contrato.dataOIS)}>
                  <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                  Nova Medição
                </Button>
              )}
            </div>
          </div>
          {medicoes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="w-8 px-3 py-2 text-left font-medium text-slate-600"></th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Nº</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Data</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-600">Valor Medido</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-600">Valor Pago</th>
                    <th className="px-3 py-2 text-center font-medium text-slate-600">%</th>
                    {canEditMedicao && (
                      <th className="px-3 py-2 text-right font-medium text-slate-600">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicoes.map((medicao) => {
                    const isExpanded = expandedMedicoes.has(medicao.id);

                    return (
                      <Fragment key={medicao.id}>
                        <tr
                          className="cursor-pointer transition-colors hover:bg-slate-50"
                          onClick={() => onToggleMedicao(medicao.id)}
                        >
                          <td className="px-3 py-2 text-slate-400">
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-900">{medicao.numeroMedicao}</td>
                          <td className="px-3 py-2 text-muted-foreground">{formatDateBR(medicao.dataMedicao)}</td>
                          <td className="px-3 py-2 text-right text-slate-900">
                            {formatCurrency(Number(medicao.valorMedido))}
                          </td>
                          <td className="px-3 py-2 text-right text-emerald-600">
                            {medicao.valorPago ? formatCurrency(Number(medicao.valorPago)) : "—"}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {medicao.percentualFisico ? `${Number(medicao.percentualFisico).toFixed(1)}%` : "—"}
                          </td>
                          {canEditMedicao && (
                            <td className="px-3 py-2 text-right">
                              <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => onEditMedicao(medicao, contrato.id)}
                                  title="Editar medição"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={() => onDeleteMedicao(contrato.id, medicao.id)}
                                  title="Excluir medição"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={canEditMedicao ? 7 : 6} className="bg-slate-50/50 px-6 py-3">
                              <div className="grid gap-3 text-sm md:grid-cols-3">
                                {medicao.situacao && (
                                  <div>
                                    <p className="text-xs text-slate-500">Situação</p>
                                    <p className="font-medium capitalize text-slate-800">{medicao.situacao}</p>
                                  </div>
                                )}
                                {medicao.processoMedicao && (
                                  <div>
                                    <p className="text-xs text-slate-500">Nº do Processo</p>
                                    <p className="font-medium text-slate-800">{medicao.processoMedicao}</p>
                                  </div>
                                )}
                                {medicao.dataPagamento && (
                                  <div>
                                    <p className="text-xs text-slate-500">Data do Pagamento</p>
                                    <p className="font-medium text-slate-800">{formatDateBR(medicao.dataPagamento)}</p>
                                  </div>
                                )}
                                {medicao.observacoes && (
                                  <div className="md:col-span-3">
                                    <p className="text-xs text-slate-500">Observações</p>
                                    <p className="text-slate-700">{medicao.observacoes}</p>
                                  </div>
                                )}
                                {!medicao.situacao &&
                                  !medicao.processoMedicao &&
                                  !medicao.dataPagamento &&
                                  !medicao.observacoes && (
                                    <p className="text-xs text-slate-400 md:col-span-3">
                                      Nenhuma informação adicional registrada.
                                    </p>
                                  )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-slate-500">Nenhuma medição registrada</p>
          )}
        </div>

        {aditivos.length > 0 && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <h5 className="text-sm font-medium text-slate-700">
              Histórico de Aditivos do Contrato ({aditivos.length})
            </h5>
            <div className="space-y-2">
              {aditivos.map((aditivo) => (
                <div
                  key={aditivo.id}
                  className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {aditivo.numeroAditivo}º Aditivo - {aditivo.tipoAditivo.replace("_", " ")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {aditivo.dataAssinatura && formatDateBR(aditivo.dataAssinatura)}
                      {aditivo.motivo && ` • ${aditivo.motivo}`}
                    </p>
                  </div>
                  {(aditivo.valorAcrescimo || aditivo.valorSupressao) && (
                    <div className="text-right text-xs">
                      {aditivo.valorAcrescimo && (
                        <p className="text-emerald-700">+ {formatCurrency(Number(aditivo.valorAcrescimo))}</p>
                      )}
                      {aditivo.valorSupressao && (
                        <p className="text-rose-700">- {formatCurrency(Number(aditivo.valorSupressao))}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
