const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Erreur API ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export type CampaignDto = {
  id: string;
  name: string;
  status: string;
  sector: string | null;
  location: string | null;
  progress: number;
  prospects: number;
  sent: number;
  replies: number;
  reply_rate: number | null;
  date: string;
};

export type ProspectDto = {
  id: string;
  prospect_id: string;
  campaign_id: string;
  name: string;
  domain: string;
  website_url: string | null;
  contact: string;
  contact_role: string;
  email: string;
  phone: string;
  sector: string;
  location: string;
  size_category: string;
  employee_count: number | null;
  revenue: string;
  founded_year: number | null;
  description: string;
  score: number;
  status: string;
  last: string;
  justification: string;
  positive_signals: string[];
  negative_signals: string[];
  missing_data: string[];
  commercial_signals: string[];
  sources: Record<string, unknown>;
  campaign_name?: string;
  remark?: string;
  interactions?: Array<{
    id: string;
    type: string;
    content: string | null;
    created_at: string;
  }>;
};

export type StatsDto = {
  total_prospects: number;
  total_campaigns: number;
  average_score: number;
  contacted: number;
  converted: number;
  conversion_rate: number;
  statuses: Record<string, number>;
  score_histogram: number[];
  campaigns: Array<{ id: string; name: string; prospects: number; qualified: number }>;
};

export const api = {
  campaigns: () => request<CampaignDto[]>("/api/campaigns"),
  prospects: (campaignId?: string) =>
    request<ProspectDto[]>(campaignId ? `/api/prospects?campaign_id=${campaignId}` : "/api/prospects"),
  prospect: (id: string) => request<ProspectDto>(`/api/prospects/${id}`),
  stats: () => request<StatsDto>("/api/stats"),
  scoreProspect: (id: string) =>
    request<ProspectDto>(`/api/prospects/${id}/score`, { method: "POST" }),
  remarkProspect: (id: string) =>
    request<ProspectDto>(`/api/prospects/${id}/remark`, { method: "POST" }),
  scoreAll: (campaignId?: string) =>
    request<{ scored: number; errors: Array<{ id: string; error: string }>; prospects: ProspectDto[] }>(
      campaignId ? `/api/score?campaign_id=${campaignId}` : "/api/score",
      { method: "POST" },
    ),
};

export function statusClass(status: string): string {
  if (["Qualifié", "Converti", "Gagné", "Active"].includes(status)) return "status-ok";
  if (["Contacté", "Relancé", "À qualifier", "À valider", "En pause", "Pause"].includes(status)) return "status-warn";
  if (["Rejeté", "Perdu", "Hors cible"].includes(status)) return "status-bad";
  return "status-info";
}

export function scoreColor(score: number): string {
  if (score >= 8) return "#22c55e";
  if (score >= 6) return "#f59e0b";
  return "#ef4444";
}
