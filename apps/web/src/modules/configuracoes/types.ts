import type { ReactNode } from "react";

export type ResourceKey =
  | "secretarias"
  | "orgaos"
  | "programas"
  | "modalidadesRepasse"
  | "tiposTermoFormalizacao";

export type FieldConfig = {
  name: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
  required?: boolean;
};

export type SectionConfig = {
  key: ResourceKey;
  title: string;
  description: string;
  fields: FieldConfig[];
  columns: Array<{ key: string; label: string }>;
};

export type CatalogItem = {
  id: string;
  nome: string;
  [key: string]: string | number | null | undefined;
};

export type CatalogDataMap = Record<ResourceKey, CatalogItem[]>;

export type TabKey =
  | "usuarios"
  | "secretarias"
  | "orgaos"
  | "programas"
  | "modalidadesRepasse"
  | "tiposTermoFormalizacao"
  | "auditoria"
  | "snapshots";

export type TabConfig = {
  key: TabKey;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
};
