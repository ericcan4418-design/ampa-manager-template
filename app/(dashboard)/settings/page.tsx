"use client";

import { useEffect, useMemo, useState } from "react";
import { User, Bell, Plug, SlidersHorizontal, Users } from "lucide-react";
import type { Rep } from "../../../lib/types";
import { getVerticalMeta } from "../../../lib/ampa";

type Tab = "profile" | "verticals" | "integrations" | "notifications" | "team";

const TABS: { key: Tab; label: string; icon: typeof User }[] = [
  { key: "profile",       label: "Profile",       icon: User              },
  { key: "verticals",     label: "Thresholds",    icon: SlidersHorizontal },
  { key: "integrations",  label: "Integrations",  icon: Plug              },
  { key: "notifications", label: "Notifications", icon: Bell              },
  { key: "team",          label: "Team",          icon: Users             },
];

const inputClasses =
  "w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#0F172A] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#2563EB]";

const primaryButton =
  "rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-lg font-semibold text-[#0F172A]">Settings</h1>
        <p className="mt-1 text-sm text-[#475569]">Manage your profile, integrations, and platform preferences</p>
      </header>

      <div className="mb-6 flex flex-wrap gap-1">
        {TABS.map((t) => {
          const active = t.key === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#475569] hover:bg-[#F3F4F6] hover:text-[#0F172A]",
              ].join(" ")}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "profile"       && <ProfileTab />}
      {tab === "verticals"     && <VerticalsTab />}
      {tab === "integrations"  && <IntegrationsTab />}
      {tab === "notifications" && <NotificationsTab />}
      {tab === "team"          && <TeamTab />}
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-[#0F172A]">{title}</h2>
      {desc && <p className="mt-0.5 text-sm text-[#475569]">{desc}</p>}
    </div>
  );
}

function Divider() {
  return <div className="my-6 border-t border-[#E2E8F0]" />;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
      {children}
    </label>
  );
}

function ProfileTab() {
  const [manager,  setManager]  = useState("Your Name");
  const [email,    setEmail]    = useState("admin@yourdomain.com");
  const [phone,    setPhone]    = useState("+1 (555) 000-0000");
  const [platform, setPlatform] = useState("AMPA Manager");
  const [timezone, setTimezone] = useState("America/Phoenix");

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <SectionHeader title="Profile" desc="Your personal information and display name" />
        <div className="mb-5 flex items-center gap-4">
          <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-xl font-bold text-[#2563EB]">
            YN
          </span>
          <div>
            <button className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-sm font-medium text-[#475569] transition-colors hover:border-[#2563EB]/40 hover:text-[#2563EB]">
              Change photo
            </button>
            <p className="mt-1 text-xs text-[#9CA3AF]">JPG, PNG up to 2 MB</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Full name</Label><input value={manager} onChange={(e) => setManager(e.target.value)} className={inputClasses} /></div>
          <div><Label>Email</Label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} /></div>
          <div><Label>Phone</Label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} /></div>
          <div>
            <Label>Timezone</Label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClasses}>
              <option value="America/Phoenix">America/Phoenix (MST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="America/Denver">America/Denver (MT)</option>
              <option value="America/Chicago">America/Chicago (CT)</option>
              <option value="America/New_York">America/New_York (ET)</option>
            </select>
          </div>
        </div>
        <Divider />
        <SectionHeader title="Platform" desc="Display name and branding for your instance" />
        <div className="mb-5"><Label>Platform name</Label><input value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputClasses} /></div>
        <div className="flex items-center gap-3">
          <button className={primaryButton}>Save changes</button>
          <button className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC]">Cancel</button>
        </div>
      </div>
      <div className="rounded-xl border border-[#DC2626]/20 bg-white p-6">
        <SectionHeader title="Danger Zone" desc="Irreversible account actions" />
        <div className="flex items-center justify-between rounded-lg border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">Reset all rep data</p>
            <p className="text-xs text-[#9CA3AF]">This will wipe all locally-stored pay data. Cannot be undone.</p>
          </div>
          <button className="rounded-lg border border-[#DC2626]/30 bg-white px-3 py-1.5 text-sm font-semibold text-[#DC2626] transition-colors hover:bg-[#FEF2F2]">Reset</button>
        </div>
      </div>
    </div>
  );
}

const VERTICAL_ROWS = [
  { name: "Pest Control",   metric: "Contracts",   redAt: 0, yellowAt: 2 },
  { name: "Life Insurance", metric: "Policies",    redAt: 0, yellowAt: 1 },
  { name: "Fiber",          metric: "Accounts",    redAt: 0, yellowAt: 3 },
  { name: "Solar",          metric: "Installs",    redAt: 0, yellowAt: 1 },
  { name: "Alarms",         metric: "Activations", redAt: 0, yellowAt: 2 },
  { name: "General",        metric: "Sales",       redAt: 0, yellowAt: 1 },
];

function VerticalsTab() {
  const [rows, setRows] = useState(VERTICAL_ROWS);
  function updateRow(name: string, field: "redAt" | "yellowAt", val: number) {
    setRows((prev) => prev.map((r) => (r.name === name ? { ...r, [field]: val } : r)));
  }
  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
        <SectionHeader title="Health Score Thresholds" desc="Set the minimum metric values that determine rep health." />
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0]"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              {["Vertical","Metric","Red if below","Yellow if below",""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {rows.map((row) => (
                <tr key={row.name} className="bg-white">
                  <td className="px-4 py-3 font-medium text-[#0F172A]">{row.name}</td>
                  <td className="px-4 py-3 text-[#475569]">{row.metric}</td>
                  <td className="px-4 py-3"><input type="number" min={0} value={row.redAt} onChange={(e) => updateRow(row.name,"redAt",Number(e.target.value))} className="w-20 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#DC2626]" /></td>
                  <td className="px-4 py-3"><input type="number" min={0} value={row.yellowAt} onChange={(e) => updateRow(row.name,"yellowAt",Number(e.target.value))} className="w-20 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]" /></td>
                  <td className="px-4 py-3 text-right"><button className="text-xs font-semibold text-[#2563EB] hover:opacity-80">Save</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      </div>
    </div>
  );
}

const PLATFORM_INTEGRATIONS = [
  { icon:"📱", name:"Twilio", category:"SMS / Voice", desc:"Send SMS messages and voice calls to your reps directly from the platform.", fields:[{label:"Account SID",placeholder:"ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",type:"text"},{label:"Auth Token",placeholder:"••••••••••••••••",type:"password"},{label:"From Number",placeholder:"+15550001234",type:"tel"}] },
  { icon:"🔗", name:"AMPA Network API", category:"Platform", desc:"Core connection to AMPA Network. Required to sync reps, onboarding status, and activity.", fields:[{label:"API Base URL",placeholder:"https://api.ampanetwork.com",type:"url"},{label:"API Key",placeholder:"••••••••••••",type:"password"}] },
];

const REVENUE_INTEGRATION_CARDS = [
  { icon:"🐛", name:"Blackbird",         vertical:"Pest Control",   desc:"Track pest control contract values" },
  { icon:"🛡️", name:"Insurance Carriers",vertical:"Life Insurance", desc:"Track life insurance policy values" },
  { icon:"🌐", name:"ISP Portals",       vertical:"Fiber",          desc:"Track fiber account submissions"   },
];

function IntegrationsTab() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">Platform Integrations</p>
        <div className="space-y-4">
          {PLATFORM_INTEGRATIONS.map((it) => (
            <div key={it.name} className="rounded-xl border border-[#E2E8F0] bg-white p-5">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-xl">{it.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between"><p className="font-semibold text-[#0F172A]">{it.name}</p><span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[11px] font-semibold text-[#9CA3AF]">Not Connected</span></div>
                  <p className="text-xs text-[#9CA3AF]">{it.category}</p>
                  <p className="mt-1.5 text-sm text-[#475569]">{it.desc}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {it.fields.map((f) => (<div key={f.label}><Label>{f.label}</Label><input type={f.type} placeholder={f.placeholder} className={inputClasses} /></div>))}
              </div>
              <button className={`${primaryButton} mt-4`}>Save &amp; Connect</button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">Revenue Integrations</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {REVENUE_INTEGRATION_CARDS.map((it) => (
            <div key={it.name} className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4F6] text-xl" aria-hidden>{it.icon}</span>
              <p className="mt-3 font-semibold text-[#0F172A]">{it.name}</p>
              <p className="text-xs text-[#9CA3AF]">{it.vertical}</p>
              <p className="mt-2 text-sm text-[#475569]">{it.desc}</p>
              <div className="mt-4"><Label>API key</Label><input type="password" placeholder="••••••••••••" className={inputClasses} /></div>
              <button className={`${primaryButton} mt-4`}>Connect</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span className="text-sm font-medium text-[#0F172A]">{label}</span>
      <span className="relative inline-flex flex-shrink-0">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-[#E2E8F0] transition-colors peer-checked:bg-[#2563EB]" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function NotificationsTab() {
  const [phone, setPhone] = useState("");
  return (
    <div className="max-w-lg rounded-xl border border-[#E2E8F0] bg-white p-5">
      <SectionHeader title="Notification Preferences" />
      <div className="divide-y divide-[#E2E8F0]">
        <Toggle label="Push notification when rep goes red" defaultOn />
        <Toggle label="Weekly team summary" defaultOn />
        <Toggle label="Daily leaderboard digest" defaultOn={false} />
      </div>
      <div className="mt-5 border-t border-[#E2E8F0] pt-5">
        <Label>SMS recipient for weekly summary</Label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={inputClasses} />
      </div>
    </div>
  );
}

const ROLES = ["Rep","Veteran","Team Lead","Manager"];

function TeamTab() {
  const [reps, setReps] = useState<Rep[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/reps").then((r)=>r.json()).then((data:{reps?:Rep[];error?:string})=>{
      if(cancelled)return;
      if(data.reps)setReps(data.reps);
      else setLoadError(data.error??"Failed to load reps");
    }).catch((e:unknown)=>{if(!cancelled)setLoadError(e instanceof Error?e.message:"Network error");});
    return()=>{cancelled=true;};
  },[]);
  const stepLabel=useMemo(()=>({complete:"Onboarded",in_progress:"Onboarding",not_started:"Not started"}),[]);
  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">Team Members</p>
      {loadError&&<div className="mb-4 rounded-lg border border-[#DC2626]/20 bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-[#DC2626]">Couldn&apos;t load reps: {loadError}</div>}
      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
            {["Name","Role","Vertical","Onboarding","Actions"].map((h)=>(<th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">{h}</th>))}
          </tr></thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {reps.length===0?(<tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-[#9CA3AF]">{loadError?"—":"Loading reps…"}</td></tr>):(
              reps.map((rep)=>{
                const vertical=getVerticalMeta(rep.vertical);
                return(<tr key={rep.id} className="bg-white hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3.5"><span className="flex items-center gap-2.5"><span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-xs font-semibold text-[#0F172A]">{rep.initials}</span><span className="font-medium text-[#0F172A]">{rep.full_name}</span></span></td>
                  <td className="px-4 py-3.5"><select defaultValue="Rep" className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-sm font-medium text-[#0F172A] outline-none transition-colors focus:border-[#2563EB]" aria-label={`Role for ${rep.full_name}`}>{ROLES.map((r)=>(<option key={r} value={r}>{r}</option>))}</select></td>
                  <td className="px-4 py-3.5 text-[#475569]">{vertical.label}</td>
                  <td className="px-4 py-3.5 text-[#475569]">{stepLabel[rep.onboarding_step]}</td>
                  <td className="px-4 py-3.5"><button className="text-xs font-semibold text-[#2563EB] transition-opacity hover:opacity-80">Promote</button></td>
                </tr>);
              })
            )}
          </tbody>
        </table>
      </div></div>
      <p className="mt-3 text-xs text-[#9CA3AF]">Role changes sync with AMPA Network</p>
    </div>
  );
}
