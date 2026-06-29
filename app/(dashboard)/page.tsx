import {
  getReps,
  getVerticalMeta,
  buildTeamGroups,
  standaloneReps,
  teamDisplayName,
  VERTICAL_ORDER,
} from "../../lib/ampa";
import type { Rep, VerticalKey } from "../../lib/types";
import DashboardView from "../../components/DashboardView";
import type { TeamView } from "../../components/TeamsExplorer";

export const dynamic = "force-dynamic";

function groupByVertical(reps: Rep[]): Map<VerticalKey, Rep[]> {
  const groups = new Map<VerticalKey, Rep[]>();
  for (const rep of reps) {
    const list = groups.get(rep.vertical) ?? [];
    list.push(rep);
    groups.set(rep.vertical, list);
  }
  return groups;
}

export default async function Home() {
  let reps: Rep[] = [];
  let loadError: string | null = null;
  try { reps = await getReps(); } catch (error) { loadError = error instanceof Error ? error.message : "Failed to load reps"; }
  const repsById = new Map(reps.map((r) => [r.id, r]));
  const teams: TeamView[] = buildTeamGroups(reps).map((group) => ({ ...group, name: teamDisplayName(group), leadRep: repsById.get(group.leadId) ?? null }));
  const standaloneByVertical = groupByVertical(standaloneReps(reps));
  const standalone = VERTICAL_ORDER.filter((key) => standaloneByVertical.has(key)).map((key) => ({ key, label: getVerticalMeta(key).label, iconName: getVerticalMeta(key).iconName, reps: standaloneByVertical.get(key) ?? [] }));
  if (loadError) return (<div><header className="mb-8"><h1 className="text-lg font-semibold text-[#0F172A]">Dashboard</h1></header><div className="rounded-lg border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#DC2626]">Couldn&apos;t load live data: {loadError}</div></div>);
  return (<div>{reps.length === 0 ? (<><header className="mb-8"><h1 className="text-lg font-semibold text-[#0F172A]">Dashboard</h1><p className="mt-1 text-sm text-[#475569]">Team hierarchy &amp; rep health across all verticals</p></header><div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-white py-16 text-center"><p className="mt-3 font-semibold text-[#0F172A]">No reps yet</p><p className="mt-1 text-sm text-[#475569]">Reps will appear here once they join the network.</p></div></>) : (<DashboardView teams={teams} standalone={standalone} />)}</div>);
}
