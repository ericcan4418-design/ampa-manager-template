"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import type { Rep } from "../lib/types";
import SMSModal from "./SMSModal";

interface RepSmsButtonProps {
  rep: Rep;
}

export default function RepSmsButton({ rep }: RepSmsButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
      >
        <MessageSquare className="h-4 w-4" /> Text {rep.first_name || rep.full_name}
      </button>
      {open && <SMSModal rep={rep} onClose={() => setOpen(false)} />}
    </>
  );
}
