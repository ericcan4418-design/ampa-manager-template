"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, TriangleAlert } from "lucide-react";
import { formatPhone } from "../lib/ui";
import type { Rep } from "../lib/types";
import { getVerticalMeta } from "../lib/ampa";
import { HEALTH_COLOR, HEALTH_LABEL, HEALTH_PILL, VERTICAL_BADGE, VERTICAL_COLOR } from "../lib/ui";
import VerticalIcon from "./VerticalIcon";
import SMSModal from "./SMSModal";

interface RepCardProps {
  rep: Rep;
  /** True when another rep shares this phone number — shows a warning icon. */
  duplicatePhone?: boolean;
}

const STEP_LABELS: Record<Rep["onboarding_step"], string> = {
  complete:    "Complete",
  in_progress: "In Progress",
  not_started: "Not Started",
};

export default function RepCard({ rep, duplicatePhone = false }: RepCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const vertical = getVerticalMeta(rep.vertical);

  return (
    <>
      <div className="group flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 transition-colors hover:border-[#CBD5E1]">
        {/* Top row: avatar + name + health pill */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#0F172A]">
            {rep.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0F172A]">{rep.full_name}</p>
            <span
              className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${VERTICAL_BADGE[rep.vertical]}`}
            >
              <span
                className="h-[5px] w-[5px] flex-shrink-0 rounded-full"
                style={{ backgroundColor: VERTICAL_COLOR[rep.vertical] }}
                aria-hidden
              />
              <VerticalIcon vertical={rep.vertical} size={12} />
              {vertical.label}
            </span>
          </div>
          {/* Health pill */}
          <span className={`mt-0.5 inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${HEALTH_PILL[rep.health]}`}>
            <span
              className="h-[5px] w-[5px] rounded-full flex-shrink-0"
              style={{ backgroundColor: HEALTH_COLOR[rep.health] }}
              aria-hidden
            />
            {HEALTH_LABEL[rep.health]}
          </span>
        </div>

        {/* Onboarding status */}
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-[#9CA3AF]">
          Onboarding
        </p>
        <p className="mt-0.5 text-sm font-medium text-[#0F172A]">
          {STEP_LABELS[rep.onboarding_step]}
        </p>

        {/* Phone + hover actions */}
        <div className="mt-4 flex items-center justify-between gap-2">
          {rep.phone ? (
            <span className="flex min-w-0 items-center gap-1 text-xs text-[#475569]">
              <Phone className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
              <span className="truncate">{formatPhone(rep.phone) ?? rep.phone}</span>
              {duplicatePhone && (
                <span title="Duplicate phone number — shared with another rep">
                  <TriangleAlert className="h-3.5 w-3.5 flex-shrink-0 text-[#D97706]" strokeWidth={1.5} />
                </span>
              )}
            </span>
          ) : (
            <span className="text-xs text-[#9CA3AF]">No phone on file</span>
          )}
          {/* Action region: subtle hint at rest, full buttons on hover */}
          <div className="relative flex h-7 flex-shrink-0 items-center">
            {/* Subtle arrow hint — visible when NOT hovering */}
            <span className="text-xs text-[#CBD5E1] transition-opacity duration-150 group-hover:opacity-0" aria-hidden>
              →
            </span>
            {/* Action buttons — fade in on hover */}
            <div className="absolute right-0 flex items-center gap-3 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <button
                onClick={() => setModalOpen(true)}
                title={`Send SMS to ${rep.first_name}`}
                aria-label={`Send SMS to ${rep.first_name}`}
                className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
              >
                Text
              </button>
              <Link
                href={`/rep/${rep.id}`}
                className="text-xs font-semibold text-[#2563EB] transition-opacity hover:opacity-80"
              >
                View →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && <SMSModal rep={rep} onClose={() => setModalOpen(false)} />}
    </>
  );
}
