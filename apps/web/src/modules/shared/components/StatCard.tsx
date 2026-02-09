import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
  color?: string;
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
  color = "bg-indigo-50 text-indigo-600",
  trend
}) => (
  <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-md transition-all duration-300 hover:shadow-lg">
    {/* Borda superior colorida */}
    <div className={`absolute inset-x-0 top-0 h-1 ${color.split(" ")[0]?.replace("50", "400") ?? "bg-indigo-400"}`} />

    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <span className={`rounded-2xl p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </span>
    </div>

    <strong className="mt-3 block font-mono text-3xl font-bold tracking-tight text-slate-900">
      {value}
    </strong>

    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
      {trend && (
        <span
          className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
            trend.positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {trend.label}
        </span>
      )}
      {helper && <span>{helper}</span>}
    </div>
  </div>
);
