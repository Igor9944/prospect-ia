const STORAGE_KEY = "prospect_ia_api_url";

export function defaultApiBase(): string {
  if (typeof window === "undefined") return "http://127.0.0.1:3001";
  if (window.location.hostname.endsWith("github.io")) return "http://127.0.0.1:3001";
  return "";
}

export function getApiBase(): string {
  if (typeof window === "undefined") return defaultApiBase();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) return saved.replace(/\/$/, "");
  return defaultApiBase();
}

export function setApiBase(url: string) {
  localStorage.setItem(STORAGE_KEY, url.replace(/\/$/, ""));
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiBase();
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
}

export async function pingApi(): Promise<boolean> {
  try {
    const res = await apiFetch("/api/health", { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
