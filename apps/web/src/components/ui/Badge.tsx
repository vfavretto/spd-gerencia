import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

type BadgeSize = 'sm' | 'md' | 'lg';

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-sky-100 text-sky-700',
  neutral: 'bg-slate-200 text-slate-600'
};

const dotClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-500',
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-400'
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot,
  icon,
  className
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('h-1.5 w-1.5 rounded-full', dotClasses[variant])}
        />
      )}
      {icon}
      {children}
    </span>
  );
}

// Badge específico para status de semáforo
type TrafficLightStatus = 'green' | 'yellow' | 'red';

type TrafficLightBadgeProps = {
  status: TrafficLightStatus;
  label?: string;
  showDot?: boolean;
};

const trafficLightClasses: Record<TrafficLightStatus, { bg: string; text: string; dot: string }> = {
  green: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500'
  },
  yellow: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500'
  },
  red: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    dot: 'bg-rose-500'
  }
};

const defaultLabels: Record<TrafficLightStatus, string> = {
  green: 'Em dia',
  yellow: 'Atenção',
  red: 'Crítico'
};

export function TrafficLightBadge({
  status,
  label,
  showDot = true
}: TrafficLightBadgeProps) {
  const classes = trafficLightClasses[status];
  const displayLabel = label || defaultLabels[status];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        classes.bg,
        classes.text
      )}
    >
      {showDot && (
        <span className={clsx('h-2 w-2 rounded-full animate-pulse', classes.dot)} />
      )}
      {displayLabel}
    </span>
  );
}

// Função utilitária para determinar status do semáforo baseado em dias
export function getTrafficLightStatus(daysRemaining: number | null): TrafficLightStatus {
  if (daysRemaining === null) return 'green';
  if (daysRemaining < 0) return 'red';
  if (daysRemaining <= 60) return 'yellow';
  return 'green';
}

