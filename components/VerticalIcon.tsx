"use client";

import { Bug, Shield, Wifi, Bell, Sun, Briefcase, HelpCircle } from "lucide-react";
import type { VerticalKey } from "../lib/types";

const icons = {
  pest: Bug,
  life_insurance: Shield,
  fiber: Wifi,
  alarms: Bell,
  solar: Sun,
  general: Briefcase,
} as const;

interface VerticalIconProps {
  vertical: VerticalKey | string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function VerticalIcon({ vertical, size = 14, className, style }: VerticalIconProps) {
  const Icon = icons[vertical as keyof typeof icons] ?? HelpCircle;
  return <Icon size={size} className={className} style={style} />;
}
