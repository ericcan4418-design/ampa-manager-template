import { getReps, buildTeamGroups, teamDisplayName } from "../../../lib/ampa";
import type { Rep } from "../../../lib/types";
import TeamsExplorer, { type TeamView } from "../../../components/TeamsExplorer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Teams | AMPA Manager" };

export default async function TeamsPage() {
  let reps: Rep[] = [];
  let loadError: string | null = null;
  try { reps = await getReps(); } catch (error) { loadError = error instanceof Error ? error.message : "Failed to load reps"; }
  const repsById = new Map(reps.map((r) => [r.id, r]));
  const teams: TeamView[] = buildTeamGroups(reps).map((group) => ({ ...group, name: teamDisplayName(group), leadRep: repsById.get(group.leadId) ?? null }));
  return (<div>{loadError ? (<><header className="mb-6"><h1 className="text-lg font-semibold text-[#0F172A]">Teams</h1></header><div className="rounded-lg border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#DC2626]">Couldn&apos;t load live data: {loadError}</div></>) : (<TeamsExplorer teams={teams} />)}</div>);
}
