import type { UsuarioRole } from "@/modules/shared/types";
import type { SectionConfig } from "./types";

export const sections: SectionConfig[] = [
  {
    key: "secretarias",
    title: "Secretarias",
    description: "Cadastro das secretarias vinculadas aos convênios.",
    fields: [
      {
        name: "nome",
        label: "Nome",
        placeholder: "Secretaria de Planejamento",
        required: true
      },
      { name: "sigla", label: "Sigla", placeholder: "SPD" },
      {
        name: "responsavel",
        label: "Responsável",
        placeholder: "Nome do gestor"
      }
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
      { name: "nome", label: "Nome", required: true },
      { name: "esfera", label: "Esfera", placeholder: "Federal / Estadual" },
      { name: "contato", label: "Contato", placeholder: "email@orgao.gov.br" }
    ],
    columns: [
      { key: "nome", label: "Órgão" },
      { key: "esfera", label: "Esfera" },
      { key: "contato", label: "Contato" }
    ]
  },
  {
    key: "programas",
    title: "Programas",
    description: "Programas ou linhas de financiamento utilizadas.",
    fields: [
      { name: "nome", label: "Nome", required: true },
      { name: "codigo", label: "Código", placeholder: "PCS-001" },
      { name: "descricao", label: "Descrição", textarea: true }
    ],
    columns: [
      { key: "nome", label: "Programa" },
      { key: "codigo", label: "Código" },
      { key: "descricao", label: "Descrição" }
    ]
  },
  {
    key: "modalidadesRepasse",
    title: "Modalidades de repasse",
    description: "Modalidades utilizadas nos convênios.",
    fields: [{ name: "nome", label: "Nome", required: true }],
    columns: [{ key: "nome", label: "Modalidade" }]
  },
  {
    key: "tiposTermoFormalizacao",
    title: "Tipos de termo de formalização",
    description: "Tipos de termo utilizados na formalização dos convênios.",
    fields: [{ name: "nome", label: "Nome", required: true }],
    columns: [{ key: "nome", label: "Tipo de termo" }]
  }
];

export const roleLabels: Record<UsuarioRole, string> = {
  ADMIN: "Administrador",
  ANALISTA: "Analista",
  ESTAGIARIO: "Estagiário",
  OBSERVADOR: "Observador"
};

export const roleBadgeColors: Record<UsuarioRole, string> = {
  ADMIN: "bg-indigo-100 text-indigo-700",
  ANALISTA: "bg-blue-100 text-blue-700",
  ESTAGIARIO: "bg-amber-100 text-amber-700",
  OBSERVADOR: "bg-slate-100 text-slate-600"
};
