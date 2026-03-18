import { formatCurrency, formatDate } from "../format";

describe("formatCurrency", () => {
  it("formata número válido corretamente", () => {
    const result = formatCurrency(1500);
    expect(result).toBe("R$\u00a01.500,00");
  });

  it("formata zero", () => {
    const result = formatCurrency(0);
    expect(result).toBe("R$\u00a00,00");
  });

  it("formata valor null retornando R$ 0,00", () => {
    expect(formatCurrency(null)).toBe("R$\u00a00,00");
  });

  it("formata valor undefined retornando R$ 0,00", () => {
    expect(formatCurrency(undefined)).toBe("R$\u00a00,00");
  });

  it("formata string numérica", () => {
    const result = formatCurrency("2500.5");
    expect(result).toBe("R$\u00a02.500,50");
  });

  it("formata valores negativos", () => {
    const result = formatCurrency(-350);
    expect(result).toContain("350,00");
  });

  it("formata centavos corretamente", () => {
    const result = formatCurrency(19.99);
    expect(result).toBe("R$\u00a019,99");
  });
});

describe("formatDate", () => {
  it("formata data ISO válida", () => {
    const result = formatDate("2026-01-30T14:30:00.000Z");
    expect(result).toBeTruthy();
    expect(result).not.toBe("Sem data");
    expect(result).toContain("2026");
  });

  it("formata objeto Date", () => {
    const date = new Date(2026, 0, 30);
    const result = formatDate(date);
    expect(result).not.toBe("Sem data");
    expect(result).toContain("2026");
  });

  it("retorna 'Sem data' para null", () => {
    expect(formatDate(null)).toBe("Sem data");
  });

  it("retorna 'Sem data' para undefined", () => {
    expect(formatDate(undefined)).toBe("Sem data");
  });

  it("retorna 'Sem data' para string vazia", () => {
    expect(formatDate("")).toBe("Sem data");
  });
});
