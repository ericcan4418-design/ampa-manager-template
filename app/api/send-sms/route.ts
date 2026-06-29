import { NextResponse } from "next/server";
import { toE164 } from "../../../lib/ampa";

export const dynamic = "force-dynamic";

// Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in your .env.local or Vercel dashboard
const TWILIO_SID  = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN!;
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER!;

interface SendSmsBody {
  to?: unknown;
  message?: unknown;
}

export async function POST(request: Request) {
  let body: SendSmsBody;
  try { body = (await request.json()) as SendSmsBody; } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const to = typeof body.to === "string" ? toE164(body.to) : null;
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!to) return NextResponse.json({ error: "A valid recipient phone number is required" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });

  const params = new URLSearchParams({ To: to, From: TWILIO_FROM, Body: message });
  const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH}`).toString("base64");

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data: unknown = await res.json();
    if (!res.ok) {
      const errMessage = data && typeof data === "object" && "message" in data ? String((data as { message: unknown }).message) : "Twilio request failed";
      return NextResponse.json({ error: errMessage }, { status: res.status });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send SMS" }, { status: 502 });
  }
}
