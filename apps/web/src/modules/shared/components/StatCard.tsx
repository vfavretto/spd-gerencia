import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
  trend?: {
    label: string;
    positive?: boolean;
  };
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  helper,
  icon: Icon,
  trend
}) => (
  <div className="glass-panel flex flex-col gap-3 p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <span className="rounded-2xl bg-primary-100 p-2 text-primary-600">
        <Icon className="h-4 w-4" />
      </span>
    </div>
    <strong className="text-3xl font-semibold text-slate-900">{value}</strong>
    <div className="flex items-center gap-2 text-sm text-slate-500">
      {trend && (
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
            trend.positive
              ? "bg-emerald-100 text-emerald-600"
              : "bg-rose-100 text-rose-600"
          }`}
        >
          {trend.label}
        </span>
      )}
      {helper}
    </div>
  </div>
);
