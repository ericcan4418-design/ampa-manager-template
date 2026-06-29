"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import type { HealthStatus, Rep, VerticalKey } from "../lib/types";
import { duplicatePhoneIds } from "../lib/ampa";
import RepCard from "./RepCard";

interface LeadOption {
  id: string;
  name: string;
}

interface RepsExplorerProps {
  reps: Rep[];
  verticalOptions: { key: VerticalKey; label: string }[];
  leadOptions: LeadOption[];
}

const HEALTH_OPTIONS: { key: HealthStatus | "all"; label: string }[] = [
  { key: "all",    label: "All Health"       },
  { key: "green",  label: "Active"           },
  { key: "yellow", label: "In Progress"      },
  { key: "red",    label: "Needs Attention"  },
];

const selectClasses =
  "rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-medium text-[#0F172A] outline-none transition-colors focus:border-[#2563EB]";

export default function RepsExplorer({ reps, verticalOptions, leadOptions }: RepsExplorerProps) {
  const [query,    setQuery]    = useState("");
  const [vertical, setVertical] = useState<VerticalKey | "all">("all");
  const [health,   setHealth]   = useState<HealthStatus | "all">("all");
  const [lead,     setLead]     = useState<string>("all");

  const dupPhoneIds = useMemo(() => duplicatePhoneIds(reps), [reps]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reps.filter((rep) => {
      if (q && !rep.full_name.toLowerCase().includes(q)) return false;
      if (vertical !== "all" && rep.vertical !== vertical) return false;
      if (health !== "all" && rep.health !== health) return false;
      if (lead !== "all" && rep.direct_recruiter !== lead) return false;
      return true;
    });
  }, [reps, query, vertical, health, lead]);

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reps by name…"
            className="w-full rounded-lg border border-[#E2E8F0] bg-white py-2 pl-9 pr-3 text-sm text-[#0F172A] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#2563EB]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={vertical}
            onChange={(e) => setVertical(e.target.value as VerticalKey | "all")}
            className={selectClasses}
            aria-label="Filter by vertical"
          >
            <option value="all">All Verticals</option>
            {verticalOptions.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>

          <select
            value={health}
            onChange={(e) => setHealth(e.target.value as HealthStatus | "all")}
            className={selectClasses}
            aria-label="Filter by health"
          >
            {HEALTH_OPTIONS.map((h) => (
              <option key={h.key} value={h.key}>
                {h.label}
              </option>
            ))}
          </select>

          <select
            value={lead}
            onChange={(e) => setLead(e.target.value)}
            className={selectClasses}
            aria-label="Filter by team lead"
          >
            <option value="all">All Team Leads</option>
            {leadOptions.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result count */}
      <p className="mb-4 text-sm text-[#475569]">
        Showing <span className="font-semibold text-[#0F172A]">{filtered.length}</span> of {reps.length} reps
      </p>

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-white py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF]">
            <Users className="h-6 w-6" />
          </span>
          <p className="mt-4 font-semibold text-[#0F172A]">No reps found</p>
          <p className="mt-1 text-sm text-[#9CA3AF]">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((rep) => (
            <RepCard key={rep.id} rep={rep} duplicatePhone={dupPhoneIds.has(rep.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
