import { formatCurrency, formatDate, formatDateTime } from "../format";

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
    // Verifica se contém o ano
    expect(result).toContain("2026");
  });

  it("formata objeto Date", () => {
    const date = new Date(2026, 0, 30); // 30 de janeiro de 2026
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

describe("formatDateTime", () => {
  it("formata data e hora corretamente", () => {
    const result = formatDateTime("2026-01-30T14:30:00.000Z");
    expect(result).toBeTruthy();
    expect(result).not.toBe("Sem data");
    // Deve conter o ano e separadores de hora
    expect(result).toContain("2026");
  });

  it("formata objeto Date com hora", () => {
    const date = new Date(2026, 0, 30, 14, 30);
    const result = formatDateTime(date);
    expect(result).not.toBe("Sem data");
    expect(result).toContain("30");
    expect(result).toContain("14:30");
  });

  it("retorna 'Sem data' para null", () => {
    expect(formatDateTime(null)).toBe("Sem data");
  });

  it("retorna 'Sem data' para undefined", () => {
    expect(formatDateTime(undefined)).toBe("Sem data");
  });
});
