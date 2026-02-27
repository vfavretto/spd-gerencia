import { useMemo, useState } from "react";
import {
  Plus,
  Building,
  User,
  Calendar,
  FileText,
  BarChart3,
  Pencil,
  FileSignature,
  Info,
} from "lucide-react";
import type {
  Convenio,
  ContratoExecucao,
  ValoresVigentes,
} from "@/modules/shared/types";
import { formatDateBR } from "@/modules/shared/lib/date";
import { formatCurrency } from "@/modules/shared/utils/format";
import { Progress } from "@/modules/shared/ui/progress";
import { Badge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { usePermissions } from "@/modules/shared/hooks";
import { VincularContratoModal } from "./modals/VincularContratoModal";
import { NovaMedicaoModal } from "./modals/NovaMedicaoModal";
import { AditivarModal } from "./modals/AditivarModal";
import { MaisInformacoesEngenhariaModal } from "./modals/MaisInformacoesEngenhariaModal";

type Props = {
  convenio: Convenio;
  valoresVigentes?: ValoresVigentes;
  onUpdate: () => void;
};

export function AbaEngenharia({ convenio, valoresVigentes, onUpdate }: Props) {
  const { canWrite } = usePermissions();
  const [showVincularContrato, setShowVincularContrato] = useState(false);
  const [showNovaMedicao, setShowNovaMedicao] = useState(false);
  const [showAditivoContrato, setShowAditivoContrato] = useState(false);
  const [showMaisInformacoes, setShowMaisInformacoes] = useState(false);
  const [selectedContratoId, setSelectedContratoId] = useState<string | null>(
    null,
  );
  const [selectedContratoOIS, setSelectedContratoOIS] = useState<string | null>(
    null,
  );
  const [contratoParaEditar, setContratoParaEditar] =
    useState<ContratoExecucao | null>(null);
  const [contratoParaAditivo, setContratoParaAditivo] =
    useState<ContratoExecucao | null>(null);
  const contratos = convenio.contratos || [];

  const ajusteRepasse =
    Number(convenio.financeiroContas?.ajusteRepasseVigente) || 0;
  const ajusteContrapartida =
    Number(convenio.financeiroContas?.ajusteContrapartidaVigente) || 0;
  const repasseVigenteAtual =
    valoresVigentes?.valorRepasseVigente ??
    (Number(convenio.valorRepasse) || 0);
  const contrapartidaVigenteAtual =
    valoresVigentes?.valorContrapartidaVigente ??
    (Number(convenio.valorContrapartida) || 0);
  const repasseVigenteBase = repasseVigenteAtual - ajusteRepasse;
  const contrapartidaVigenteBase =
    contrapartidaVigenteAtual - ajusteContrapartida;

  const aditivosPorContrato = useMemo(() => {
    const mapa = new Map<string, NonNullable<Convenio["aditivos"]>>();
    const aditivos = convenio.aditivos ?? [];

    for (const aditivo of aditivos) {
      if (!aditivo.contratoId) continue;
      const lista = mapa.get(aditivo.contratoId) || [];
      lista.push(aditivo);
      mapa.set(aditivo.contratoId, lista);
    }

    return mapa;
  }, [convenio.aditivos]);

  const handleNovaMedicao = (contratoId: string, dataOIS?: string | null) => {
    setSelectedContratoId(contratoId);
    setSelectedContratoOIS(dataOIS || null);
    setShowNovaMedicao(true);
  };

  const handleEditarContrato = (contrato: ContratoExecucao) => {
    setContratoParaEditar(contrato);
    setShowVincularContrato(true);
  };

  const handleAditivarContrato = (contrato: ContratoExecucao) => {
    setContratoParaAditivo(contrato);
    setShowAditivoContrato(true);
  };

  const modalidadeLabel: Record<string, string> = {
    PREGAO: "Pregão",
    TOMADA_PRECOS: "Tomada de Preços",
    CONCORRENCIA: "Concorrência",
    DISPENSA: "Dispensa",
    INEXIGIBILIDADE: "Inexigibilidade",
  };

  const calcularPercentual = (contrato: ContratoExecucao) => {
    const valorContrato = Number(contrato.valorContrato) || 0;
    const valorExecutado =
      contrato.medicoes?.reduce(
        (acc, m) => acc + Number(m.valorMedido || 0),
        0,
      ) || 0;
    return valorContrato > 0 ? (valorExecutado / valorContrato) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contratos de Execução</h3>
        <div className="flex items-center gap-2">
          {canWrite("financeiro") && (
            <Button
              variant="outline"
              onClick={() => setShowMaisInformacoes(true)}
            >
              <Info className="h-4 w-4 mr-2" />
              Mais Informações
            </Button>
          )}
          {contratos.length === 0 && canWrite("contrato") && (
            <Button onClick={() => setShowVincularContrato(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Vincular Contrato
            </Button>
          )}
        </div>
      </div>

      {contratos.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-muted p-8 text-center">
          <Building className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h4 className="mt-4 font-medium">Nenhum contrato vinculado</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Vincule um contrato de execução para acompanhar as medições
          </p>
          {canWrite("contrato") && (
            <Button
              onClick={() => setShowVincularContrato(true)}
              variant="secondary"
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Vincular Contrato
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {contratos.map((contrato) => {
            const percentual = calcularPercentual(contrato);
            const valorContrato = Number(contrato.valorContrato) || 0;
            const totalMedido =
              contrato.medicoes?.reduce(
                (acc, m) => acc + Number(m.valorMedido || 0),
                0,
              ) || 0;
            const historicoAditivosContrato =
              aditivosPorContrato.get(contrato.id) || [];

            return (
              <div
                key={contrato.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
              >
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
                        {contrato.contratadaCnpj &&
                          ` • CNPJ: ${contrato.contratadaCnpj}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">
                        Valor do Contrato
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(valorContrato)}
                      </p>
                      {Number(contrato.valorCPExclusiva) > 0 && (
                        <p className="text-xs text-amber-600 mt-0.5">
                          CP Exclusiva:{" "}
                          {formatCurrency(Number(contrato.valorCPExclusiva))}
                        </p>
                      )}
                    </div>
                    {canWrite("contrato") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditarContrato(contrato)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">
                        Execução Física/Financeira
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(totalMedido)} de{" "}
                        {formatCurrency(valorContrato)}
                      </span>
                    </div>
                    <Progress value={percentual} showLabel size="md" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    {contrato.numProcessoLicitatorio && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">
                            Processo Licitatório
                          </p>
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
                          <p className="text-xs text-muted-foreground">
                            Vigência
                          </p>
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

                  {(contrato.cno ||
                    contrato.prazoExecucaoDias ||
                    contrato.dataTerminoExecucao) && (
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
                            <p className="text-xs text-slate-500">
                              Prazo de Execução
                            </p>
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
                            <p className="text-xs text-slate-500">
                              Término Previsto
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                              {formatDateBR(contrato.dataTerminoExecucao)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-slate-700">
                        Medições ({contrato.medicoes?.length || 0})
                      </h5>
                      <div className="flex items-center gap-2">
                        {canWrite("aditivo") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAditivarContrato(contrato)}
                          >
                            <FileSignature className="h-3.5 w-3.5 mr-1.5" />
                            Aditivar Contrato
                          </Button>
                        )}
                        {canWrite("medicao") && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              handleNovaMedicao(contrato.id, contrato.dataOIS)
                            }
                          >
                            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                            Nova Medição
                          </Button>
                        )}
                      </div>
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

                  {historicoAditivosContrato.length > 0 && (
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <h5 className="text-sm font-medium text-slate-700">
                        Histórico de Aditivos do Contrato (
                        {historicoAditivosContrato.length})
                      </h5>
                      <div className="space-y-2">
                        {historicoAditivosContrato.map((aditivo) => (
                          <div
                            key={aditivo.id}
                            className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {aditivo.numeroAditivo}º Aditivo -{" "}
                                {aditivo.tipoAditivo.replace("_", " ")}
                              </p>
                              <p className="text-xs text-slate-500">
                                {aditivo.dataAssinatura &&
                                  formatDateBR(aditivo.dataAssinatura)}
                                {aditivo.motivo && ` • ${aditivo.motivo}`}
                              </p>
                            </div>
                            {(aditivo.valorAcrescimo ||
                              aditivo.valorSupressao) && (
                              <div className="text-right text-xs">
                                {aditivo.valorAcrescimo && (
                                  <p className="text-emerald-700">
                                    +{" "}
                                    {formatCurrency(
                                      Number(aditivo.valorAcrescimo),
                                    )}
                                  </p>
                                )}
                                {aditivo.valorSupressao && (
                                  <p className="text-rose-700">
                                    -{" "}
                                    {formatCurrency(
                                      Number(aditivo.valorSupressao),
                                    )}
                                  </p>
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
          })}
        </div>
      )}

      <VincularContratoModal
        isOpen={showVincularContrato}
        onClose={() => {
          setShowVincularContrato(false);
          setContratoParaEditar(null);
        }}
        convenioId={convenio.id}
        contrato={contratoParaEditar}
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

      {contratoParaAditivo && (
        <AditivarModal
          isOpen={showAditivoContrato}
          onClose={() => {
            setShowAditivoContrato(false);
            setContratoParaAditivo(null);
          }}
          convenioId={convenio.id}
          contratoId={contratoParaAditivo.id}
          vigenciaAtual={contratoParaAditivo.dataVigenciaFim}
          numeroAditivos={
            (aditivosPorContrato.get(contratoParaAditivo.id) || []).length
          }
          onSuccess={onUpdate}
        />
      )}

      <MaisInformacoesEngenhariaModal
        isOpen={showMaisInformacoes}
        onClose={() => setShowMaisInformacoes(false)}
        convenioId={convenio.id}
        repasseBase={repasseVigenteBase}
        contrapartidaBase={contrapartidaVigenteBase}
        repasseAtual={repasseVigenteAtual}
        contrapartidaAtual={contrapartidaVigenteAtual}
        onSuccess={onUpdate}
      />
    </div>
  );
}
