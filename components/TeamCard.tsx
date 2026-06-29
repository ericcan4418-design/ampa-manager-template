"use client";

import { useState } from "react";
import { MessageSquare, Users } from "lucide-react";
import type { Rep } from "../lib/types";
import type { TeamGroup } from "../lib/ampa";
import { getVerticalMeta } from "../lib/ampa";
import { HEALTH_COLOR, HEALTH_LABEL, HEALTH_PILL, VERTICAL_BADGE, VERTICAL_COLOR } from "../lib/ui";
import VerticalIcon from "./VerticalIcon";
import SMSModal from "./SMSModal";

interface TeamCardProps {
  group: TeamGroup;
  /** Present when the team lead is a real rep we can text. */
  leadRep?: Rep | null;
}

/** Prominent card for a team leader. */
export default function TeamCard({ group, leadRep }: TeamCardProps) {
  const [open, setOpen] = useState(false);
  const vertical = getVerticalMeta(group.vertical);

  return (
    <>
      <div className="flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-base font-bold text-[#0F172A]">
            {group.leadInitials}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-lg font-bold text-[#0F172A]">{group.leadName}</p>
              <span className="flex-shrink-0 rounded-md bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#475569]">
                TL
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${VERTICAL_BADGE[group.vertical]}`}
              >
                <span
                  className="h-[5px] w-[5px] flex-shrink-0 rounded-full"
                  style={{ backgroundColor: VERTICAL_COLOR[group.vertical] }}
                  aria-hidden
                />
                <VerticalIcon vertical={group.vertical} size={12} />
                {vertical.label}
              </span>
              {/* Health pill */}
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${HEALTH_PILL[group.leadHealth]}`}>
                <span
                  className="h-[5px] w-[5px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: HEALTH_COLOR[group.leadHealth] }}
                  aria-hidden
                />
                {HEALTH_LABEL[group.leadHealth]}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#475569]">
                <Users className="h-3 w-3" /> {group.reps.length} {group.reps.length === 1 ? "rep" : "reps"}
              </span>
            </div>
          </div>
        </div>

        {leadRep && (
          <button
            onClick={() => setOpen(true)}
            className="flex flex-shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
          >
            <MessageSquare className="h-4 w-4" /> Text
          </button>
        )}
      </div>

      {leadRep && open && <SMSModal rep={leadRep} onClose={() => setOpen(false)} />}
    </>
  );
}
