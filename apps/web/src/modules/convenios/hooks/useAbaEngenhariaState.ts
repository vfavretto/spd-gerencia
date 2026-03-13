import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ContratoExecucao, Medicao } from "@/modules/shared/types";
import { medicaoService } from "@/modules/convenios/services/medicaoService";
import { toast } from "@/modules/shared/ui/toaster";

type UseAbaEngenhariaStateParams = {
  convenioId: string;
  onUpdate: () => void;
};

export function useAbaEngenhariaState({ convenioId, onUpdate }: UseAbaEngenhariaStateParams) {
  const queryClient = useQueryClient();
  const [showVincularContrato, setShowVincularContrato] = useState(false);
  const [showNovaMedicao, setShowNovaMedicao] = useState(false);
  const [showAditivoContrato, setShowAditivoContrato] = useState(false);
  const [showMaisInformacoes, setShowMaisInformacoes] = useState(false);
  const [selectedContratoId, setSelectedContratoId] = useState<string | null>(null);
  const [selectedContratoOIS, setSelectedContratoOIS] = useState<string | null>(null);
  const [contratoParaEditar, setContratoParaEditar] = useState<ContratoExecucao | null>(null);
  const [contratoParaAditivo, setContratoParaAditivo] = useState<ContratoExecucao | null>(null);
  const [expandedMedicoes, setExpandedMedicoes] = useState<Set<string>>(new Set());
  const [medicaoParaEditar, setMedicaoParaEditar] = useState<Medicao | null>(null);
  const [contratoIdDaMedicao, setContratoIdDaMedicao] = useState<string | null>(null);
  const [showEditarMedicao, setShowEditarMedicao] = useState(false);

  const deleteMedicaoMutation = useMutation({
    mutationFn: ({ contratoId, medicaoId }: { contratoId: string; medicaoId: string }) =>
      medicaoService.delete(contratoId, medicaoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenio", String(convenioId)] });
      toast.success("Medição excluída com sucesso!");
      onUpdate();
    },
    onError: () => {
      toast.error("Erro ao excluir medição");
    }
  });

  const handlers = useMemo(
    () => ({
      openVincularContrato: () => setShowVincularContrato(true),
      openMaisInformacoes: () => setShowMaisInformacoes(true),
      closeMaisInformacoes: () => setShowMaisInformacoes(false),
      handleNovaMedicao: (contratoId: string, dataOIS?: string | null) => {
        setSelectedContratoId(contratoId);
        setSelectedContratoOIS(dataOIS || null);
        setShowNovaMedicao(true);
      },
      handleEditarContrato: (contrato: ContratoExecucao) => {
        setContratoParaEditar(contrato);
        setShowVincularContrato(true);
      },
      handleAditivarContrato: (contrato: ContratoExecucao) => {
        setContratoParaAditivo(contrato);
        setShowAditivoContrato(true);
      },
      toggleMedicaoExpanded: (medicaoId: string) => {
        setExpandedMedicoes((prev) => {
          const next = new Set(prev);
          if (next.has(medicaoId)) {
            next.delete(medicaoId);
          } else {
            next.add(medicaoId);
          }
          return next;
        });
      },
      handleEditarMedicao: (medicao: Medicao, contratoId: string) => {
        setMedicaoParaEditar(medicao);
        setContratoIdDaMedicao(contratoId);
        setShowEditarMedicao(true);
      },
      handleExcluirMedicao: (contratoId: string, medicaoId: string) => {
        if (
          window.confirm("Tem certeza que deseja excluir esta medição? Esta ação não pode ser desfeita.")
        ) {
          deleteMedicaoMutation.mutate({ contratoId, medicaoId });
        }
      },
      closeVincularContrato: () => {
        setShowVincularContrato(false);
        setContratoParaEditar(null);
      },
      closeNovaMedicao: () => {
        setShowNovaMedicao(false);
        setSelectedContratoId(null);
        setSelectedContratoOIS(null);
      },
      closeAditivoContrato: () => {
        setShowAditivoContrato(false);
        setContratoParaAditivo(null);
      },
      closeEditarMedicao: () => {
        setShowEditarMedicao(false);
        setMedicaoParaEditar(null);
        setContratoIdDaMedicao(null);
      }
    }),
    [deleteMedicaoMutation]
  );

  return {
    state: {
      showVincularContrato,
      showNovaMedicao,
      showAditivoContrato,
      showMaisInformacoes,
      selectedContratoId,
      selectedContratoOIS,
      contratoParaEditar,
      contratoParaAditivo,
      expandedMedicoes,
      medicaoParaEditar,
      contratoIdDaMedicao,
      showEditarMedicao
    },
    handlers
  };
}
