"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, TriangleAlert } from "lucide-react";
import type { Rep } from "../lib/types";
import { HEALTH_COLOR, HEALTH_LABEL, relativeTime } from "../lib/ui";
import SMSModal from "./SMSModal";

interface RepRowProps {
  rep: Rep;
  /** True when another rep shares this phone number — shows a warning icon. */
  duplicatePhone?: boolean;
}

/** Compact, indented rep row shown beneath a team leader's card. */
export default function RepRow({ rep, duplicatePhone = false }: RepRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="ml-6 flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 transition-colors hover:bg-[#F8FAFC]">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#0F172A]">
          {rep.initials}
        </span>

        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: HEALTH_COLOR[rep.health] }}
          title={HEALTH_LABEL[rep.health]}
          aria-label={HEALTH_LABEL[rep.health]}
        />

        <Link href={`/rep/${rep.id}`} className="min-w-0 flex-1 truncate font-medium text-[#0F172A] hover:text-[#2563EB]">
          {rep.full_name}
        </Link>

        <span className="hidden flex-shrink-0 items-center gap-1.5 text-xs sm:flex">
          {duplicatePhone && (
            <span title="Duplicate phone number — shared with another rep">
              <TriangleAlert className="h-3 w-3 text-[#D97706]" strokeWidth={1.5} />
            </span>
          )}
          {(() => {
            const val = rep.last_activity_at;
            const days = val ? Math.floor((Date.now() - new Date(val).getTime()) / 86_400_000) : Infinity;
            let color = "#16A34A";
            if (days === Infinity || days > 30) color = "#DC2626";
            else if (days >= 8) color = "#D97706";
            return (
              <span className="flex items-center gap-1" style={{ color }}>
                {(days === Infinity || days > 30) && (
                  <TriangleAlert className="h-3 w-3" strokeWidth={1.5} />
                )}
                {relativeTime(val)}
              </span>
            );
          })()}
        </span>

        <button
          onClick={() => setOpen(true)}
          aria-label={`Text ${rep.first_name || rep.full_name}`}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
        >
          <MessageSquare className="h-3.5 w-3.5" /> SMS
        </button>
      </div>

      {open && <SMSModal rep={rep} onClose={() => setOpen(false)} />}
    </>
  );
}
