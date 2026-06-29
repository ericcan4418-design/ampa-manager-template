"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError(res.status === 500 ? "Server configuration error. Contact support." : "Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[52%] relative bg-[#0D1525] flex-col justify-between p-12">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-white font-semibold text-[13px]">AM</span>
          </div>
          <span className="text-white/80 font-medium text-[15px]">AMPA Manager</span>
        </div>
        <div className="relative z-10 space-y-8">
          <h1 className="text-white text-[38px] font-bold leading-[1.2]">
            Built for the people<br />running the field.
          </h1>
          <p className="text-white/40 text-[15px] leading-relaxed max-w-[340px]">
            Real-time team performance, rep health scores, and pipeline visibility.
          </p>
        </div>
        <p className="relative z-10 text-white/20 text-[13px]">Powered by your platform</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] px-6 py-12">
        <div className="w-full max-w-[380px] space-y-8">
          <div className="space-y-1">
            <h2 className="text-[#0F172A] text-[22px] font-bold">Welcome back</h2>
            <p className="text-[#64748B] text-sm">Sign in to your manager account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {error && (
              <div className="flex items-center gap-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3.5 py-3">
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                <p className="text-[#DC2626] text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-[#0F172A]">Email</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourdomain.com" className="w-full h-10 px-3.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-[#0F172A]">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full h-10 px-3.5 pr-10 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !email || !password} className="w-full h-10 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Sign in"}
            </button>
          </form>

          <p className="text-center text-[#94A3B8] text-xs">
            Access is restricted to authorized managers.{" "}
            <a href="mailto:support@yourdomain.com" className="text-[#475569] hover:text-[#0F172A] underline">Request access</a>
          </p>
        </div>
      </div>
    </div>
  );
}
