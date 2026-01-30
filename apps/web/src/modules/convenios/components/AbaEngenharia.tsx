import { useState } from "react";
import { Plus, Building, User, Calendar, FileText, BarChart3 } from "lucide-react";
import type { Convenio, ContratoExecucao } from "@/modules/shared/types";
import { formatDateBR } from "@/modules/shared/lib/date";
import { formatCurrency } from "@/modules/shared/ui/currency-input";
import { Progress } from "@/modules/shared/ui/progress";
import { Badge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { VincularContratoModal } from "./modals/VincularContratoModal";
import { NovaMedicaoModal } from "./modals/NovaMedicaoModal";

type Props = {
  convenio: Convenio;
  onUpdate: () => void;
};

export function AbaEngenharia({ convenio, onUpdate }: Props) {
  const [showVincularContrato, setShowVincularContrato] = useState(false);
  const [showNovaMedicao, setShowNovaMedicao] = useState(false);
  const [selectedContratoId, setSelectedContratoId] = useState<string | null>(null);
  const [selectedContratoOIS, setSelectedContratoOIS] = useState<string | null>(null);
  const contratos = convenio.contratos || [];

  const handleNovaMedicao = (contratoId: string, dataOIS?: string | null) => {
    setSelectedContratoId(contratoId);
    setSelectedContratoOIS(dataOIS || null);
    setShowNovaMedicao(true);
  };

  const modalidadeLabel: Record<string, string> = {
    PREGAO: "Pregão",
    TOMADA_PRECOS: "Tomada de Preços",
    CONCORRENCIA: "Concorrência",
    DISPENSA: "Dispensa",
    INEXIGIBILIDADE: "Inexigibilidade"
  };

  const calcularPercentual = (contrato: ContratoExecucao) => {
    const valorContrato = Number(contrato.valorContrato) || 0;
    const valorExecutado = contrato.medicoes?.reduce(
      (acc, m) => acc + Number(m.valorMedido || 0),
      0
    ) || 0;
    return valorContrato > 0 ? (valorExecutado / valorContrato) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Contratos de Execução
        </h3>
        {contratos.length === 0 && (
          <Button onClick={() => setShowVincularContrato(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Vincular Contrato
          </Button>
        )}
      </div>

      {contratos.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-muted p-8 text-center">
          <Building className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h4 className="mt-4 font-medium">
            Nenhum contrato vinculado
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Vincule um contrato de execução para acompanhar as medições
          </p>
          <Button onClick={() => setShowVincularContrato(true)} variant="secondary" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Vincular Contrato
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {contratos.map((contrato) => {
            const percentual = calcularPercentual(contrato);
            const valorContrato = Number(contrato.valorContrato) || 0;
            const totalMedido = contrato.medicoes?.reduce(
              (acc, m) => acc + Number(m.valorMedido || 0),
              0
            ) || 0;

            return (
              <div
                key={contrato.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
              >
                {/* Header do Contrato */}
                <div className="flex items-start justify-between border-b border-slate-100 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">
                        {contrato.numeroContrato || "Contrato sem número"}
                      </h4>
                      {contrato.modalidadeLicitacao && (
                        <Badge variant="secondary">
                          {modalidadeLabel[contrato.modalidadeLicitacao]}
                        </Badge>
                      )}
                    </div>
                    {contrato.contratadaNome && (
                      <p className="mt-1 text-sm text-slate-600">
                        {contrato.contratadaNome}
                        {contrato.contratadaCnpj && ` • CNPJ: ${contrato.contratadaCnpj}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Valor do Contrato</p>
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrency(valorContrato)}
                    </p>
                  </div>
                </div>

                {/* Body do Contrato */}
                <div className="p-4 space-y-4">
                  {/* Progresso */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Execução Física/Financeira</span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(totalMedido)} de {formatCurrency(valorContrato)}
                      </span>
                    </div>
                    <Progress value={percentual} showLabel size="md" />
                  </div>

                  {/* Informações em Grid */}
                  <div className="grid gap-4 md:grid-cols-4">
                    {contrato.numProcessoLicitatorio && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Processo Licitatório</p>
                          <p className="text-sm font-medium text-slate-900">
                            {contrato.numProcessoLicitatorio}
                          </p>
                        </div>
                      </div>
                    )}
                    {contrato.dataOIS && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">OIS</p>
                          <p className="text-sm font-medium">
                            {formatDateBR(contrato.dataOIS)}
                          </p>
                        </div>
                      </div>
                    )}
                    {contrato.dataVigenciaFim && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Vigência</p>
                          <p className="text-sm font-medium">
                            {formatDateBR(contrato.dataVigenciaFim)}
                          </p>
                        </div>
                      </div>
                    )}
                    {contrato.engenheiroResponsavel && (
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Engenheiro</p>
                          <p className="text-sm font-medium text-slate-900">
                            {contrato.engenheiroResponsavel}
                          </p>
                          {contrato.creaEngenheiro && (
                            <p className="text-xs text-slate-500">
                              CREA: {contrato.creaEngenheiro}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Informações de Execução */}
                  {(contrato.cno || contrato.prazoExecucaoDias || contrato.dataTerminoExecucao) && (
                    <div className="grid gap-4 md:grid-cols-3 mt-2 pt-2 border-t border-slate-100">
                      {contrato.cno && (
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500">CNO</p>
                            <p className="text-sm font-medium text-slate-900">
                              {contrato.cno}
                            </p>
                          </div>
                        </div>
                      )}
                      {contrato.prazoExecucaoDias && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500">Prazo de Execução</p>
                            <p className="text-sm font-medium text-slate-900">
                              {contrato.prazoExecucaoDias} dias
                            </p>
                          </div>
                        </div>
                      )}
                      {contrato.dataTerminoExecucao && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500">Término Previsto</p>
                            <p className="text-sm font-medium text-slate-900">
                              {formatDateBR(contrato.dataTerminoExecucao)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lista de Medições */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-slate-700">
                        Medições ({contrato.medicoes?.length || 0})
                      </h5>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleNovaMedicao(contrato.id, contrato.dataOIS)}
                      >
                        <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                        Nova Medição
                      </Button>
                    </div>
                    {contrato.medicoes && contrato.medicoes.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-slate-600">
                                Nº
                              </th>
                              <th className="px-3 py-2 text-left font-medium text-slate-600">
                                Data
                              </th>
                              <th className="px-3 py-2 text-right font-medium text-slate-600">
                                Valor Medido
                              </th>
                              <th className="px-3 py-2 text-right font-medium text-slate-600">
                                Valor Pago
                              </th>
                              <th className="px-3 py-2 text-center font-medium text-slate-600">
                                %
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {contrato.medicoes.map((medicao) => (
                              <tr key={medicao.id}>
                                <td className="px-3 py-2 font-medium text-slate-900">
                                  {medicao.numeroMedicao}
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">
                                  {formatDateBR(medicao.dataMedicao)}
                                </td>
                                <td className="px-3 py-2 text-right text-slate-900">
                                  {formatCurrency(Number(medicao.valorMedido))}
                                </td>
                                <td className="px-3 py-2 text-right text-emerald-600">
                                  {medicao.valorPago
                                    ? formatCurrency(Number(medicao.valorPago))
                                    : "—"}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {medicao.percentualFisico
                                    ? `${Number(medicao.percentualFisico).toFixed(1)}%`
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">
                        Nenhuma medição registrada
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <VincularContratoModal
        isOpen={showVincularContrato}
        onClose={() => setShowVincularContrato(false)}
        convenioId={convenio.id}
        onSuccess={onUpdate}
      />

      {selectedContratoId && (
        <NovaMedicaoModal
          isOpen={showNovaMedicao}
          onClose={() => {
            setShowNovaMedicao(false);
            setSelectedContratoId(null);
            setSelectedContratoOIS(null);
          }}
          contratoId={selectedContratoId}
          convenioId={convenio.id}
          dataOIS={selectedContratoOIS}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
}

