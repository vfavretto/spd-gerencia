export const formatCurrency = (value: number | string | null | undefined = 0): string =>
  Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2
  });

export const formatDate = (value?: string | Date | null): string => {
  if (!value) return "Sem data";
  const date = typeof value === "string"
    ? new Date(value.length === 10 ? value + "T00:00:00" : value)
    : value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};
