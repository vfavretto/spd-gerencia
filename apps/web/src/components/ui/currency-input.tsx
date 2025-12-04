import * as React from "react";
import { NumericFormat, type NumericFormatProps } from "react-number-format";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps
  extends Omit<NumericFormatProps, "value" | "onValueChange"> {
  value?: number | null;
  onValueChange?: (value: number | null) => void;
  className?: string;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    return (
      <NumericFormat
        getInputRef={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        thousandSeparator="."
        decimalSeparator=","
        prefix="R$ "
        decimalScale={2}
        fixedDecimalScale
        allowNegative={false}
        value={value ?? ""}
        onValueChange={(values) => {
          onValueChange?.(values.floatValue ?? null);
        }}
        {...props}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

// Utilitário para formatar número como moeda BRL
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Utilitário para parse de string moeda para número
export function parseCurrencyToNumber(value: string): number | null {
  if (!value) return null;
  const cleaned = value
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

export { CurrencyInput };

