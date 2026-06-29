// Revenue page — connect Blackbird API (pest) and ISP portal (fiber) to populate this page.
// Set BLACKBIRD_API_KEY and ISP_API_KEY in your environment variables.
"use client";
import { useState } from "react";
import { DollarSign, TrendingUp, Users, AlertCircle } from "lucide-react";

export default function RevenuePage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-lg font-semibold text-[#0F172A]">Revenue</h1>
        <p className="mt-1 text-sm text-[#475569]">Commission tracking across all verticals</p>
      </header>
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center">
        <DollarSign className="mx-auto mb-3 h-10 w-10 text-[#CBD5E1]" />
        <p className="font-semibold text-[#0F172A]">Revenue integration not configured</p>
        <p className="mt-1 text-sm text-[#475569]">
          Connect your Blackbird API (pest) and ISP portal (fiber) to see live commission data.
        </p>
        <p className="mt-2 text-xs text-[#94A3B8]">
          Add BLACKBIRD_API_KEY and ISP_API_KEY to your environment variables.
        </p>
      </div>
    </div>
  );
}
