import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
}

export async function GET(_req: NextRequest, { params }: { params: { repId: string } }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("rep_notes")
    .select("id, rep_id, note, created_at, created_by")
    .eq("rep_id", params.repId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: { repId: string } }) {
  let body: { note?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const note = (body.note ?? "").trim();
  if (!note) return NextResponse.json({ error: "Note text is required" }, { status: 400 });

  const supabase = getSupabase();
  const { data, error } = await supabase.from("rep_notes").insert({ rep_id: params.repId, note, created_by: "manager" }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data }, { status: 201 });
}
