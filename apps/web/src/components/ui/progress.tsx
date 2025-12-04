import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const variantClasses = {
  default: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      showLabel = false,
      size = "md",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const autoVariant = variant;

    return (
      <div className={cn("w-full", className)} ref={ref} {...props}>
        {showLabel && (
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>{percentage.toFixed(0)}%</span>
            <span>
              {value.toLocaleString("pt-BR")} / {max.toLocaleString("pt-BR")}
            </span>
          </div>
        )}
        <div
          className={cn(
            "w-full overflow-hidden rounded-full bg-secondary",
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              variantClasses[autoVariant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";

// Progress Circle
interface ProgressCircleProps {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

function ProgressCircle({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 8,
  showLabel = true,
  className,
  variant = "default",
}: ProgressCircleProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const autoVariant = variant;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const strokeColors = {
    default: "stroke-primary",
    success: "stroke-emerald-500",
    warning: "stroke-amber-500",
    danger: "stroke-red-500",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-500 ease-out", strokeColors[autoVariant])}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

export { Progress, ProgressCircle };

