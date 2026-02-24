import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Save, X, CalendarCheck, FileSignature, Plus, Pencil, Trash2, Landmark } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Convenio, EmendaParlamentar } from "@/modules/shared/types";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { convenioService } from "@/modules/convenios/services/convenioService";
import { configService } from "@/modules/configuracoes/services/configService";
import { emendaService } from "@/modules/convenios/services/emendaService";
import { formatDateBR } from "@/modules/shared/lib/date";
import { Button } from "@/modules/shared/ui/button";
import { Input } from "@/modules/shared/ui/input";
import { Label } from "@/modules/shared/ui/label";
import { toast } from "@/modules/shared/ui/toaster";
import { RegistrarAssinaturaModal } from "./modals/RegistrarAssinaturaModal";
import { AditivarModal } from "./modals/AditivarModal";
import { EmendaModal } from "./modals/EmendaModal";

type Props = {
  convenio: Convenio;
  onUpdate: () => void;
};

export function AbaGeral({ convenio, onUpdate }: Props) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showAssinaturaModal, setShowAssinaturaModal] = useState(false);
  const [showAditivoModal, setShowAditivoModal] = useState(false);
  const [showEmendaModal, setShowEmendaModal] = useState(false);
  const [emendaParaEditar, setEmendaParaEditar] = useState<EmendaParlamentar | null>(null);
  const [emendaParaDeletar, setEmendaParaDeletar] = useState<EmendaParlamentar | null>(null);

  const deletarEmendaMutation = useMutation({
    mutationFn: (emendaId: string) => emendaService.delete(convenio.id, emendaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenio", String(convenio.id)] });
      toast.success("Emenda removida com sucesso");
      onUpdate();
    },
    onError: () => {
      toast.error("Erro ao remover emenda");
    }
  });

  const handleEditarEmenda = (emenda: EmendaParlamentar) => {
    setEmendaParaEditar(emenda);
    setShowEmendaModal(true);
  };

  const handleNovaEmenda = () => {
    setEmendaParaEditar(null);
    setShowEmendaModal(true);
  };

  const handleDeletarEmenda = (emenda: EmendaParlamentar) => {
    setEmendaParaDeletar(emenda);
  };

  const { data: catalogs } = useQuery({
    queryKey: ["catalogs"],
    queryFn: () => configService.getCatalogs()
  });

  type ConvenioFormData = {
    codigo: string;
    titulo: string;
    objeto: string;
    descricao: string;
    numeroProposta: string;
    numeroTermo: string;
    dataAssinatura: string;
    dataInicioVigencia: string;
    dataFimVigencia: string;
    esfera: string;
    modalidadeRepasse: string;
    secretariaId: string | undefined;
    orgaoId: string | undefined;
    programaId: string | undefined;
    // Novos campos de processo
    processoSPD: string;
    processoCreditoAdicional: string;
    area: string;
  };

  const { register, handleSubmit, reset } = useForm<ConvenioFormData>({
    defaultValues: {
      codigo: convenio.codigo,
      titulo: convenio.titulo,
      objeto: convenio.objeto,
      descricao: convenio.descricao || "",
      numeroProposta: convenio.numeroProposta || '',
      numeroTermo: convenio.numeroTermo || '',
      dataAssinatura: convenio.dataAssinatura
        ? new Date(convenio.dataAssinatura).toISOString().split('T')[0]
        : '',
      dataInicioVigencia: convenio.dataInicioVigencia
        ? new Date(convenio.dataInicioVigencia).toISOString().split('T')[0]
        : '',
      dataFimVigencia: convenio.dataFimVigencia
        ? new Date(convenio.dataFimVigencia).toISOString().split('T')[0]
        : '',
      esfera: convenio.esfera || '',
      modalidadeRepasse: convenio.modalidadeRepasse || '',
      secretariaId: convenio.secretaria?.id,
      orgaoId: convenio.orgao?.id,
      programaId: convenio.programa?.id,
      // Novos campos de processo
      processoSPD: convenio.processoSPD || '',
      processoCreditoAdicional: convenio.processoCreditoAdicional || '',
      area: convenio.area || ""
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => convenioService.update(convenio.id, {
      ...data,
      dataAssinatura: data.dataAssinatura || null,
      dataInicioVigencia: data.dataInicioVigencia || null,
      dataFimVigencia: data.dataFimVigencia || null,
      orgaoId: data.orgaoId || null,
      programaId: data.programaId || null,
      esfera: data.esfera || null,
      modalidadeRepasse: data.modalidadeRepasse || null,
      processoSPD: data.processoSPD || null,
      processoCreditoAdicional: data.processoCreditoAdicional || null,
      area: data.area || null,
      numeroProposta: data.numeroProposta || null,
      numeroTermo: data.numeroTermo || null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenio", String(convenio.id)] });
      toast.success("Dados salvos com sucesso!");
      setIsEditing(false);
      onUpdate();
    },
    onError: () => {
      toast.error("Erro ao salvar dados");
    }
  });

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const onSubmit = (data: ConvenioFormData) => {
    updateMutation.mutate(data);
  };

  const esferaLabel = {
    FEDERAL: "Federal",
    ESTADUAL: "Estadual"
  };

  const modalidadeLabel = {
    CONVENIO: "Convênio",
    CONTRATO_REPASSE: "Contrato de Repasse",
    TERMO_FOMENTO: "Termo de Fomento",
    TERMO_COLABORACAO: "Termo de Colaboração"
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Dados Gerais</h3>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Código</Label>
            <Input {...register("codigo")} />
          </div>
          <div className="space-y-2">
            <Label>Nº do Termo</Label>
            <Input {...register("numeroTermo")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Título</Label>
          <Input {...register("titulo")} />
        </div>

        <div className="space-y-2">
          <Label>Objeto</Label>
          <textarea className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" rows={3} {...register("objeto")} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Data Assinatura</Label>
            <Input type="date" {...register("dataAssinatura")} />
          </div>
          <div className="space-y-2">
            <Label>Início Vigência</Label>
            <Input type="date" {...register("dataInicioVigencia")} />
          </div>
          <div className="space-y-2">
            <Label>Fim Vigência</Label>
            <Input type="date" {...register("dataFimVigencia")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Esfera</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("esfera")}>
              <option value="">Selecione</option>
              <option value="FEDERAL">Federal</option>
              <option value="ESTADUAL">Estadual</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Modalidade</Label>
            <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("modalidadeRepasse")}>
              <option value="">Selecione</option>
              <option value="CONVENIO">Convênio</option>
              <option value="CONTRATO_REPASSE">Contrato de Repasse</option>
              <option value="TERMO_FOMENTO">Termo de Fomento</option>
              <option value="TERMO_COLABORACAO">Termo de Colaboração</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Órgão Concedente</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              {...register("orgaoId", {
                setValueAs: (v) => (v === "" ? undefined : Number(v))
              })}
            >
              <option value="">Selecione</option>
              {catalogs?.orgaos.map((o) => (
                <option key={o.id} value={o.id}>{o.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Campos de Processo */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Processo SPD</Label>
            <Input {...register("processoSPD")} placeholder="Nº do processo SPD" />
          </div>
          <div className="space-y-2">
            <Label>Processo Crédito Adicional</Label>
            <Input {...register("processoCreditoAdicional")} placeholder="Nº do processo" />
          </div>
          <div className="space-y-2">
            <Label>Área</Label>
            <Input {...register("area")} placeholder="Área responsável" />
          </div>
        </div>
      </form>
    );
  }

  const podeRegistrarAssinatura = !convenio.dataAssinatura && convenio.status === "RASCUNHO";
  const aditivosConvenio = (convenio.aditivos || []).filter((aditivo) => !aditivo.contratoId);
  const numeroAditivos = aditivosConvenio.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dados Gerais</h3>
        <div className="flex gap-2">
          {podeRegistrarAssinatura && (
            <Button onClick={() => setShowAssinaturaModal(true)} className="bg-emerald-600 hover:bg-emerald-500">
              <CalendarCheck className="h-4 w-4 mr-2" />
              Registrar Assinatura
            </Button>
          )}
          {convenio.dataAssinatura && (
            <Button onClick={() => setShowAditivoModal(true)} variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
              <FileSignature className="h-4 w-4 mr-2" />
              Aditivar
            </Button>
          )}
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Identificação */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 border-b border-slate-100 pb-2">
            Identificação
          </h4>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Código:</dt>
              <dd className="font-medium text-slate-900">{convenio.codigo}</dd>
            </div>
            {convenio.numeroTermo && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Nº do Termo:</dt>
                <dd className="font-medium text-slate-900">{convenio.numeroTermo}</dd>
              </div>
            )}
            {convenio.numeroProposta && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Nº da Proposta:</dt>
                <dd className="font-medium text-slate-900">{convenio.numeroProposta}</dd>
              </div>
            )}
            {convenio.esfera && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Esfera:</dt>
                <dd className="font-medium text-slate-900">
                  {esferaLabel[convenio.esfera as keyof typeof esferaLabel]}
                </dd>
              </div>
            )}
            {convenio.modalidadeRepasse && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Modalidade:</dt>
                <dd className="font-medium text-slate-900">
                  {modalidadeLabel[convenio.modalidadeRepasse as keyof typeof modalidadeLabel]}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Vigência */}
        <div className="space-y-4">
          <h4 className="font-medium text-muted-foreground border-b pb-2">
            Vigência
          </h4>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Assinatura:</dt>
              <dd className="font-medium">
                {formatDateBR(convenio.dataAssinatura) || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Início:</dt>
              <dd className="font-medium">
                {formatDateBR(convenio.dataInicioVigencia) || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Fim:</dt>
              <dd className="font-medium">
                {formatDateBR(convenio.dataFimVigencia) || "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Objeto */}
      <div className="space-y-2">
        <h4 className="font-medium text-slate-700">Objeto</h4>
        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">
          {convenio.objeto}
        </p>
      </div>

      {/* Classificação */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500 mb-1">Secretaria</p>
          <p className="font-medium text-slate-900">
            {convenio.secretaria?.nome || "—"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500 mb-1">Órgão Concedente</p>
          <p className="font-medium text-slate-900">
            {convenio.orgao?.nome || "—"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500 mb-1">Programa</p>
          <p className="font-medium text-slate-900">
            {convenio.programa?.nome || "—"}
          </p>
        </div>
      </div>

      {/* Processos */}
      {(convenio.processoSPD || convenio.processoCreditoAdicional || convenio.area) && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500 mb-1">Processo SPD</p>
            <p className="font-medium text-slate-900">
              {convenio.processoSPD || "—"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500 mb-1">Processo Crédito Adicional</p>
            <p className="font-medium text-slate-900">
              {convenio.processoCreditoAdicional || "—"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500 mb-1">Área</p>
            <p className="font-medium text-slate-900">
              {convenio.area || "—"}
            </p>
          </div>
        </div>
      )}

      {/* Emendas Parlamentares */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            Emendas Parlamentares
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNovaEmenda}
            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Emenda
          </Button>
        </div>
        
        {convenio.emendas && convenio.emendas.length > 0 ? (
          <div className="space-y-2">
            {convenio.emendas.map((emenda) => (
              <div
                key={emenda.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 group"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {emenda.nomeParlamentar}
                  </p>
                  <p className="text-xs text-slate-500">
                    {emenda.partido && <span>{emenda.partido}</span>}
                    {emenda.anoEmenda && <span> • Ano: {emenda.anoEmenda}</span>}
                    {emenda.codigoEmenda && <span> • Código: {emenda.codigoEmenda}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {emenda.valorIndicado && (
                    <span className="text-sm font-semibold text-emerald-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                      }).format(Number(emenda.valorIndicado))}
                    </span>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditarEmenda(emenda)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      title="Editar emenda"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletarEmenda(emenda)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remover emenda"
                      disabled={deletarEmendaMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <Landmark className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              Nenhuma emenda parlamentar vinculada a este convênio.
            </p>
            <Button
              variant="link"
              size="sm"
              onClick={handleNovaEmenda}
              className="mt-2 text-emerald-600"
            >
              Adicionar primeira emenda
            </Button>
          </div>
        )}
      </div>

      {/* Aditivos */}
      {aditivosConvenio.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700">Histórico de Aditivos</h4>
          <div className="space-y-2">
            {aditivosConvenio.map((aditivo) => (
              <div
                key={aditivo.id}
                className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {aditivo.numeroAditivo}º Aditivo - {aditivo.tipoAditivo.replace("_", " ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {aditivo.dataAssinatura && formatDateBR(aditivo.dataAssinatura)}
                    {aditivo.motivo && ` • ${aditivo.motivo}`}
                  </p>
                </div>
                {aditivo.novaVigencia && (
                  <span className="text-sm font-medium text-amber-700">
                    Nova vigência: {formatDateBR(aditivo.novaVigencia)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modais */}
      <RegistrarAssinaturaModal
        isOpen={showAssinaturaModal}
        onClose={() => setShowAssinaturaModal(false)}
        convenioId={convenio.id}
        onSuccess={onUpdate}
      />

      <AditivarModal
        isOpen={showAditivoModal}
        onClose={() => setShowAditivoModal(false)}
        convenioId={convenio.id}
        vigenciaAtual={convenio.dataFimVigencia}
        numeroAditivos={numeroAditivos}
        onSuccess={onUpdate}
      />

      <EmendaModal
        isOpen={showEmendaModal}
        onClose={() => {
          setShowEmendaModal(false);
          setEmendaParaEditar(null);
        }}
        convenioId={convenio.id}
        emenda={emendaParaEditar}
        onSuccess={onUpdate}
      />

      <ConfirmDialog
        open={Boolean(emendaParaDeletar)}
        onOpenChange={(open) => { if (!open) setEmendaParaDeletar(null); }}
        title="Remover emenda"
        description={`Deseja realmente remover a emenda do parlamentar "${emendaParaDeletar?.nomeParlamentar}"?`}
        confirmLabel="Remover"
        onConfirm={() => {
          if (emendaParaDeletar) {
            deletarEmendaMutation.mutate(emendaParaDeletar.id);
          }
        }}
      />
    </div>
  );
}
