# ampa-manager-template

Manager and rep dashboard for tracking team performance across verticals.

## Setup

1. Clone this repo
2. Copy `.env.example` to `.env.local` and fill in your credentials
3. Run `npm install`
4. Run `npm run dev`

## Pages

| Route | What It Shows |
|-------|---------------|
| `/` | Dashboard with team hierarchy and rep health |
| `/leaderboard` | Live rankings by vertical |
| `/teams` | Team accordion view |
| `/reps` | Grid view of all reps |
| `/rep/[id]` | Individual rep profile |
| `/revenue` | Revenue by vertical |
| `/messages` | Send SMS to reps |
| `/settings` | Platform settings |

## Stack

- **Framework:** Next.js 14, TypeScript, Tailwind CSS
- **Auth:** JWT session via cookie (see `lib/auth.ts`)
- **Database:** Supabase (for notes, etc.)
- **SMS:** Twilio
- **Rep Data:** Connect to your own API via `AMPA_API_KEY`

## Environment Variables

See `.env.example` for all required variables.
