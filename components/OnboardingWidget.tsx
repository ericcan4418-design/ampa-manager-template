import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { Rep } from "../lib/types";

interface OnboardingWidgetProps {
  reps: Rep[];
}

export default function OnboardingWidget({ reps }: OnboardingWidgetProps) {
  const complete    = reps.filter((r) => r.onboarding_step === "complete");
  const inProgress  = reps.filter((r) => r.onboarding_step === "in_progress");
  const notStarted  = reps.filter((r) => r.onboarding_step === "not_started");
  const total       = reps.length;

  const attentionNeeded = [...notStarted, ...inProgress];

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#0F172A]">Onboarding Status</h2>
        {notStarted.length > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-xs font-medium text-[#DC2626]">
            <AlertTriangle className="h-3 w-3" strokeWidth={2} />
            {notStarted.length} not started
          </span>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex flex-col items-center rounded-lg bg-[#F0FDF4] p-3 text-center">
          <CheckCircle2 className="mb-1 h-5 w-5 text-[#16A34A]" strokeWidth={1.5} />
          <span className="text-xl font-semibold tabular-nums text-[#16A34A]">{complete.length}</span>
          <span className="text-[10px] text-[#16A34A]/80 font-medium">Complete</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-[#FEF3C7] p-3 text-center">
          <Clock className="mb-1 h-5 w-5 text-[#D97706]" strokeWidth={1.5} />
          <span className="text-xl font-semibold tabular-nums text-[#D97706]">{inProgress.length}</span>
          <span className="text-[10px] text-[#D97706]/80 font-medium">In Progress</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-[#FEE2E2] p-3 text-center">
          <AlertTriangle className="mb-1 h-5 w-5 text-[#DC2626]" strokeWidth={1.5} />
          <span className="text-xl font-semibold tabular-nums text-[#DC2626]">{notStarted.length}</span>
          <span className="text-[10px] text-[#DC2626]/80 font-medium">Not Started</span>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#94A3B8]">{complete.length} of {total} fully onboarded</span>
            <span className="text-xs font-medium text-[#0F172A]">
              {Math.round((complete.length / total) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
            <div
              className="h-full rounded-full bg-[#16A34A] transition-all"
              style={{ width: `${(complete.length / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Needs attention list */}
      {attentionNeeded.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
            Needs Attention
          </p>
          <ul className="space-y-1">
            {attentionNeeded.slice(0, 5).map((rep) => (
              <li key={rep.id}>
                <Link
                  href={`/rep/${rep.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-[#F8FAFC] transition-colors group"
                >
                  <span className="text-sm text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                    {rep.full_name}
                  </span>
                  <span
                    className="text-xs rounded-full px-2 py-0.5 font-medium"
                    style={
                      rep.onboarding_step === "not_started"
                        ? { backgroundColor: "#FEE2E2", color: "#DC2626" }
                        : { backgroundColor: "#FEF3C7", color: "#D97706" }
                    }
                  >
                    {rep.onboarding_step === "not_started" ? "Not started" : "In progress"}
                  </span>
                </Link>
              </li>
            ))}
            {attentionNeeded.length > 5 && (
              <li className="px-2 py-1 text-xs text-[#94A3B8]">
                +{attentionNeeded.length - 5} more…
              </li>
            )}
          </ul>
        </div>
      )}

      {attentionNeeded.length === 0 && total > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-[#F0FDF4] px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-[#16A34A]" strokeWidth={1.5} />
          <p className="text-sm font-medium text-[#16A34A]">All reps fully onboarded!</p>
        </div>
      )}
    </div>
  );
}
