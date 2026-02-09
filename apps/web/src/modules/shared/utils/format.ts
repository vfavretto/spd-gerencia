/**
 * Formata um valor numérico como moeda BRL.
 */
export const formatCurrency = (value: number | string | null | undefined = 0): string =>
  Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2
  });

/**
 * Formata uma data para exibição resumida (ex: "30 de jan. de 2026").
 */
export const formatDate = (value?: string | Date | null): string => {
  if (!value) return "Sem data";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

/**
 * Formata uma data com hora (ex: "30/01/2026 às 14:30").
 */
export const formatDateTime = (value?: string | Date | null): string => {
  if (!value) return "Sem data";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
