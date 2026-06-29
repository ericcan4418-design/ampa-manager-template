import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getRepById, getVerticalMeta, HEALTH_META } from "../../../../lib/ampa";
import { formatPhone, relativeTime } from "../../../../lib/ui";
import RepSmsButton from "../../../../components/RepSmsButton";
import RepNotes from "../../../../components/RepNotes";

export const dynamic = "force-dynamic";

interface RepPageProps {
  params: { id: string };
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year:  "numeric",
    month: "short",
    day:   "numeric",
  });
}

function activityDaysAgo(value: string | null): number {
  if (!value) return Infinity;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return Infinity;
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

function ActivityField({ value }: { value: string | null }) {
  const days = activityDaysAgo(value);
  const text = relativeTime(value);
  let color = "#16A34A"; // < 8 days — green
  if (days === Infinity || days > 30) color = "#DC2626"; // red
  else if (days >= 8) color = "#D97706"; // amber
  const showWarning = days === Infinity || days > 30;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">Last Activity</span>
      <span className="flex items-center gap-1.5 text-sm" style={{ color }}>
        {showWarning && (
          <AlertTriangle className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
        )}
        {text}
      </span>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
}

function Field({ label, value }: FieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">{label}</span>
      <span className="text-sm text-[#0F172A]">{value || "—"}</span>
    </div>
  );
}

interface StatusPillProps {
  label: string;
  color: "green" | "amber" | "red" | "gray";
}

function StatusPill({ label, color }: StatusPillProps) {
  const styles = {
    green: { bg: "#DCFCE7", text: "#16A34A", dot: "#16A34A" },
    amber: { bg: "#FEF3C7", text: "#D97706", dot: "#D97706" },
    red:   { bg: "#FEE2E2", text: "#DC2626", dot: "#DC2626" },
    gray:  { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
  }[color];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: styles.bg, color: styles.text }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: styles.dot }} />
      {label}
    </span>
  );
}

interface DocStatusProps {
  label: string;
  uploaded: boolean;
}

function DocStatus({ label, uploaded }: DocStatusProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">{label}</span>
      <span className="flex items-center gap-1.5 text-sm">
        {uploaded ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-[#16A34A]" strokeWidth={1.5} />
            <span className="text-[#16A34A]">Uploaded</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-[#94A3B8]" strokeWidth={1.5} />
            <span className="text-[#94A3B8]">Not uploaded</span>
          </>
        )}
      </span>
    </div>
  );
}

const STEP_LABELS: Record<string, string> = {
  complete:    "Complete",
  in_progress: "In Progress",
  not_started: "Not Started",
};

const STEP_COLORS: Record<string, "green" | "amber" | "red"> = {
  complete:    "green",
  in_progress: "amber",
  not_started: "red",
};

export default async function RepDetailPage({ params }: RepPageProps) {
  const rep = await getRepById(params.id);
  if (!rep) notFound();

  const vertical = getVerticalMeta(rep.vertical);
  const health   = HEALTH_META[rep.health];

  const stepColor = STEP_COLORS[rep.onboarding_step] ?? "gray";
  const contractsSigned = rep.contracts_signed?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-[#475569] transition-colors hover:text-[#0F172A]"
          >
            <span aria-hidden>←</span> Back to dashboard
          </Link>
          <span className="text-sm font-bold tracking-tight text-[#0F172A]">AMPA Manager</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Profile card */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-xl font-semibold"
                style={{
                  backgroundColor: `${health.color}18`,
                  border:          `1px solid ${health.color}40`,
                  color:           health.color,
                }}
              >
                {rep.initials}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">{rep.full_name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs text-[#475569]">
                    {vertical.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: health.color }}
                      aria-hidden
                    />
                    <span style={{ color: health.color }}>{health.label}</span>
                  </span>
                </div>
              </div>
            </div>
            <RepSmsButton rep={rep} />
          </div>
        </div>

        {/* Training & Onboarding Status */}
        <section className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#0F172A]">Training &amp; Onboarding Status</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Onboarding step with colored badge */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">Onboarding Step</span>
              <StatusPill
                label={STEP_LABELS[rep.onboarding_step] ?? rep.onboarding_step}
                color={stepColor}
              />
            </div>

            {/* Contracts signed */}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">Contracts Signed</span>
              <span className="flex items-center gap-1.5 text-sm">
                {contractsSigned > 0 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#16A34A]" strokeWidth={1.5} />
                    <span className="text-[#0F172A]">{contractsSigned} signed</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-[#D97706]" strokeWidth={1.5} />
                    <span className="text-[#D97706]">None signed yet</span>
                  </>
                )}
              </span>
            </div>

            <Field label="Onboarded At"    value={formatDate(rep.onboarded_at)} />

            {/* Background check */}
            <DocStatus
              label="Background Check"
              uploaded={Boolean(rep.background_check_url)}
            />

            {/* Driver's license */}
            <DocStatus
              label="Driver's License"
              uploaded={Boolean(rep.drivers_license_url)}
            />

            <Field label="Experience" value={rep.level_of_experience ?? "—"} />

            <Field label="Vertical"   value={vertical.label} />
            <Field label="Health"     value={health.label} />
            <ActivityField value={rep.last_activity_at} />
          </div>
        </section>

        {/* Contact info */}
        <section className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#0F172A]">Contact Info</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name" value={rep.first_name} />
            <Field label="Last Name"  value={rep.last_name} />
            <Field label="Phone"      value={formatPhone(rep.phone) ?? "—"} />
            <Field label="Email"      value={rep.email ?? "—"} />
            <Field label="Address"    value={rep.address ?? "—"} />
            <Field label="Created"    value={formatDate(rep.created_at)} />
          </div>
        </section>

        {/* Integrations */}
        <section className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#0F172A]">Integrations</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Google Calendar"
              value={rep.google_calendar_connected ? "Connected" : "Not connected"}
            />
            <Field
              label="Microsoft Calendar"
              value={rep.microsoft_calendar_connected ? "Connected" : "Not connected"}
            />
          </div>
        </section>

        {/* Notes */}
        <RepNotes repId={rep.id} />

        <p className="mt-6 text-xs text-[#9CA3AF]">Rep ID: {rep.id}</p>
      </main>
    </div>
  );
}
