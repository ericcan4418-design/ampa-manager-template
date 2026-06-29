import { getReps, getVerticalMeta, buildTeamGroups, teamDisplayName, VERTICAL_ORDER } from "../../../lib/ampa";
import type { Rep, VerticalKey } from "../../../lib/types";
import LeaderboardView from "../../../components/LeaderboardView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leaderboard | AMPA Manager" };

export default async function LeaderboardPage() {
  let reps: Rep[] = [];
  let loadError: string | null = null;
  try { reps = await getReps(); } catch (error) { loadError = error instanceof Error ? error.message : "Failed to load reps"; }
  const present = new Set(reps.map((r) => r.vertical));
  const verticalOptions = VERTICAL_ORDER.filter((key) => present.has(key)).map((key) => ({ key: key as VerticalKey, label: getVerticalMeta(key).label }));
  const teamOptions = buildTeamGroups(reps).map((group) => ({ id: group.leadId, name: teamDisplayName(group) }));
  if (loadError) return (<div><header className="mb-8"><h1 className="text-lg font-semibold text-[#0F172A]">Leaderboard</h1></header><div className="rounded-lg border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#DC2626]">Couldn&apos;t load live data: {loadError}</div></div>);
  const teams = buildTeamGroups(reps);
  return (<LeaderboardView reps={reps} verticalOptions={verticalOptions} teamOptions={teamOptions} teams={teams} />);
}
