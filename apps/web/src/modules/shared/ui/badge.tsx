import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/modules/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-100 text-emerald-700",
        warning: "border-transparent bg-amber-100 text-amber-700",
        info: "border-transparent bg-blue-100 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Status Badge específico para convênios
type ConvenioStatus = "RASCUNHO" | "PROPOSTA" | "APROVADO" | "EM_EXECUCAO" | "CONCLUIDO" | "CANCELADO" | "SUSPENSO";

const statusConfig: Record<ConvenioStatus, { label: string; variant: BadgeProps["variant"] }> = {
  RASCUNHO: { label: "Rascunho", variant: "secondary" },
  PROPOSTA: { label: "Proposta", variant: "info" },
  APROVADO: { label: "Aprovado", variant: "success" },
  EM_EXECUCAO: { label: "Em Execução", variant: "default" },
  CONCLUIDO: { label: "Concluído", variant: "success" },
  CANCELADO: { label: "Cancelado", variant: "destructive" },
  SUSPENSO: { label: "Suspenso", variant: "warning" },
};

interface StatusBadgeProps {
  status: ConvenioStatus | string;
  className?: string;
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as ConvenioStatus] || { label: status, variant: "outline" as const };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

// Traffic Light Badge para vigência
type TrafficLightColor = "green" | "yellow" | "red";

const trafficLightConfig: Record<TrafficLightColor, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
};

interface TrafficLightBadgeProps {
  color: TrafficLightColor;
  label?: string;
  className?: string;
}

function TrafficLightBadge({ color, label, className }: TrafficLightBadgeProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("h-3 w-3 rounded-full animate-pulse", trafficLightConfig[color])} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

// Função utilitária para calcular cor do semáforo
function getTrafficLightColor(diasRestantes: number | null | undefined): TrafficLightColor {
  if (diasRestantes === null || diasRestantes === undefined || diasRestantes < 0) return "red";
  if (diasRestantes <= 30) return "yellow";
  return "green";
}

export { Badge, badgeVariants, StatusBadge, TrafficLightBadge, getTrafficLightColor };

