"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { formatCurrency } from "../lib/ui";

const inputClasses =
  "w-full rounded-lg border border-[#E2E8F0] bg-white p-2.5 text-sm text-[#0F172A] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#2563EB]";

export default function CommissionCalculator() {
  const [name,    setName]    = useState("");
  const [revenue, setRevenue] = useState("");
  const [rate,    setRate]    = useState("20");
  const [result,  setResult]  = useState<{ name: string; commission: number } | null>(null);

  function handleCalculate() {
    const rev = parseFloat(revenue) || 0;
    const pct = parseFloat(rate) || 0;
    setResult({ name: name.trim(), commission: rev * (pct / 100) });
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-[#475569]" />
        <h2 className="text-base font-semibold text-[#0F172A]">Commission Calculator</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Rep name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Revenue ($)
          </label>
          <input
            type="number"
            min="0"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="0"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            Commission rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="20"
            className={inputClasses}
          />
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="mt-4 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
      >
        Calculate
      </button>

      {result && (
        <div className="mt-4 border-t border-[#E2E8F0] pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
            {result.name ? `Commission for ${result.name}` : "Calculated commission"}
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#0F172A]">{formatCurrency(result.commission)}</p>
        </div>
      )}
    </div>
  );
}
