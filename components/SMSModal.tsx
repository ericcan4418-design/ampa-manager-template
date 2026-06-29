"use client";

import { useEffect, useMemo, useState } from "react";
import { X, MessageSquare } from "lucide-react";
import type { Rep } from "../lib/types";
import { formatPhone } from "../lib/ui";

interface SMSModalProps {
  rep: Rep;
  onClose: () => void;
}

type SendState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "success" }
  | { status: "error"; message: string };

interface Template {
  label: string;
  body: string;
}

function buildTemplates(firstName: string): Template[] {
  const name = firstName || "there";
  return [
    { label: "Check in",       body: `Hey ${name}, checking in — how are things going? Need anything from me?` },
    { label: "Onboarding nudge", body: `Hey ${name}, noticed you haven't completed onboarding. Need help getting through it?` },
    { label: "Book a call",    body: `Hey ${name}, let's hop on a quick call. When works for you?` },
    { label: "Encourage",      body: `Hey ${name}, great momentum lately — keep it up! Let me know if I can help.` },
  ];
}

export default function SMSModal({ rep, onClose }: SMSModalProps) {
  const templates = useMemo(() => buildTemplates(rep.first_name), [rep.first_name]);
  const [message, setMessage] = useState<string>(templates[0].body);
  const [send, setSend] = useState<SendState>({ status: "idle" });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSend = message.trim().length > 0 && Boolean(rep.phone) && send.status !== "sending";

  async function handleSend() {
    if (!rep.phone) {
      setSend({ status: "error", message: "This rep has no phone number on file." });
      return;
    }
    setSend({ status: "sending" });
    try {
      const res = await fetch("/api/send-sms", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ to: rep.phone, message: message.trim() }),
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Failed to send";
        setSend({ status: "error", message: msg });
        return;
      }
      setSend({ status: "success" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Network error";
      setSend({ status: "error", message: msg });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Text ${rep.full_name}`}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-semibold text-[#0F172A]">
              {rep.initials}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">Text {rep.full_name}</h2>
              <p className="text-sm text-[#9CA3AF]">
                {rep.phone ? (formatPhone(rep.phone) ?? rep.phone) : "No phone number on file"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#475569]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
          Quick templates
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {templates.map((tpl) => {
            const active = message === tpl.body;
            return (
              <button
                key={tpl.label}
                onClick={() => setMessage(tpl.body)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-[#2563EB] bg-[#EFF6FF] font-medium text-[#2563EB]"
                    : "border-[#E2E8F0] text-[#475569] hover:border-[#2563EB]/40 hover:text-[#2563EB]"
                }`}
              >
                {tpl.label}
              </button>
            );
          })}
        </div>

        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm text-[#0F172A] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#2563EB]"
          placeholder="Write a custom message…"
        />

        {send.status === "success" && (
          <p className="mt-3 rounded-md border border-[#16A34A]/20 bg-[#F0FDF4] px-3 py-2 text-sm font-medium text-[#16A34A]">
            ✓ Message sent to {rep.first_name || rep.full_name}.
          </p>
        )}
        {send.status === "error" && (
          <p className="mt-3 rounded-md border border-[#DC2626]/20 bg-[#FEF2F2] px-3 py-2 text-sm font-medium text-[#DC2626]">
            {send.message}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
          >
            Close
          </button>
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageSquare className="h-4 w-4" />
            {send.status === "sending" ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
