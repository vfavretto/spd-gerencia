import clsx from 'clsx';

type ProgressBarProps = {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  label?: string;
  className?: string;
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4'
};

const getVariantClass = (value: number, variant?: string) => {
  if (variant) {
    const variants = {
      default: 'bg-primary-500',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-rose-500'
    };
    return variants[variant as keyof typeof variants] || variants.default;
  }

  // Auto variant baseado no valor
  if (value >= 80) return 'bg-emerald-500';
  if (value >= 50) return 'bg-primary-500';
  if (value >= 25) return 'bg-amber-500';
  return 'bg-rose-500';
};

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant,
  label,
  className
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={clsx('w-full', className)}>
      {(label || showLabel) && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {showLabel && (
            <span className="text-slate-500">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div
        className={clsx(
          'w-full overflow-hidden rounded-full bg-slate-200',
          sizeClasses[size]
        )}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            getVariantClass(percentage, variant)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

type ProgressCircleProps = {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
};

export function ProgressCircle({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  showLabel = true,
  variant
}: ProgressCircleProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStrokeColor = () => {
    if (variant) {
      const colors = {
        default: '#6366f1',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
      };
      return colors[variant];
    }
    if (percentage >= 80) return '#10b981';
    if (percentage >= 50) return '#6366f1';
    if (percentage >= 25) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold text-slate-700">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

