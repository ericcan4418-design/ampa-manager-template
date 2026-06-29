import { getReps, getVerticalMeta, teamLeadIds, VERTICAL_ORDER } from "../../../lib/ampa";
import type { Rep, VerticalKey } from "../../../lib/types";
import RepsExplorer from "../../../components/RepsExplorer";

export const dynamic = "force-dynamic";
export const metadata = { title: "All Reps | AMPA Manager" };

export default async function RepsPage() {
  let reps: Rep[] = [];
  let loadError: string | null = null;
  try { reps = await getReps(); } catch (error) { loadError = error instanceof Error ? error.message : "Failed to load reps"; }
  const present = new Set(reps.map((r) => r.vertical));
  const verticalOptions = VERTICAL_ORDER.filter((key) => present.has(key)).map((key) => ({ key: key as VerticalKey, label: getVerticalMeta(key).label }));
  const leads = teamLeadIds(reps);
  const repsById = new Map(reps.map((r) => [r.id, r]));
  const leadOptions = Array.from(leads).map((id) => repsById.get(id)).filter((r): r is Rep => Boolean(r)).sort((a, b) => a.full_name.localeCompare(b.full_name)).map((r) => ({ id: r.id, name: r.full_name }));
  return (<div><header className="mb-8 flex items-center gap-3"><h1 className="text-lg font-semibold text-[#0F172A]">All Reps</h1><span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-sm font-semibold text-[#475569]">{reps.length}</span></header>{loadError ? (<div className="rounded-lg border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#DC2626]">Couldn&apos;t load live data: {loadError}</div>) : (<RepsExplorer reps={reps} verticalOptions={verticalOptions} leadOptions={leadOptions} />)}</div>);
}
