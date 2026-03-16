import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightLeft,
  BookOpen,
  Building2,
  FileSignature,
  History,
  Landmark,
  RefreshCcw,
  ScrollText,
  Users
} from "lucide-react";
import { useMemo, useState } from "react";
import { CatalogSection } from "@/modules/configuracoes/components/CatalogSection";
import { AuditoriaSection } from "@/modules/configuracoes/components/AuditoriaSection";
import { SnapshotsSection } from "@/modules/configuracoes/components/SnapshotsSection";
import { UsersSection } from "@/modules/configuracoes/components/UsersSection";
import { sections } from "@/modules/configuracoes/config";
import { configService } from "@/modules/configuracoes/services/configService";
import type { CatalogDataMap, ResourceKey, TabConfig, TabKey } from "@/modules/configuracoes/types";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { usePermissions } from "@/modules/shared/hooks/usePermissions";

export const ConfiguracoesPage = () => {
  const { isAdmin } = usePermissions();

  const allTabs = useMemo<TabConfig[]>(
    () => [
      {
        key: "usuarios",
        label: "Usuários",
        icon: <Users className="h-4 w-4" />,
        adminOnly: true
      },
      {
        key: "secretarias",
        label: "Secretarias",
        icon: <Building2 className="h-4 w-4" />
      },
      {
        key: "orgaos",
        label: "Órgãos",
        icon: <Landmark className="h-4 w-4" />
      },
      {
        key: "programas",
        label: "Programas",
        icon: <BookOpen className="h-4 w-4" />
      },
      {
        key: "modalidadesRepasse",
        label: "Modalidades de Repasse",
        icon: <ArrowRightLeft className="h-4 w-4" />
      },
      {
        key: "tiposTermoFormalizacao",
        label: "Tipos de Termo",
        icon: <FileSignature className="h-4 w-4" />
      },
      {
        key: "auditoria",
        label: "Auditoria",
        icon: <ScrollText className="h-4 w-4" />,
        adminOnly: true
      },
      {
        key: "snapshots",
        label: "Snapshots",
        icon: <History className="h-4 w-4" />,
        adminOnly: true
      }
    ],
    []
  );

  const visibleTabs = useMemo(
    () => allTabs.filter((tab) => !tab.adminOnly || isAdmin),
    [allTabs, isAdmin]
  );
  const [activeTab, setActiveTab] = useState<TabKey>(visibleTabs[0]?.key ?? "secretarias");

  const catalogsQuery = useQuery({
    queryKey: ["catalogs"],
    queryFn: () => configService.getCatalogs()
  });

  const catalogs = catalogsQuery.data as CatalogDataMap | undefined;

  const currentSection = useMemo(
    () => sections.find((section) => section.key === activeTab),
    [activeTab]
  );

  const currentSectionData = currentSection ? catalogs?.[currentSection.key as ResourceKey] ?? [] : [];

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

      <div>
        {activeTab === "usuarios" && isAdmin && <UsersSection />}
        {currentSection && <CatalogSection section={currentSection} data={currentSectionData} />}
        {activeTab === "auditoria" && isAdmin && <AuditoriaSection />}
        {activeTab === "snapshots" && isAdmin && <SnapshotsSection />}
      </div>
    </div>
  );
};
