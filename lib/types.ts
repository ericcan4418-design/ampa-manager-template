export type OnboardingStep = "complete" | "in_progress" | "not_started";
export type HealthStatus = "green" | "yellow" | "red";
export type VerticalKey = "pest" | "life_insurance" | "alarms" | "solar" | "fiber" | "general" | "unknown";

export interface AmpaUser {
  user_id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  default_vertical: string | null;
  onboarding_step: string | null;
  onboarding_in_progress: boolean | null;
  onboarded_at: string | null;
  created_at: string | null;
  last_activity_at: string | null;
  level_of_experience: string | null;
  google_calendar_connected: boolean | null;
  microsoft_calendar_connected: boolean | null;
  direct_recruiter: string | null;
  is_banned: boolean | null;
  contracts_signed: string[] | null;
  drivers_license_url: string | null;
  background_check_url: string | null;
}

export interface Rep {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  initials: string;
  vertical: VerticalKey;
  onboarding_step: OnboardingStep;
  health: HealthStatus;
  phone: string | null;
  email: string | null;
  address: string | null;
  onboarded_at: string | null;
  created_at: string | null;
  last_activity_at: string | null;
  level_of_experience: string | null;
  google_calendar_connected: boolean;
  microsoft_calendar_connected: boolean;
  direct_recruiter: string | null;
  contracts_signed?: string[];
  drivers_license_url?: string | null;
  background_check_url?: string | null;
  onboarding_in_progress?: boolean;
  accounts?: number;
  chargebacks?: number;
  commissionRate?: number;
  avgDealValue?: number;
}

export interface RepPay {
  accounts?: number;
  chargebacks?: number;
  commissionRate?: number;
  avgDealValue?: number;
}
