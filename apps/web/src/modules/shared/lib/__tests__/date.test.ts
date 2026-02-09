import {
  formatDateBR,
  formatDateTimeBR,
  toDateInputValue,
  fromDateInputValue,
  getDaysRemaining,
  getTrafficLightFromDays,
  formatRelativeDate,
} from "../date";

describe("formatDateBR", () => {
  it("formata data ISO para dd/MM/yyyy", () => {
    expect(formatDateBR("2026-01-30T14:30:00.000Z")).toBe("30/01/2026");
  });

  it("formata Date object", () => {
    const date = new Date(2026, 0, 30); // 30 de janeiro de 2026
    expect(formatDateBR(date)).toBe("30/01/2026");
  });

  it("retorna '-' para null", () => {
    expect(formatDateBR(null)).toBe("-");
  });

  it("retorna '-' para undefined", () => {
    expect(formatDateBR(undefined)).toBe("-");
  });

  it("trata data YYYY-MM-DD sem problema de timezone", () => {
    // Sem o T00:00:00, a data pode ser interpretada como UTC e voltar 1 dia
    expect(formatDateBR("2026-01-30")).toBe("30/01/2026");
  });

  it("retorna '-' para string inválida", () => {
    expect(formatDateBR("nao-e-data")).toBe("-");
  });
});

describe("formatDateTimeBR", () => {
  it("formata com hora", () => {
    const result = formatDateTimeBR("2026-01-30T14:30:00.000Z");
    // O resultado depende do fuso horário do ambiente, mas deve conter "às"
    expect(result).toContain("às");
    expect(result).toContain("30/01/2026");
  });

  it("retorna '-' para null", () => {
    expect(formatDateTimeBR(null)).toBe("-");
  });

  it("retorna '-' para undefined", () => {
    expect(formatDateTimeBR(undefined)).toBe("-");
  });

  it("retorna '-' para string inválida", () => {
    expect(formatDateTimeBR("invalid")).toBe("-");
  });
});

describe("toDateInputValue", () => {
  it("converte Date para YYYY-MM-DD", () => {
    const date = new Date(2026, 0, 30); // 30 de janeiro
    expect(toDateInputValue(date)).toBe("2026-01-30");
  });

  it("retorna string vazia para null", () => {
    expect(toDateInputValue(null)).toBe("");
  });

  it("retorna string vazia para undefined", () => {
    expect(toDateInputValue(undefined)).toBe("");
  });

  it("formata corretamente com meses e dias de um dígito", () => {
    const date = new Date(2026, 2, 5); // 5 de março
    expect(toDateInputValue(date)).toBe("2026-03-05");
  });
});

describe("fromDateInputValue", () => {
  it("converte string YYYY-MM-DD para Date local", () => {
    const date = fromDateInputValue("2026-01-30");
    expect(date).toBeInstanceOf(Date);
    expect(date!.getFullYear()).toBe(2026);
    expect(date!.getMonth()).toBe(0); // Janeiro
    expect(date!.getDate()).toBe(30);
  });

  it("retorna null para string vazia", () => {
    expect(fromDateInputValue("")).toBeNull();
  });

  it("retorna null para string inválida", () => {
    expect(fromDateInputValue("nao-e-data")).toBeNull();
  });
});

describe("getDaysRemaining", () => {
  it("retorna null para null", () => {
    expect(getDaysRemaining(null)).toBeNull();
  });

  it("retorna null para undefined", () => {
    expect(getDaysRemaining(undefined)).toBeNull();
  });

  it("retorna número positivo para data futura", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const result = getDaysRemaining(futureDate);
    expect(result).toBe(10);
  });

  it("retorna número negativo para data passada", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    pastDate.setHours(0, 0, 0, 0);
    const result = getDaysRemaining(pastDate);
    expect(result).toBe(-5);
  });

  it("retorna 0 para hoje", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = getDaysRemaining(today);
    expect(result).toBe(0);
  });

  it("aceita string YYYY-MM-DD", () => {
    const result = getDaysRemaining("2099-12-31");
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
  });
});

describe("getTrafficLightFromDays", () => {
  it("retorna 'red' para null", () => {
    expect(getTrafficLightFromDays(null)).toBe("red");
  });

  it("retorna 'red' para undefined", () => {
    expect(getTrafficLightFromDays(undefined)).toBe("red");
  });

  it("retorna 'red' para dias negativos", () => {
    expect(getTrafficLightFromDays(-5)).toBe("red");
  });

  it("retorna 'yellow' para 0 a 30 dias", () => {
    expect(getTrafficLightFromDays(0)).toBe("yellow");
    expect(getTrafficLightFromDays(15)).toBe("yellow");
    expect(getTrafficLightFromDays(30)).toBe("yellow");
  });

  it("retorna 'green' para mais de 30 dias", () => {
    expect(getTrafficLightFromDays(31)).toBe("green");
    expect(getTrafficLightFromDays(100)).toBe("green");
  });
});

describe("formatRelativeDate", () => {
  it("retorna '-' para null", () => {
    expect(formatRelativeDate(null)).toBe("-");
  });

  it("retorna '-' para undefined", () => {
    expect(formatRelativeDate(undefined)).toBe("-");
  });

  it("retorna 'Hoje' para data de hoje", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(formatRelativeDate(today)).toBe("Hoje");
  });

  it("retorna 'Amanhã' para data de amanhã", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    expect(formatRelativeDate(tomorrow)).toBe("Amanhã");
  });

  it("retorna 'Ontem' para data de ontem", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    expect(formatRelativeDate(yesterday)).toBe("Ontem");
  });

  it("retorna 'em X dias' para datas futuras", () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    future.setHours(0, 0, 0, 0);
    expect(formatRelativeDate(future)).toBe("em 5 dias");
  });

  it("retorna 'há X dias' para datas passadas", () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    past.setHours(0, 0, 0, 0);
    expect(formatRelativeDate(past)).toBe("há 3 dias");
  });
});
