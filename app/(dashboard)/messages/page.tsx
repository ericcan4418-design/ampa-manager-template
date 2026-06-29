"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Send, MessageSquare, ChevronDown, ChevronRight, Users } from "lucide-react";
import type { Rep } from "../../../lib/types";
import { buildTeamGroups, getVerticalMeta, teamDisplayName } from "../../../lib/ampa";
import { HEALTH_COLOR, formatPhone, relativeTime } from "../../../lib/ui";

const TEMPLATES = [
  "Hey, checking in — how's it going out there?",
  "Great work this week, keep it up!",
  "Reminder: finish up your onboarding when you get a sec.",
  "Let's hop on a quick call this week.",
];

interface TeamSection {
  leadId: string;
  leadName: string;
  leadInitials: string;
  label: string;
  members: Rep[];
  leadRep: Rep | null;
}

export default function MessagesPage() {
  const [reps,       setReps]       = useState<Rep[]>([]);
  const [loadError,  setLoadError]  = useState<string | null>(null);
  const [query,      setQuery]      = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft,      setDraft]      = useState("");
  const [sendState,  setSendState]  = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [sendError,  setSendError]  = useState<string | null>(null);
  const [openTeams,  setOpenTeams]  = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reps")
      .then((r) => r.json())
      .then((data: { reps?: Rep[]; error?: string }) => {
        if (cancelled) return;
        if (data.reps) {
          setReps(data.reps);
          // Auto-expand all teams on load
          const groups = buildTeamGroups(data.reps);
          setOpenTeams(new Set(groups.map((g) => g.leadId)));
        } else {
          setLoadError(data.error ?? "Failed to load reps");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Network error");
      });
    return () => { cancelled = true; };
  }, []);

  // Build team sections
  const teamSections = useMemo((): TeamSection[] => {
    const byId = new Map(reps.map((r) => [r.id, r]));
    const groups = buildTeamGroups(reps);
    return groups.map((g) => ({
      leadId:       g.leadId,
      leadName:     g.leadName,
      leadInitials: g.leadInitials,
      label:        teamDisplayName(g),
      members:      g.reps,
      leadRep:      byId.get(g.leadId) ?? null,
    }));
  }, [reps]);

  // Reps not on any team
  const teamMemberIds = useMemo(() => {
    const ids = new Set<string>();
    for (const t of teamSections) {
      if (t.leadRep) ids.add(t.leadRep.id);
      for (const m of t.members) ids.add(m.id);
    }
    return ids;
  }, [teamSections]);

  const soloReps = useMemo(
    () => reps.filter((r) => !teamMemberIds.has(r.id)),
    [reps, teamMemberIds]
  );

  // Search filter — flattened
  const q = query.trim().toLowerCase();
  const matchesQuery = (rep: Rep) =>
    !q || rep.full_name.toLowerCase().includes(q) || (rep.phone ?? "").includes(q);

  const selected = useMemo(() => reps.find((r) => r.id === selectedId) ?? null, [reps, selectedId]);

  function selectRep(rep: Rep) {
    setSelectedId(rep.id);
    setSendState("idle");
    setSendError(null);
    setDraft("");
  }

  function toggleTeam(leadId: string) {
    setOpenTeams((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  }

  async function sendMessage() {
    if (!selected || !draft.trim()) return;
    setSendState("sending");
    setSendError(null);
    try {
      const res = await fetch("/api/send-sms", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ to: selected.phone, message: draft.trim() }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setSendState("error");
        setSendError(data.error ?? "Failed to send");
      } else {
        setSendState("sent");
        setDraft("");
        setTimeout(() => setSendState("idle"), 3000);
      }
    } catch (err) {
      setSendState("error");
      setSendError(err instanceof Error ? err.message : "Network error");
    }
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[#0F172A]">Messages</h1>
          <p className="mt-1 text-sm text-[#475569]">Send SMS to your reps via Twilio</p>
        </div>
      </header>

      {loadError && (
        <div className="mb-4 rounded-lg border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#DC2626]">
          Couldn&apos;t load reps: {loadError}
        </div>
      )}

      <div className="flex gap-4" style={{ height: "calc(100vh - 12rem)" }}>

        {/* ── Left panel: team-grouped contact list ── */}
        <div className="flex w-[300px] flex-shrink-0 flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          {/* Search */}
          <div className="border-b border-[#E2E8F0] p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.5} />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reps…"
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-9 pr-3 text-sm text-[#0F172A] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#2563EB] focus:bg-white"
              />
            </div>
          </div>

          {/* Team sections */}
          <div className="flex-1 overflow-y-auto">
            {teamSections.map((team) => {
              const visibleMembers = [
                ...(team.leadRep ? [team.leadRep] : []),
                ...team.members,
              ].filter(matchesQuery);

              // Hide entire section if search filters out all members
              if (q && visibleMembers.length === 0) return null;

              const open = openTeams.has(team.leadId);

              return (
                <div key={team.leadId} className="border-b border-[#E2E8F0] last:border-0">
                  {/* Team header — click to expand/collapse */}
                  <button
                    onClick={() => toggleTeam(team.leadId)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#F8FAFC]"
                  >
                    {open
                      ? <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-[#9CA3AF]" />
                      : <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-[#9CA3AF]" />
                    }
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[10px] font-bold text-[#2563EB]">
                      {team.leadInitials}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#0F172A]">
                      {team.label}
                    </span>
                    <span className="flex-shrink-0 rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-medium text-[#475569]">
                      {team.members.length + (team.leadRep ? 1 : 0)}
                    </span>
                  </button>

                  {/* Members */}
                  {open && (
                    <div className="pb-1">
                      {visibleMembers.map((rep) => {
                        const isLead   = rep.id === team.leadId;
                        const active   = rep.id === selectedId;
                        return (
                          <button
                            key={rep.id}
                            onClick={() => selectRep(rep)}
                            className={[
                              "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              active
                                ? "bg-[#EFF6FF]"
                                : "hover:bg-[#F8FAFC]",
                            ].join(" ")}
                          >
                            {/* Health dot */}
                            <span
                              className="h-2 w-2 flex-shrink-0 rounded-full"
                              style={{ backgroundColor: HEALTH_COLOR[rep.health] }}
                            />
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#0F172A]">
                              {rep.initials}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-1.5">
                                <span className="truncate text-sm font-medium text-[#0F172A]">
                                  {rep.full_name}
                                </span>
                                {isLead && (
                                  <span className="flex-shrink-0 rounded bg-[#EFF6FF] px-1 py-px text-[9px] font-bold uppercase tracking-wide text-[#2563EB]">
                                    Lead
                                  </span>
                                )}
                              </span>
                              <span className="block truncate text-[11px] text-[#9CA3AF]">
                                {rep.phone ? formatPhone(rep.phone) : "No phone"}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Solo reps (no team) */}
            {soloReps.filter(matchesQuery).length > 0 && (
              <div className="border-t border-[#E2E8F0]">
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <Users className="h-3.5 w-3.5 flex-shrink-0 text-[#9CA3AF]" />
                  <span className="text-xs font-semibold text-[#9CA3AF]">Individual Reps</span>
                </div>
                {soloReps.filter(matchesQuery).map((rep) => {
                  const active = rep.id === selectedId;
                  return (
                    <button
                      key={rep.id}
                      onClick={() => selectRep(rep)}
                      className={[
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        active ? "bg-[#EFF6FF]" : "hover:bg-[#F8FAFC]",
                      ].join(" ")}
                    >
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: HEALTH_COLOR[rep.health] }}
                      />
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#0F172A]">
                        {rep.initials}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#0F172A]">{rep.full_name}</span>
                        <span className="block truncate text-[11px] text-[#9CA3AF]">
                          {rep.phone ? formatPhone(rep.phone) : "No phone"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {reps.length === 0 && !loadError && (
              <p className="p-4 text-sm text-[#9CA3AF]">Loading reps…</p>
            )}
            {reps.length > 0 && teamSections.every((t) => {
              const visible = [...(t.leadRep ? [t.leadRep] : []), ...t.members].filter(matchesQuery);
              return q && visible.length === 0;
            }) && soloReps.filter(matchesQuery).length === 0 && q && (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <Search className="h-8 w-8 text-[#CBD5E1]" strokeWidth={1.5} />
                <p className="mt-3 text-sm font-semibold text-[#0F172A]">No results</p>
                <p className="mt-1 text-xs text-[#9CA3AF]">Try a different name or phone number.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: compose ── */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF]">
                <MessageSquare className="h-7 w-7 text-[#2563EB]" strokeWidth={1.5} />
              </span>
              <p className="mt-4 text-base font-semibold text-[#0F172A]">Select someone to message</p>
              <p className="mt-1 text-sm text-[#9CA3AF]">Pick a rep from a team on the left.</p>
            </div>
          ) : (
            <>
              {/* Rep header */}
              <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-5 py-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-bold text-[#0F172A]">
                  {selected.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#0F172A]">{selected.full_name}</p>
                  <p className="text-xs text-[#9CA3AF]">
                    {getVerticalMeta(selected.vertical).label}
                    {selected.phone ? ` · ${formatPhone(selected.phone)}` : " · No phone on file"}
                  </p>
                </div>
                {!selected.phone && (
                  <span className="rounded-full bg-[#FEF2F2] px-2.5 py-1 text-xs font-semibold text-[#DC2626]">
                    No phone
                  </span>
                )}
              </div>

              {/* Empty message history */}
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm italic text-[#CBD5E1]">No messages yet</p>
              </div>

              {/* Compose */}
              <div className="border-t border-[#E2E8F0] p-4">
                {/* Quick templates */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl}
                      onClick={() => setDraft(tpl)}
                      className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#475569] transition-colors hover:border-[#2563EB]/40 hover:text-[#2563EB]"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>

                {/* Input row */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
                    placeholder={selected.phone ? "Write a message…" : "No phone number on file"}
                    disabled={!selected.phone}
                    className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#2563EB] focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    disabled={!draft.trim() || !selected.phone || sendState === "sending"}
                    onClick={() => void sendMessage()}
                    className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" strokeWidth={1.5} />
                    {sendState === "sending" ? "Sending…" : sendState === "sent" ? "Sent ✓" : "Send"}
                  </button>
                </div>

                {/* Status */}
                {sendState === "error" && sendError && (
                  <p className="mt-2 text-xs font-medium text-[#DC2626]">{sendError}</p>
                )}
                {sendState === "sent" && (
                  <p className="mt-2 text-xs font-medium text-[#16A34A]">Message sent ✓</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
