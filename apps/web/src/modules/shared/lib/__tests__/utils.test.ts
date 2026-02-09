import { cn } from "../utils";

describe("cn", () => {
  it("combina múltiplas classes", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("remove duplicatas com tailwind-merge", () => {
    // tailwind-merge deve resolver conflitos, mantendo a última classe
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("resolve conflitos de classes Tailwind", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("trata valores falsy (undefined, null, false)", () => {
    expect(cn("px-4", undefined, null, false, "py-2")).toBe("px-4 py-2");
  });

  it("trata string vazia", () => {
    expect(cn("px-4", "", "py-2")).toBe("px-4 py-2");
  });

  it("trata classes condicionais", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe(
      "base active"
    );
  });

  it("retorna string vazia quando não recebe argumentos", () => {
    expect(cn()).toBe("");
  });

  it("combina classes de variantes complexas", () => {
    expect(cn("rounded-md bg-white", "bg-gray-100 shadow-sm")).toBe(
      "rounded-md bg-gray-100 shadow-sm"
    );
  });
});
