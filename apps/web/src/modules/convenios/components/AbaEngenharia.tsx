import { Building, Info, Plus } from "lucide-react";
import type { Convenio, ValoresVigentes } from "@/modules/shared/types";
import { Button } from "@/modules/shared/ui/button";
import { usePermissions } from "@/modules/shared/hooks";
import { ContratoExecucaoCard } from "@/modules/convenios/components/ContratoExecucaoCard";
import { AditivarModal } from "@/modules/convenios/components/modals/AditivarModal";
import { EditarMedicaoModal } from "@/modules/convenios/components/modals/EditarMedicaoModal";
import { MaisInformacoesEngenhariaModal } from "@/modules/convenios/components/modals/MaisInformacoesEngenhariaModal";
import { NovaMedicaoModal } from "@/modules/convenios/components/modals/NovaMedicaoModal";
import { VincularContratoModal } from "@/modules/convenios/components/modals/VincularContratoModal";
import { useAbaEngenhariaState } from "@/modules/convenios/hooks/useAbaEngenhariaState";
import { getAditivosPorContrato, getEngenhariaValoresFinanceiros } from "@/modules/convenios/lib/engenharia";

type Props = {
  convenio: Convenio;
  valoresVigentes?: ValoresVigentes;
  onUpdate: () => void;
};

export function AbaEngenharia({ convenio, valoresVigentes, onUpdate }: Props) {
  const { canWrite } = usePermissions();
  const contratos = convenio.contratos ?? [];
  const aditivosPorContrato = getAditivosPorContrato(convenio);
  const { repasseAtual, contrapartidaAtual, repasseBase, contrapartidaBase } =
    getEngenhariaValoresFinanceiros(convenio, valoresVigentes);
  const { state, handlers } = useAbaEngenhariaState({
    convenioId: convenio.id,
    onUpdate
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contratos de Execução</h3>
        <div className="flex items-center gap-2">
          {canWrite("financeiro") && (
            <Button variant="outline" onClick={handlers.openMaisInformacoes}>
              <Info className="mr-2 h-4 w-4" />
              Mais Informações
            </Button>
          )}
          {contratos.length === 0 && canWrite("contrato") && (
            <Button onClick={handlers.openVincularContrato}>
              <Plus className="mr-2 h-4 w-4" />
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
              onClick={handlers.openVincularContrato}
              variant="secondary"
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Vincular Contrato
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {contratos.map((contrato) => (
            <ContratoExecucaoCard
              key={contrato.id}
              contrato={contrato}
              aditivos={aditivosPorContrato.get(contrato.id) || []}
              expandedMedicoes={state.expandedMedicoes}
              canEditContrato={canWrite("contrato")}
              canEditAditivo={canWrite("aditivo")}
              canEditMedicao={canWrite("medicao")}
              onEditContrato={handlers.handleEditarContrato}
              onAditivarContrato={handlers.handleAditivarContrato}
              onNovaMedicao={handlers.handleNovaMedicao}
              onToggleMedicao={handlers.toggleMedicaoExpanded}
              onEditMedicao={handlers.handleEditarMedicao}
              onDeleteMedicao={handlers.handleExcluirMedicao}
            />
          ))}
        </div>
      )}

      <VincularContratoModal
        isOpen={state.showVincularContrato}
        onClose={handlers.closeVincularContrato}
        convenioId={convenio.id}
        contrato={state.contratoParaEditar}
        onSuccess={onUpdate}
      />

      {state.selectedContratoId && (
        <NovaMedicaoModal
          isOpen={state.showNovaMedicao}
          onClose={handlers.closeNovaMedicao}
          contratoId={state.selectedContratoId}
          convenioId={convenio.id}
          dataOIS={state.selectedContratoOIS}
          onSuccess={onUpdate}
        />
      )}

      {state.contratoParaAditivo && (
        <AditivarModal
          isOpen={state.showAditivoContrato}
          onClose={handlers.closeAditivoContrato}
          convenioId={convenio.id}
          contratoId={state.contratoParaAditivo.id}
          vigenciaAtual={state.contratoParaAditivo.dataVigenciaFim}
          numeroAditivos={(aditivosPorContrato.get(state.contratoParaAditivo.id) || []).length}
          onSuccess={onUpdate}
        />
      )}

      <MaisInformacoesEngenhariaModal
        isOpen={state.showMaisInformacoes}
        onClose={handlers.closeMaisInformacoes}
        convenioId={convenio.id}
        repasseBase={repasseBase}
        contrapartidaBase={contrapartidaBase}
        repasseAtual={repasseAtual}
        contrapartidaAtual={contrapartidaAtual}
        onSuccess={onUpdate}
      />

      {state.medicaoParaEditar && state.contratoIdDaMedicao && (
        <EditarMedicaoModal
          isOpen={state.showEditarMedicao}
          onClose={handlers.closeEditarMedicao}
          contratoId={state.contratoIdDaMedicao}
          convenioId={convenio.id}
          medicao={state.medicaoParaEditar}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
}
