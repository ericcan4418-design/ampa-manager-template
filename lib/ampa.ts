import type {
  AmpaUser,
  HealthStatus,
  OnboardingStep,
  Rep,
  VerticalKey,
} from "./types";
import { MOCK_REPS } from "./mockReps";

export const AMPA_BASE_URL = "https://ampanetwork.com/api";
// Set AMPA_API_KEY in your Vercel dashboard or .env.local
export const AMPA_API_KEY = process.env.AMPA_API_KEY!;

interface VerticalMeta {
  key: VerticalKey;
  label: string;
  iconName: string;
  color: string;
}

const VERTICALS: Record<VerticalKey, VerticalMeta> = {
  pest: { key: "pest", label: "Pest Control", iconName: "Bug", color: "#059669" },
  life_insurance: { key: "life_insurance", label: "Life Insurance", iconName: "Shield", color: "#0284c7" },
  alarms: { key: "alarms", label: "Security/Alarms", iconName: "Bell", color: "#d97706" },
  solar: { key: "solar", label: "Solar", iconName: "Sun", color: "#ea580c" },
  fiber: { key: "fiber", label: "Fiber", iconName: "Wifi", color: "#7c3aed" },
  general: { key: "general", label: "General Sales", iconName: "Briefcase", color: "#475569" },
  unknown: { key: "unknown", label: "Unknown", iconName: "HelpCircle", color: "#94a3b8" },
};

export const VERTICAL_ORDER: VerticalKey[] = [
  "pest",
  "life_insurance",
  "alarms",
  "solar",
  "fiber",
  "general",
  "unknown",
];

export function getVerticalMeta(key: VerticalKey): VerticalMeta {
  return VERTICALS[key];
}

function normalizeVertical(value: string | null): VerticalKey {
  if (value && value in VERTICALS && value !== "unknown") return value as VerticalKey;
  return "unknown";
}

function normalizeStep(value: string | null): OnboardingStep {
  if (value === "complete" || value === "in_progress" || value === "not_started") return value;
  return "not_started";
}

export function healthForStep(step: OnboardingStep): HealthStatus {
  switch (step) {
    case "complete": return "green";
    case "in_progress": return "yellow";
    case "not_started": return "red";
  }
}

export const HEALTH_META = {
  green: { status: "green" as HealthStatus, label: "Active", color: "#22c55e" },
  yellow: { status: "yellow" as HealthStatus, label: "In Progress", color: "#f59e0b" },
  red: { status: "red" as HealthStatus, label: "Needs Attention", color: "#ef4444" },
};

function initialsFrom(first: string, last: string): string {
  return `${first.trim().charAt(0)}${last.trim().charAt(0)}`.toUpperCase() || "?";
}

/**
 * IDs to exclude from the rep roster — add your manager/owner AMPA user IDs here.
 * Find your user_id via GET https://ampanetwork.com/api/me
 */
const EXCLUDED_IDS = new Set([
  // "YOUR_MANAGER_USER_ID",
]);

export function transformUser(user: AmpaUser): Rep | null {
  const first = (user.first_name ?? "").trim();
  const last = (user.last_name ?? "").trim();
  if (!first) return null;
  const step = normalizeStep(user.onboarding_step);
  return {
    id: user.user_id,
    first_name: first,
    last_name: last,
    full_name: user.full_name?.trim() || `${first} ${last}`.trim(),
    initials: initialsFrom(first, last),
    vertical: normalizeVertical(user.default_vertical),
    onboarding_step: step,
    health: healthForStep(step),
    phone: user.phone,
    email: user.email,
    address: user.address,
    onboarded_at: user.onboarded_at,
    created_at: user.created_at,
    last_activity_at: user.last_activity_at,
    level_of_experience: user.level_of_experience,
    google_calendar_connected: Boolean(user.google_calendar_connected),
    microsoft_calendar_connected: Boolean(user.microsoft_calendar_connected),
    direct_recruiter: user.direct_recruiter ?? null,
    contracts_signed: user.contracts_signed ?? [],
    drivers_license_url: user.drivers_license_url ?? null,
    background_check_url: user.background_check_url ?? null,
    onboarding_in_progress: Boolean(user.onboarding_in_progress),
  };
}

const JUNK_NAME = /test|phase|demo|sample|unknown|^ampa\s+(admin|rep|user|account)$/i;

export async function getReps(): Promise<Rep[]> {
  try {
    const apiKey = process.env.AMPA_API_KEY!;
    const res = await fetch(`${AMPA_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) return MOCK_REPS;
    const payload: unknown = await res.json();
    const data = payload && typeof payload === "object" && "data" in payload
      ? (payload as { data: AmpaUser[] }).data
      : [];
    const reps = data.map(transformUser).filter((r): r is Rep => r !== null);
    const cleanReps = reps.filter((r) => !JUNK_NAME.test(r.full_name) && !EXCLUDED_IDS.has(r.id));
    const realNames = new Set(cleanReps.map((r) => `${r.first_name.toLowerCase()}|${r.last_name.toLowerCase()}`));
    const supplemental = MOCK_REPS.filter((m) => !realNames.has(`${m.first_name.toLowerCase()}|${m.last_name.toLowerCase()}`));
    const finalReps = cleanReps.length >= 5 ? [...cleanReps, ...supplemental] : MOCK_REPS;
    return dedupeReps(finalReps).sort((a, b) => a.full_name.localeCompare(b.full_name));
  } catch {
    return MOCK_REPS;
  }
}

function completeness(rep: Rep): number {
  let score = 0;
  if (rep.phone) score += 1;
  if (rep.onboarded_at) score += 1;
  return score;
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function dedupeReps(reps: Rep[]): Rep[] {
  const normalized = reps.map((r) => ({
    ...r,
    first_name: normalizeName(r.first_name),
    last_name: normalizeName(r.last_name),
    full_name: normalizeName(r.full_name),
    initials: r.initials || `${r.first_name.charAt(0)}${r.last_name.charAt(0)}`.toUpperCase(),
  }));
  const byName = new Map<string, Rep>();
  const idRemap = new Map<string, string>();
  for (const rep of normalized) {
    const key = `${rep.first_name.toLowerCase()}|${rep.last_name.toLowerCase()}`;
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, rep);
    } else if (completeness(rep) > completeness(existing)) {
      idRemap.set(existing.id, rep.id);
      byName.set(key, rep);
    } else {
      idRemap.set(rep.id, existing.id);
    }
  }
  return Array.from(byName.values()).map((rep) => ({
    ...rep,
    direct_recruiter: rep.direct_recruiter ? (idRemap.get(rep.direct_recruiter) ?? rep.direct_recruiter) : null,
  }));
}

export function toE164(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.trim().startsWith("+")) return phone.trim();
  return null;
}

export interface TeamGroup {
  leadId: string;
  leadName: string;
  leadInitials: string;
  vertical: VerticalKey;
  reps: Rep[];
  leadHealth: HealthStatus;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.charAt(0) ?? ""}${parts.length > 1 ? parts[parts.length - 1].charAt(0) : ""}`.toUpperCase() || "?";
}

function dominantVertical(reps: Rep[]): VerticalKey {
  const counts = new Map<VerticalKey, number>();
  for (const r of reps) counts.set(r.vertical, (counts.get(r.vertical) ?? 0) + 1);
  let best: VerticalKey = "general", bestCount = -1;
  for (const [vertical, count] of Array.from(counts)) {
    if (count > bestCount) { best = vertical; bestCount = count; }
  }
  return best;
}

/**
 * Add any external manager IDs here (users who appear as recruiters but are
 * not themselves in the reps list, e.g. the owner account).
 */
const KNOWN_EXTERNAL_LEADS: Record<string, { name: string; vertical: VerticalKey }> = {
  // "YOUR_MANAGER_USER_ID": { name: "Your Name", vertical: "general" },
};

export function buildTeamGroups(reps: Rep[]): TeamGroup[] {
  const byId = new Map(reps.map((r) => [r.id, r]));
  const leadIds = new Set<string>();
  for (const rep of reps) { if (rep.direct_recruiter) leadIds.add(rep.direct_recruiter); }
  const groups: TeamGroup[] = [];
  for (const leadId of Array.from(leadIds)) {
    const teamReps = reps.filter((r) => r.direct_recruiter === leadId).sort((a, b) => a.full_name.localeCompare(b.full_name));
    if (teamReps.length === 0) continue;
    const leadRep = byId.get(leadId);
    if (leadRep) {
      groups.push({ leadId, leadName: leadRep.full_name, leadInitials: leadRep.initials, vertical: dominantVertical([leadRep, ...teamReps]), reps: teamReps, leadHealth: leadRep.health });
    } else {
      const known = KNOWN_EXTERNAL_LEADS[leadId];
      const name = known?.name ?? "Unknown Lead";
      groups.push({ leadId, leadName: name, leadInitials: initialsFromName(name), vertical: known?.vertical ?? dominantVertical(teamReps), reps: teamReps, leadHealth: "green" });
    }
  }
  return groups.sort((a, b) => { const va = VERTICAL_ORDER.indexOf(a.vertical), vb = VERTICAL_ORDER.indexOf(b.vertical); return va !== vb ? va - vb : a.leadName.localeCompare(b.leadName); });
}

const VERTICAL_SHORT: Record<VerticalKey, string> = { pest: "Pest", life_insurance: "Life", alarms: "Alarms", solar: "Solar", fiber: "Fiber", general: "Sales", unknown: "" };
export function teamDisplayName(group: TeamGroup): string { const short = VERTICAL_SHORT[group.vertical]; return short ? `${group.leadName}'s ${short} Team` : `${group.leadName}'s Team`; }
export function teamLeadIds(reps: Rep[]): Set<string> { const ids = new Set<string>(); for (const rep of reps) { if (rep.direct_recruiter) ids.add(rep.direct_recruiter); } return new Set([...ids].filter((id) => reps.some((r) => r.id === id))); }
export function standaloneReps(reps: Rep[]): Rep[] { const leads = teamLeadIds(reps); return reps.filter((r) => !r.direct_recruiter && !leads.has(r.id)).sort((a, b) => a.full_name.localeCompare(b.full_name)); }

export type RecruitingHealth = HealthStatus | "exempt";
export interface RecruitingStats { rep: Rep; recruitsSigned: number; activeRecruits: number; redRecruits: number; recruitingHealth: RecruitingHealth; }

function isRookie(rep: Rep): boolean {
  const exp = rep.level_of_experience?.toLowerCase() ?? "";
  if (exp.includes("rookie") || exp.includes("entry") || exp.includes("new")) return true;
  return rep.onboarding_step !== "complete";
}

export function buildRecruitingStats(reps: Rep[]): RecruitingStats[] {
  return reps.map((rep) => {
    const recruits = reps.filter((r) => r.direct_recruiter === rep.id);
    return { rep, recruitsSigned: recruits.length, activeRecruits: recruits.filter((r) => r.health === "green").length, redRecruits: recruits.filter((r) => r.health === "red").length, recruitingHealth: recruits.length > 0 ? "green" : isRookie(rep) ? "exempt" : "red" };
  });
}

export async function getRepById(id: string): Promise<Rep | null> { const reps = await getReps(); return reps.find((r) => r.id === id) ?? null; }
export function duplicatePhoneIds(reps: Rep[]): Set<string> { const m = new Map<string, string[]>(); for (const r of reps) { if (r.phone) { const d = r.phone.replace(/[^\d]/g, ""); const k = d.length >= 10 ? d.slice(-10) : d; if (k) m.set(k, [...(m.get(k) ?? []), r.id]); } } const result = new Set<string>(); for (const ids of Array.from(m.values())) { if (ids.length > 1) ids.forEach((id) => result.add(id)); } return result; }
