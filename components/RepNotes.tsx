"use client";

import { useEffect, useState, useRef } from "react";
import { StickyNote, Plus, Loader2 } from "lucide-react";

interface Note {
  id: string;
  rep_id: string;
  note: string;
  created_at: string;
  created_by: string;
}

function formatNoteDate(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    year:   "numeric",
    month:  "short",
    day:    "numeric",
    hour:   "numeric",
    minute: "2-digit",
  });
}

export default function RepNotes({ repId }: { repId: string }) {
  const [notes, setNotes]       = useState<Note[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [text, setText]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function loadNotes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${repId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setNotes(json.notes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadNotes(); }, [repId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/notes/${repId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ note: trimmed }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      setNotes((prev) => [json.note, ...prev]);
      setText("");
      textareaRef.current?.focus();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="h-5 w-5 text-[#475569]" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-[#0F172A]">Notes</h2>
        {!loading && (
          <span className="ml-auto rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-medium text-[#475569]">
            {notes.length}
          </span>
        )}
      </div>

      {/* Add note form */}
      <form onSubmit={handleAddNote} className="mb-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a note about this rep…"
            rows={2}
            className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] resize-none"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add Note
          </button>
        </div>
        {submitError && (
          <p className="mt-1.5 text-xs text-[#DC2626]">{submitError}</p>
        )}
      </form>

      {/* Notes list */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-[#94A3B8]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
          {error}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] py-8 text-center">
          <StickyNote className="mb-2 h-8 w-8 text-[#CBD5E1]" strokeWidth={1} />
          <p className="text-sm text-[#94A3B8]">No notes yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3"
            >
              <p className="text-sm text-[#0F172A] whitespace-pre-wrap">{note.note}</p>
              <p className="mt-1.5 text-xs text-[#94A3B8]">
                {formatNoteDate(note.created_at)} · {note.created_by}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
