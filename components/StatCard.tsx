import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  hint?: string;
  children?: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  children,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5">
      {Icon && (
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#475569]">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-2xl font-semibold leading-tight text-[#0F172A]">
          {value}
        </p>
        <p className="mt-1 truncate text-xs text-[#9CA3AF]">
          {label}
        </p>
        {hint && <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">{hint}</p>}
        {children}
      </div>
    </div>
  );
}
