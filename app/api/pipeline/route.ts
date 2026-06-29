import { NextResponse } from "next/server";

const AMPA_BASE_URL = "https://ampanetwork.com/api";
const AMPA_API_KEY = process.env.AMPA_API_KEY!;

export const dynamic = "force-dynamic";

const PIPELINE_STAGES = ["sourced","contacted","replied","meeting_one_booked","meeting_one_attended","m2_booked","meeting_two_attended","offer_extended","signed","invoice_sent","invoice_paid","onboarding_pending","active_rep"] as const;
const STAGE_ALIASES: Record<string, string> = { m1_booked: "meeting_one_booked", m1_attended: "meeting_one_attended" };
const STAGE_LABELS: Record<string, string> = { sourced:"Sourced",contacted:"Contacted",replied:"Replied",meeting_one_booked:"M1 Booked",meeting_one_attended:"M1 Attended",m2_booked:"M2 Booked",meeting_two_attended:"M2 Attended",offer_extended:"Offer Extended",signed:"Signed",invoice_sent:"Invoice Sent",invoice_paid:"Invoice Paid",onboarding_pending:"Onboarding",active_rep:"Active Rep" };

function normalizeStage(stage: string | null): string {
  if (!stage) return "sourced";
  return STAGE_ALIASES[stage] ?? stage;
}

function daysInPipeline(createdAt: string): number {
  const created = new Date(createdAt);
  if (isNaN(created.getTime())) return 0;
  return Math.floor((Date.now() - created.getTime()) / 86_400_000);
}

export async function GET() {
  try {
    const [recruitsRes, usersRes] = await Promise.all([
      fetch(`${AMPA_BASE_URL}/recruits`, { headers: { Authorization: `Bearer ${AMPA_API_KEY}` }, cache: "no-store" }),
      fetch(`${AMPA_BASE_URL}/users`, { headers: { Authorization: `Bearer ${AMPA_API_KEY}` }, cache: "no-store" }),
    ]);

    if (!recruitsRes.ok) return NextResponse.json({ error: `AMPA API error: ${recruitsRes.status}` }, { status: 502 });

    const recruitsPayload = await recruitsRes.json();
    const recruits = recruitsPayload?.data ?? [];

    const teamLeadNames: Record<string, string> = {};
    if (usersRes.ok) {
      const usersPayload = await usersRes.json();
      for (const u of (usersPayload?.data ?? [])) {
        teamLeadNames[u.user_id] = u.full_name?.trim() || `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "Unknown";
      }
    }

    const stageMap: Record<string, typeof recruits> = {};
    for (const stage of PIPELINE_STAGES) stageMap[stage] = [];
    for (const recruit of recruits) {
      const normalized = normalizeStage(recruit.current_stage);
      if (!(normalized in stageMap)) stageMap[normalized] = [];
      stageMap[normalized].push({ id: recruit.id, name: recruit.name, email: recruit.email, phone: recruit.phone ?? null, notes: recruit.notes ?? null, stage: normalized, stageLabel: STAGE_LABELS[normalized] ?? normalized, team_lead_id: recruit.team_lead_id, team_lead_name: teamLeadNames[recruit.team_lead_id] ?? null, days_in_pipeline: daysInPipeline(recruit.created_at), signed_at: recruit.signed_at, offer_letter_sent: recruit.offer_letter_sent, active_at: recruit.active_at, created_at: recruit.created_at, status: recruit.status });
    }

    const stages = PIPELINE_STAGES.map((stage) => ({ stage, label: STAGE_LABELS[stage] ?? stage, recruits: stageMap[stage] ?? [], count: (stageMap[stage] ?? []).length }));
    const teamLeads = Array.from(new Set(recruits.map((r: { team_lead_id: string }) => r.team_lead_id))).filter(Boolean).map((id) => ({ id, name: teamLeadNames[id as string] ?? "Unknown" }));

    return NextResponse.json({ stages, total: recruits.length, teamLeads });
  } catch (err) {
    console.error("Pipeline API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
